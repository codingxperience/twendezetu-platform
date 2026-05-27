// Session-based auth: bcrypt-hashed passwords, JWT in an HTTP-only cookie,
// session row in the DB for revocation. JWTs are signed with AUTH_SECRET and
// expire after 30 days; the matching Session row holds the expiry server-side
// so signOut can invalidate a token even if the cookie sticks around.

import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs';
import { SignJWT, jwtVerify } from 'jose';
import { prisma } from './prisma';

const SESSION_COOKIE = 'tz_session';
const SESSION_DAYS = 30;

function secretKey() {
  const s = process.env.AUTH_SECRET;
  if (!s || s.length < 32) {
    throw new Error('AUTH_SECRET must be at least 32 characters. See .env.example.');
  }
  return new TextEncoder().encode(s);
}

export async function hashPassword(plain) {
  return bcrypt.hash(plain, 10);
}

export async function verifyPassword(plain, hash) {
  return bcrypt.compare(plain, hash);
}

async function signToken(payload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DAYS}d`)
    .sign(secretKey());
}

async function verifyToken(token) {
  try {
    const { payload } = await jwtVerify(token, secretKey());
    return payload;
  } catch {
    return null;
  }
}

export async function createSession(userId, req) {
  const token = await signToken({ uid: userId });
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);
  await prisma.session.create({
    data: {
      userId,
      token,
      expiresAt,
      userAgent: req?.headers?.get?.('user-agent')?.slice(0, 200),
      ipAddress: req?.headers?.get?.('x-forwarded-for')?.split(',')[0]?.trim(),
    },
  });
  const jar = await cookies();
  jar.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    expires: expiresAt,
  });
  return token;
}

export async function destroySession() {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (token) {
    await prisma.session.deleteMany({ where: { token } }).catch(() => {});
    jar.delete(SESSION_COOKIE);
  }
}

export async function getCurrentUser() {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const claims = await verifyToken(token);
  if (!claims?.uid) return null;

  const session = await prisma.session.findUnique({ where: { token } });
  if (!session || session.expiresAt < new Date()) return null;

  const user = await prisma.user.findUnique({
    where: { id: claims.uid },
    select: {
      id: true, email: true, name: true, city: true, role: true, phone: true,
      avatarUrl: true, createdAt: true,
      vendor: { select: { id: true, slug: true, name: true } },
    },
  });
  return user;
}

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) {
    const err = new Error('Authentication required');
    err.status = 401;
    throw err;
  }
  return user;
}

// API-route helper that catches the thrown 401 from requireUser
export function authError() {
  return new Response(JSON.stringify({ error: 'Authentication required' }), {
    status: 401,
    headers: { 'content-type': 'application/json' },
  });
}
