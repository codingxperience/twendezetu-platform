// Six-digit one-time codes for phone verification and two-step sign-in.
// Codes are stored as an HMAC under a server-held key: six digits are only a
// million possibilities, so a plain hash would fall to an offline search.
// Each code allows five guesses and lives for ten minutes.

import { randomInt } from 'node:crypto';
import { prisma } from '../db.js';
import { hmac, safeEqual } from './crypto.js';
import { badRequest, conflict } from '../errors.js';

const TTL_MS = 10 * 60 * 1000;
const MAX_ATTEMPTS = 5;

function digest(purpose, target, code) {
  return hmac('otp', `${purpose}:${target}:${code}`).toString('hex');
}

export async function issueCode(db, { purpose, target, userId }) {
  const code = String(randomInt(0, 1_000_000)).padStart(6, '0');
  await db.oneTimeCode.updateMany({
    where: { purpose, target, consumedAt: null },
    data: { consumedAt: new Date() },
  });
  await db.oneTimeCode.create({
    data: {
      purpose,
      target,
      userId,
      codeHash: digest(purpose, target, code),
      expiresAt: new Date(Date.now() + TTL_MS),
    },
  });
  return code;
}

export async function consumeCode({ purpose, target, code, userId }) {
  const cleaned = String(code || '').replace(/\D/g, '');
  if (cleaned.length !== 6) throw badRequest('Enter the 6-digit code.');

  const record = await prisma.oneTimeCode.findFirst({
    where: { purpose, target, consumedAt: null, expiresAt: { gt: new Date() }, ...(userId ? { userId } : {}) },
    orderBy: { createdAt: 'desc' },
  });
  if (!record) throw badRequest('That code has expired. Request a new one.');
  if (record.attempts >= MAX_ATTEMPTS) throw conflict('Too many wrong codes. Request a new one.', 'otp_locked');

  // Count the attempt before comparing, so parallel guesses cannot exceed
  // the allowance.
  const { count } = await prisma.oneTimeCode.updateMany({
    where: { id: record.id, attempts: { lt: MAX_ATTEMPTS }, consumedAt: null },
    data: { attempts: { increment: 1 } },
  });
  if (!count) throw conflict('Too many wrong codes. Request a new one.', 'otp_locked');

  if (!safeEqual(record.codeHash, digest(purpose, target, cleaned))) {
    const left = MAX_ATTEMPTS - record.attempts - 1;
    throw badRequest(left > 0 ? `That code is not right. ${left} ${left === 1 ? 'try' : 'tries'} left.` : 'Too many wrong codes. Request a new one.');
  }

  const consumed = await prisma.oneTimeCode.updateMany({
    where: { id: record.id, consumedAt: null },
    data: { consumedAt: new Date() },
  });
  if (!consumed.count) throw badRequest('That code was already used.');
  return true;
}
