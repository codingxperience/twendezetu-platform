// Password hashing with scrypt (memory-hard, built into Node). Hashes from the
// first release were bcrypt; those still verify and are upgraded to scrypt the
// next time their owner signs in.

import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';
import bcrypt from 'bcryptjs';

const scrypt = promisify(scryptCallback);

const COST = 15; // N = 2^15
const BLOCK_SIZE = 8;
const PARALLELISM = 1;
const KEY_LENGTH = 64;
const MAX_MEMORY = 128 * 1024 * 1024;

export const PASSWORD_MIN = 10;
export const PASSWORD_MAX = 128;

export async function hashPassword(plain) {
  const salt = randomBytes(16);
  const key = await scrypt(plain.normalize('NFKC'), salt, KEY_LENGTH, {
    N: 2 ** COST,
    r: BLOCK_SIZE,
    p: PARALLELISM,
    maxmem: MAX_MEMORY,
  });
  return ['scrypt', COST, BLOCK_SIZE, PARALLELISM, salt.toString('base64url'), key.toString('base64url')].join('$');
}

export async function verifyPassword(plain, stored) {
  if (typeof stored !== 'string' || !stored) return { ok: false, needsRehash: false };

  if (stored.startsWith('$2')) {
    const ok = await bcrypt.compare(plain, stored);
    return { ok, needsRehash: ok };
  }

  const [scheme, cost, blockSize, parallelism, salt, expected] = stored.split('$');
  if (scheme !== 'scrypt') return { ok: false, needsRehash: false };
  const expectedKey = Buffer.from(expected, 'base64url');
  const key = await scrypt(plain.normalize('NFKC'), Buffer.from(salt, 'base64url'), expectedKey.length, {
    N: 2 ** Number(cost),
    r: Number(blockSize),
    p: Number(parallelism),
    maxmem: MAX_MEMORY,
  });
  const ok = key.length === expectedKey.length && timingSafeEqual(key, expectedKey);
  return { ok, needsRehash: ok && Number(cost) < COST };
}

// Used when the email is unknown so a failed sign-in takes as long as a real
// one and does not reveal which addresses have accounts.
let decoyHash;
export async function burnPasswordCheck(plain) {
  decoyHash ??= await hashPassword(randomBytes(12).toString('hex'));
  await verifyPassword(plain, decoyHash);
}

// A handful of passwords that show up in every breach list. Length is the
// main defence; this catches the obvious ones people still try.
const COMMON = new Set([
  'password123', 'password1234', '1234567890', '12345678910', 'qwertyuiop', 'iloveyou123',
  'password12', 'qwerty1234', 'welcome123', 'twendezetu', 'twendezetu1', 'admin12345',
  '0123456789', '1111111111', 'abcdefghij', 'passw0rd123', 'letmein123', 'football123',
]);

export function passwordProblem(plain, { email, name } = {}) {
  if (typeof plain !== 'string' || plain.length < PASSWORD_MIN) return `Use at least ${PASSWORD_MIN} characters.`;
  if (plain.length > PASSWORD_MAX) return `Use at most ${PASSWORD_MAX} characters.`;
  const lower = plain.toLowerCase();
  if (COMMON.has(lower)) return 'That password is too common. Try a short phrase instead.';
  const localPart = String(email || '').split('@')[0].toLowerCase();
  if (localPart.length >= 4 && lower.includes(localPart)) return 'Your password should not contain your email name.';
  if (name && name.length >= 4 && lower.includes(name.toLowerCase().replace(/\s+/g, ''))) {
    return 'Your password should not contain your name.';
  }
  if (/^(.)\1+$/.test(plain)) return 'Avoid repeating a single character.';
  return null;
}
