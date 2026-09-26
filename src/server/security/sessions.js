// Opaque, server-side sessions.
//
// The browser holds 32 random bytes in an HttpOnly cookie; the database holds
// only their SHA-256. A stolen database therefore contains no usable session,
// and signing out, changing a password or suspending an account ends access
// immediately, which a self-contained JWT cannot do.

import { prisma } from '../db.js';
import { randomToken, sha256 } from './crypto.js';

export const SESSION_DAYS = 30;
const TOUCH_INTERVAL_MS = 60 * 60 * 1000;

export function sessionCookieName(production = process.env.NODE_ENV === 'production') {
  // The __Host- prefix makes browsers refuse the cookie unless it is Secure,
  // host-only and scoped to "/", which blocks subdomain cookie injection.
  return production ? '__Host-tz_session' : 'tz_session';
}

export function sessionCookieOptions(expiresAt, production = process.env.NODE_ENV === 'production') {
  return { httpOnly: true, secure: production, sameSite: 'lax', path: '/', expires: expiresAt };
}

const VIEWER_SELECT = {
  id: true,
  email: true,
  name: true,
  handle: true,
  phone: true,
  phoneVerifiedAt: true,
  city: true,
  country: true,
  locale: true,
  currency: true,
  avatarUrl: true,
  role: true,
  status: true,
  twoFactorEnabled: true,
  createdAt: true,
  provider: { select: { id: true, slug: true, name: true, status: true, verifiedAt: true } },
};

export async function createSession(userId, { ipAddress, userAgent, mfaPending = false } = {}) {
  const token = randomToken(32);
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);
  const session = await prisma.session.create({
    data: {
      userId,
      tokenHash: sha256(token),
      mfaPending,
      ipAddress: ipAddress?.slice(0, 64),
      userAgent: userAgent?.slice(0, 256),
      expiresAt,
    },
    select: { id: true },
  });
  return { token, expiresAt, sessionId: session.id };
}

// Resolves a raw cookie value to { session, user } or null. Sliding expiry:
// an active session is extended, but the row is written at most hourly.
export async function resolveSession(token) {
  if (!token || typeof token !== 'string' || token.length > 128) return null;

  const session = await prisma.session.findUnique({
    where: { tokenHash: sha256(token) },
    select: {
      id: true,
      mfaPending: true,
      expiresAt: true,
      revokedAt: true,
      lastSeenAt: true,
      user: { select: VIEWER_SELECT },
    },
  });

  const now = Date.now();
  if (!session || session.revokedAt || session.expiresAt.getTime() <= now) return null;
  if (session.user.status !== 'ACTIVE') return null;

  if (now - session.lastSeenAt.getTime() > TOUCH_INTERVAL_MS) {
    const expiresAt = new Date(now + SESSION_DAYS * 24 * 60 * 60 * 1000);
    await prisma.session
      .update({ where: { id: session.id }, data: { lastSeenAt: new Date(now), expiresAt } })
      .catch(() => {});
    await prisma.user.update({ where: { id: session.user.id }, data: { lastSeenAt: new Date(now) } }).catch(() => {});
  }

  const { user, ...rest } = session;
  return { session: rest, user };
}

export async function revokeSessionByToken(token) {
  if (!token) return;
  await prisma.session.updateMany({
    where: { tokenHash: sha256(token), revokedAt: null },
    data: { revokedAt: new Date() },
  });
}

export async function revokeSession(userId, sessionId) {
  const { count } = await prisma.session.updateMany({
    where: { id: sessionId, userId, revokedAt: null },
    data: { revokedAt: new Date() },
  });
  return count > 0;
}

export async function revokeAllSessions(userId, { exceptSessionId } = {}) {
  const { count } = await prisma.session.updateMany({
    where: { userId, revokedAt: null, ...(exceptSessionId ? { id: { not: exceptSessionId } } : {}) },
    data: { revokedAt: new Date() },
  });
  return count;
}

export async function completeMfa(sessionId) {
  await prisma.session.update({ where: { id: sessionId }, data: { mfaPending: false } });
}

export async function listSessions(userId) {
  return prisma.session.findMany({
    where: { userId, revokedAt: null, expiresAt: { gt: new Date() } },
    orderBy: { lastSeenAt: 'desc' },
    select: { id: true, userAgent: true, ipAddress: true, createdAt: true, lastSeenAt: true },
  });
}

export async function purgeDeadSessions() {
  const cutoff = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const { count } = await prisma.session.deleteMany({
    where: { OR: [{ expiresAt: { lt: cutoff } }, { revokedAt: { lt: cutoff } }] },
  });
  return count;
}
