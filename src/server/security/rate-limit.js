// Rate limiting with the generic cell rate algorithm (GCRA).
//
// Each key stores one timestamp, the "theoretical arrival time" (TAT) of the
// next request. A request is allowed when pushing the TAT forward by one
// emission interval keeps it within the burst tolerance. That gives smooth,
// exact limits with one row per key and a single atomic statement per check,
// with none of the edge bursts of fixed windows.
//
// State lives in Upstash Redis when configured (lowest latency, shared across
// regions) and otherwise in Postgres, which every deployment already has.

import { config } from '../config.js';
import { prisma } from '../db.js';
import { log } from '../log.js';
import { tooMany } from '../errors.js';

// name → { limit, periodSeconds }. `limit` requests per `periodSeconds`,
// all of which may arrive in a burst.
export const POLICIES = Object.freeze({
  'auth.sign-in.ip': { limit: 20, periodSeconds: 15 * 60 },
  'auth.sign-in.account': { limit: 6, periodSeconds: 15 * 60 },
  'auth.sign-up': { limit: 6, periodSeconds: 60 * 60 },
  'auth.password': { limit: 5, periodSeconds: 15 * 60 },
  'otp.send': { limit: 3, periodSeconds: 10 * 60 },
  'otp.verify': { limit: 10, periodSeconds: 10 * 60 },
  'guest.write': { limit: 10, periodSeconds: 10 * 60 },
  'member.write': { limit: 60, periodSeconds: 60 },
  'messages.send': { limit: 30, periodSeconds: 60 },
  'money.move': { limit: 12, periodSeconds: 60 },
  'upload': { limit: 20, periodSeconds: 10 * 60 },
  'report': { limit: 10, periodSeconds: 60 * 60 },
  'public.read': { limit: 240, periodSeconds: 60 },
  'checkin.scan': { limit: 180, periodSeconds: 60 },
  'track.view': { limit: 1, periodSeconds: 30 * 60 },
});

function parameters(policyName) {
  const policy = POLICIES[policyName];
  if (!policy) throw new Error(`Unknown rate limit policy: ${policyName}`);
  const periodMs = policy.periodSeconds * 1000;
  return { emissionMs: periodMs / policy.limit, toleranceMs: periodMs };
}

async function checkPostgres(key, emissionMs, toleranceMs) {
  const rows = await prisma.$queryRaw`
    INSERT INTO "RateLimitBucket" ("key", "tat")
    VALUES (${key}, clock_timestamp() + ${emissionMs}::double precision * interval '1 millisecond')
    ON CONFLICT ("key") DO UPDATE
       SET "tat" = GREATEST("RateLimitBucket"."tat", clock_timestamp()) + ${emissionMs}::double precision * interval '1 millisecond'
     WHERE GREATEST("RateLimitBucket"."tat", clock_timestamp())
           + ${emissionMs}::double precision * interval '1 millisecond'
           - clock_timestamp() <= ${toleranceMs}::double precision * interval '1 millisecond'
    RETURNING "tat"`;
  if (rows.length) return { allowed: true, retryAfterMs: 0 };

  const [current] = await prisma.$queryRaw`
    SELECT EXTRACT(EPOCH FROM ("tat" - clock_timestamp())) * 1000 AS "aheadMs"
      FROM "RateLimitBucket" WHERE "key" = ${key}`;
  const aheadMs = Number(current?.aheadMs || 0);
  return { allowed: false, retryAfterMs: Math.max(0, aheadMs + emissionMs - toleranceMs) };
}

const GCRA_LUA = `
local now = tonumber(ARGV[1])
local emission = tonumber(ARGV[2])
local tolerance = tonumber(ARGV[3])
local tat = tonumber(redis.call('GET', KEYS[1]) or now)
if tat < now then tat = now end
local next_tat = tat + emission
if next_tat - now > tolerance then
  return {0, math.ceil(next_tat - tolerance - now)}
end
redis.call('SET', KEYS[1], next_tat, 'PX', math.ceil(next_tat - now))
return {1, 0}`;

async function checkRedis({ url, token }, key, emissionMs, toleranceMs) {
  const response = await fetch(url, {
    method: 'POST',
    headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json' },
    body: JSON.stringify(['EVAL', GCRA_LUA, '1', `rl:${key}`, String(Date.now()), String(emissionMs), String(toleranceMs)]),
    signal: AbortSignal.timeout(1500),
  });
  if (!response.ok) throw new Error(`Upstash responded ${response.status}`);
  const { result } = await response.json();
  return { allowed: Number(result[0]) === 1, retryAfterMs: Number(result[1]) || 0 };
}

// Returns { allowed, retryAfterMs }. If the limiter's store is unreachable
// the request is allowed and the failure logged: an outage of the limiter
// must not become an outage of the product.
export async function checkRateLimit(policyName, identity) {
  const { emissionMs, toleranceMs } = parameters(policyName);
  const key = `${policyName}:${identity}`.slice(0, 200);
  try {
    const redis = config().redis;
    return redis
      ? await checkRedis(redis, key, emissionMs, toleranceMs)
      : await checkPostgres(key, emissionMs, toleranceMs);
  } catch (error) {
    log.warn('rate limiter unavailable', { policyName, error });
    return { allowed: true, retryAfterMs: 0 };
  }
}

export async function enforceRateLimit(policyName, identity) {
  const result = await checkRateLimit(policyName, identity);
  if (!result.allowed) throw tooMany(Math.max(1, Math.ceil(result.retryAfterMs / 1000)));
}

export async function purgeExpiredBuckets() {
  const { count } = await prisma.rateLimitBucket.deleteMany({ where: { tat: { lt: new Date() } } });
  return count;
}
