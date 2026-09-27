// Small, audited building blocks. Everything uses node:crypto; no custom
// primitives.

import { createCipheriv, createDecipheriv, createHash, createHmac, hkdfSync, randomBytes, randomInt, timingSafeEqual } from 'node:crypto';
import { config } from '../config.js';

export function randomToken(bytes = 32) {
  return randomBytes(bytes).toString('base64url');
}

export function sha256(value) {
  return createHash('sha256').update(value).digest('hex');
}

export function safeEqual(a, b) {
  const left = Buffer.from(String(a));
  const right = Buffer.from(String(b));
  return left.length === right.length && timingSafeEqual(left, right);
}

// Purpose-bound keys derived from AUTH_SECRET, so a leak of one derived value
// (say, a ticket signature) says nothing about session tokens or OTPs.
const derivedKeys = new Map();
export function derivedKey(purpose) {
  if (!derivedKeys.has(purpose)) {
    const key = Buffer.from(hkdfSync('sha256', config().authSecret, 'twendezetu', `twendezetu:${purpose}`, 32));
    derivedKeys.set(purpose, key);
  }
  return derivedKeys.get(purpose);
}

export function hmac(purpose, value) {
  return createHmac('sha256', derivedKey(purpose)).update(value).digest();
}

// Crockford base32 without I, L, O, U: easy to read aloud at a door and
// impossible to confuse 0/O or 1/I.
const CROCKFORD = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';

export function crockford(length) {
  let out = '';
  for (let i = 0; i < length; i += 1) out += CROCKFORD[randomInt(32)];
  return out;
}

export function crockfordFromBytes(bytes, length) {
  let out = '';
  let buffer = 0;
  let bits = 0;
  for (const byte of bytes) {
    buffer = (buffer << 8) | byte;
    bits += 8;
    while (bits >= 5 && out.length < length) {
      out += CROCKFORD[(buffer >> (bits - 5)) & 31];
      bits -= 5;
    }
    buffer &= (1 << bits) - 1;
    if (out.length >= length) break;
  }
  return out;
}

// Human references such as "BK-7Q2KM9". 30 bits of randomness; callers keep
// a unique index and retry on the (rare) collision.
export function reference(prefix, length = 6) {
  return `${prefix}-${crockford(length)}`;
}

// ── Field encryption (AES-256-GCM) ────────────────────────────────────────
// Format: v1.<iv>.<tag>.<ciphertext>, all base64url. Used for national ID
// numbers and payout account numbers.

export function encrypt(plaintext) {
  if (plaintext == null || plaintext === '') return null;
  const iv = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', config().encryptionKey, iv);
  const body = Buffer.concat([cipher.update(String(plaintext), 'utf8'), cipher.final()]);
  return ['v1', iv.toString('base64url'), cipher.getAuthTag().toString('base64url'), body.toString('base64url')].join('.');
}

export function decrypt(payload) {
  if (!payload) return null;
  const [version, iv, tag, body] = String(payload).split('.');
  if (version !== 'v1' || !iv || !tag || !body) throw new Error('Unrecognised ciphertext format.');
  const decipher = createDecipheriv('aes-256-gcm', config().encryptionKey, Buffer.from(iv, 'base64url'));
  decipher.setAuthTag(Buffer.from(tag, 'base64url'));
  return Buffer.concat([decipher.update(Buffer.from(body, 'base64url')), decipher.final()]).toString('utf8');
}

export function lastDigits(value, count = 4) {
  const digits = String(value || '').replace(/\D/g, '');
  return digits.slice(-count);
}
