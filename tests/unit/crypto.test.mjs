import { test } from 'node:test';
import assert from 'node:assert/strict';

process.env.DATABASE_URL ||= 'postgresql://test@localhost:5432/unused';
process.env.AUTH_SECRET ||= 'test-secret-that-is-long-enough-for-config';
const { decrypt, encrypt, reference, safeEqual } = await import('../../src/server/security/crypto.js');

test('encrypted fields round-trip and never repeat', () => {
  const first = encrypt('CM9001234567XYZ');
  const second = encrypt('CM9001234567XYZ');
  assert.notEqual(first, second);
  assert.doesNotMatch(first, /CM9001234567XYZ/);
  assert.equal(decrypt(first), 'CM9001234567XYZ');
});

test('tampered ciphertext is rejected', () => {
  const [version, iv, tag, body] = encrypt('+256772000214').split('.');
  const flipped = Buffer.from(body, 'base64url');
  flipped[0] ^= 1;
  assert.throws(() => decrypt([version, iv, tag, flipped.toString('base64url')].join('.')));
  assert.throws(() => decrypt('not-a-ciphertext'), /Unrecognised/);
});

test('references use an unambiguous alphabet', () => {
  for (let index = 0; index < 200; index += 1) assert.match(reference('BK'), /^BK-[0-9A-HJKMNP-TV-Z]{6}$/);
});

test('secrets are compared in constant time and only when equal', () => {
  assert.equal(safeEqual('Bearer abc', 'Bearer abc'), true);
  assert.equal(safeEqual('Bearer abc', 'Bearer abd'), false);
  assert.equal(safeEqual('short', 'much longer value'), false);
});
