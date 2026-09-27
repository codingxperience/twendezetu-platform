import { test } from 'node:test';
import assert from 'node:assert/strict';

process.env.DATABASE_URL ||= 'postgresql://test@localhost:5432/unused';
process.env.AUTH_SECRET ||= 'test-secret-that-is-long-enough-for-config';
const { homeFor } = await import('../../src/server/security/staff.js');

test('staff land on their console, everyone else on My Twende', () => {
  assert.equal(homeFor({ role: 'ADMIN' }), '/admin');
  assert.equal(homeFor({ role: 'MODERATOR' }), '/admin');
  assert.equal(homeFor({ role: 'FINANCE' }), '/finance');
  assert.equal(homeFor({ role: 'MEMBER' }), '/my-twende');
  assert.equal(homeFor(null), '/my-twende');
});
