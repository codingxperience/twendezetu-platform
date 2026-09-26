// The single entry point for API route handlers.
//
//   export const POST = route({ auth: 'required', body: Schema, idempotent: true }, async (ctx) => { … });
//
// In order, every request gets: a request id; a same-origin check on
// state-changing methods (CSRF); session resolution; role checks; rate
// limiting; JSON body and query validation; Idempotency-Key replay for
// operations that move money; and one error format:
//   { "error": { "code": "…", "message": "…", "details": … } }

import 'server-only';
import { cookies } from 'next/headers';
import { after } from 'next/server';
import { ZodError } from 'zod';
import { prisma } from './db.js';
import { config } from './config.js';
import { log } from './log.js';
import { AppError, badRequest, conflict, forbidden, fromDatabaseError, invalid, unauthorized } from './errors.js';
import { enforceRateLimit } from './security/rate-limit.js';
import { resolveSession, sessionCookieName, sessionCookieOptions } from './security/sessions.js';
import { randomToken, sha256 } from './security/crypto.js';

const MAX_JSON_BYTES = 64 * 1024;
const MUTATING = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

export function json(data, status = 200, headers = {}) {
  return new Response(JSON.stringify(data, (_key, value) => (typeof value === 'bigint' ? Number(value) : value)), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', ...headers },
  });
}

function errorResponse(error, requestId) {
  const headers = { 'x-request-id': requestId, 'cache-control': 'no-store' };
  if (error.status === 429 && error.details?.retryAfterSeconds) headers['retry-after'] = String(error.details.retryAfterSeconds);
  return json({ error: { code: error.code, message: error.message, details: error.details } }, error.status, headers);
}

export function clientIp(req) {
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim().slice(0, 64);
  return (req.headers.get('x-real-ip') || '0.0.0.0').slice(0, 64);
}

function assertSameOrigin(req) {
  const origin = req.headers.get('origin');
  if (origin) {
    let originHost;
    try {
      originHost = new URL(origin).host;
    } catch {
      throw forbidden('Cross-site request blocked.');
    }
    const host = req.headers.get('x-forwarded-host') || req.headers.get('host');
    const appHost = new URL(config().appUrl).host;
    if (originHost !== host && originHost !== appHost) throw forbidden('Cross-site request blocked.');
    return;
  }
  // No Origin header: only browsers send Sec-Fetch-Site, and they send
  // "cross-site" for exactly the requests CSRF relies on.
  if (req.headers.get('sec-fetch-site') === 'cross-site') throw forbidden('Cross-site request blocked.');
}

async function readJson(req) {
  const text = await req.text();
  if (text.length > MAX_JSON_BYTES) throw badRequest('Request body is too large.');
  if (!text) return { raw: '', value: {} };
  try {
    return { raw: text, value: JSON.parse(text) };
  } catch {
    throw badRequest('Request body must be valid JSON.');
  }
}

function formatZod(error) {
  const first = error.issues[0];
  const field = first?.path?.join('.');
  const message = first ? (field ? `${humanize(field)}: ${first.message}` : first.message) : 'Please check the form.';
  return invalid(message, error.issues.map((issue) => ({ path: issue.path.join('.'), message: issue.message })));
}

function humanize(field) {
  return field.replace(/([A-Z])/g, ' $1').replace(/^./, (c) => c.toUpperCase()).replace(/\.(\d+)/g, ' #$1');
}

function defaultLimits(method, viewer) {
  if (!MUTATING.has(method)) return [{ policy: 'public.read', by: 'ip' }];
  return viewer ? [{ policy: 'member.write', by: 'user' }] : [{ policy: 'guest.write', by: 'ip' }];
}

async function applyLimits(limits, { ip, viewer }) {
  for (const { policy, by } of limits) {
    const identity = by === 'user' && viewer ? `u:${viewer.id}` : `ip:${ip}`;
    await enforceRateLimit(policy, identity);
  }
}

async function beginIdempotent(req, scope, rawBody) {
  const key = req.headers.get('idempotency-key');
  if (!key) return null;
  if (key.length < 8 || key.length > 100) throw badRequest('Idempotency-Key must be 8–100 characters.');
  const requestHash = sha256(`${req.method} ${new URL(req.url).pathname} ${rawBody}`);
  try {
    await prisma.idempotencyRecord.create({ data: { scope, key, requestHash } });
    return { scope, key };
  } catch (error) {
    if (error?.code !== 'P2002') throw error;
    const existing = await prisma.idempotencyRecord.findUnique({ where: { scope_key: { scope, key } } });
    if (!existing) throw conflict('Please retry the request.', 'idempotency_race');
    if (existing.requestHash !== requestHash) throw invalid('This Idempotency-Key was already used for a different request.');
    if (existing.status == null) throw conflict('This request is still being processed.', 'request_in_progress');
    return { replay: json(existing.response, existing.status, { 'idempotent-replayed': 'true' }) };
  }
}

async function finishIdempotent(record, status, body) {
  if (!record || record.replay) return;
  if (status >= 500) {
    await prisma.idempotencyRecord.delete({ where: { scope_key: record } }).catch(() => {});
    return;
  }
  await prisma.idempotencyRecord.update({ where: { scope_key: record }, data: { status, response: body } }).catch(() => {});
}

// Work that should happen soon after a change, without a user waiting on it
// and without depending on a frequent cron: delivering queued notifications
// and releasing lapsed checkout holds. Throttled per server instance.
let lastSweep = 0;
function sweepSoon() {
  if (Date.now() - lastSweep < 20_000) return;
  lastSweep = Date.now();
  after(async () => {
    try {
      const [{ dispatchDue }, { expireStaleOrders }] = await Promise.all([import('./notify/dispatch.js'), import('./services/checkout.js')]);
      await dispatchDue({ batchSize: 25 });
      await expireStaleOrders();
    } catch (error) {
      log.warn('background sweep failed', { error });
    }
  });
}

export function route(options, handler) {
  const {
    auth = 'optional',
    roles,
    body: bodySchema,
    query: querySchema,
    limit,
    idempotent = false,
    csrf = true,
    allowPendingMfa = false,
  } = options;

  return async function handle(req, context) {
    const requestId = req.headers.get('x-request-id') || randomToken(9);
    const started = Date.now();
    const method = req.method.toUpperCase();
    const ip = clientIp(req);
    let idempotency = null;

    try {
      if (csrf && MUTATING.has(method)) assertSameOrigin(req);

      let viewer = null;
      let session = null;
      if (auth !== 'none') {
        const jar = await cookies();
        const resolved = await resolveSession(jar.get(sessionCookieName())?.value);
        if (resolved && (!resolved.session.mfaPending || allowPendingMfa)) {
          viewer = resolved.user;
          session = resolved.session;
        }
      }
      if (auth === 'required' && !viewer) throw unauthorized();
      if (roles && (!viewer || !roles.includes(viewer.role))) throw forbidden();

      const limits = limit === false ? [] : limit || defaultLimits(method, viewer);
      await applyLimits(limits, { ip, viewer });

      const params = (await context?.params) || {};

      let rawBody = '';
      let body;
      if (MUTATING.has(method) && bodySchema) {
        const parsed = await readJson(req);
        rawBody = parsed.raw;
        body = bodySchema.parse(parsed.value);
      }
      const url = new URL(req.url);
      const query = querySchema ? querySchema.parse(Object.fromEntries(url.searchParams)) : Object.fromEntries(url.searchParams);

      if (idempotent) {
        idempotency = await beginIdempotent(req, viewer ? `u:${viewer.id}` : `ip:${ip}`, rawBody);
        if (idempotency?.replay) return idempotency.replay;
      }

      const result = await handler({ req, params, body, query, viewer, session, ip, requestId, url });

      if (result instanceof Response) {
        result.headers.set('x-request-id', requestId);
        return result;
      }
      const status = result?.__status || (method === 'POST' ? 201 : 200);
      const payload = result?.__status ? result.body : result ?? { ok: true };
      await finishIdempotent(idempotency, status, payload);
      if (MUTATING.has(method)) sweepSoon();
      return json(payload, status, {
        'x-request-id': requestId,
        'cache-control': viewer ? 'private, no-store' : 'no-store',
      });
    } catch (caught) {
      let error = caught;
      if (error instanceof ZodError) error = formatZod(error);
      if (!(error instanceof AppError)) error = fromDatabaseError(error) || error;

      if (error instanceof AppError) {
        await finishIdempotent(idempotency, error.status, { error: { code: error.code, message: error.message, details: error.details } });
        return errorResponse(error, requestId);
      }

      await finishIdempotent(idempotency, 500, null);
      log.error('unhandled route error', { requestId, method, path: new URL(req.url).pathname, ms: Date.now() - started, error });
      return errorResponse(new AppError(500, 'server_error', 'Something went wrong on our side. Please try again.'), requestId);
    }
  };
}

// Explicit status for handlers that need one: `return withStatus(200, data)`.
export function withStatus(status, body) {
  return { __status: status, body };
}

export async function setSessionCookie(token, expiresAt) {
  const jar = await cookies();
  jar.set(sessionCookieName(), token, sessionCookieOptions(expiresAt));
}

export async function clearSessionCookie() {
  const jar = await cookies();
  jar.delete(sessionCookieName());
}

export async function readSessionCookie() {
  const jar = await cookies();
  return jar.get(sessionCookieName())?.value;
}
