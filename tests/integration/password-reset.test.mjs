// The forgot-password flow against a real Postgres (DATABASE_URL). Resend is
// replaced by a stub that records each email, so the link a member would
// click is taken from the email itself. Test accounts are deleted after.
import { after, afterEach, beforeEach, test } from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';

const skip = !process.env.DATABASE_URL && 'DATABASE_URL is not set';
process.env.AUTH_SECRET ||= 'integration-test-secret-integration-test-secret';
process.env.RESEND_API_KEY = 'test-key';
process.env.NEXT_PUBLIC_APP_URL = 'https://twendezetu.test';

const { prisma } = await import('../../src/server/db.js');
const { resetConfigForTests } = await import('../../src/server/config.js');
const { hashPassword, verifyPassword } = await import('../../src/server/security/passwords.js');
const { createSession } = await import('../../src/server/security/sessions.js');
const { sha256 } = await import('../../src/server/security/crypto.js');
const { checkPasswordReset, deliverPasswordReset, resetPassword } = await import('../../src/server/services/identity.js');

resetConfigForTests?.();

const OLD_PASSWORD = 'kilimanjaro sunrise 7';
const NEW_PASSWORD = 'mvua ya jioni 2026';
const realFetch = globalThis.fetch;
let outbox = [];
let failSends = false;
const created = [];

beforeEach(() => {
  outbox = [];
  failSends = false;
  globalThis.fetch = async (url, init) => {
    assert.equal(String(url), 'https://api.resend.com/emails');
    if (failSends) return new Response('provider down', { status: 500 });
    outbox.push(JSON.parse(init.body));
    return new Response('{"id":"stub"}', { status: 200 });
  };
});

afterEach(() => {
  globalThis.fetch = realFetch;
});

after(async () => {
  if (created.length) await prisma.user.deleteMany({ where: { id: { in: created } } });
  await prisma.$disconnect();
});

async function member(extra = {}) {
  const id = randomUUID().slice(0, 8);
  const user = await prisma.user.create({
    data: { email: `reset-${id}@example.com`, name: 'Neema Wanjiru', handle: `reset${id}`, passwordHash: await hashPassword(OLD_PASSWORD), ...extra },
  });
  created.push(user.id);
  return user;
}

function linkFrom(email) {
  const match = /https:\/\/twendezetu\.test\/sign-in\?reset=([A-Za-z0-9_-]+)/.exec(email.text);
  assert.ok(match, 'the email carries a reset link');
  assert.ok(email.html.includes(match[0]), 'the HTML version carries the same link');
  return match[1];
}

async function sendAndCapture(user) {
  const result = await deliverPasswordReset(user.email, { ipAddress: '203.0.113.9' });
  assert.deepEqual(result, { sent: true });
  assert.equal(outbox.length, 1);
  assert.deepEqual(outbox[0].to, [user.email]);
  assert.equal(outbox[0].subject, 'Reset your Twendezetu password');
  return linkFrom(outbox[0]);
}

test('an unknown address gets no email and no link', { skip }, async () => {
  const result = await deliverPasswordReset(`nobody-${randomUUID()}@example.com`, { ipAddress: '203.0.113.9' });
  assert.deepEqual(result, { sent: false, reason: 'no_active_account' });
  assert.equal(outbox.length, 0);
});

test('a suspended account gets no link', { skip }, async () => {
  const user = await member({ status: 'SUSPENDED', suspendedAt: new Date() });
  const result = await deliverPasswordReset(user.email, { ipAddress: '203.0.113.9' });
  assert.equal(result.sent, false);
  assert.equal(outbox.length, 0);
});

test('the link lives only in the email; the database keeps its hash', { skip }, async () => {
  const user = await member();
  const token = await sendAndCapture(user);
  assert.ok(token.length >= 40);

  const codes = await prisma.oneTimeCode.findMany({ where: { userId: user.id, purpose: 'PASSWORD_RESET' } });
  assert.equal(codes.length, 1);
  assert.equal(codes[0].codeHash, sha256(token));
  assert.ok(codes[0].expiresAt - Date.now() > 29 * 60 * 1000);

  const notices = await prisma.notification.findMany({ where: { userId: user.id } });
  const outbound = await prisma.outboundMessage.findMany({ where: { userId: user.id } });
  for (const row of [...notices, ...outbound]) {
    assert.ok(!JSON.stringify(row).includes(token), 'no stored notice or outbox row contains the token');
  }
});

test('a second request inside a minute sends nothing more', { skip }, async () => {
  const user = await member();
  await sendAndCapture(user);
  const again = await deliverPasswordReset(user.email, { ipAddress: '203.0.113.9' });
  assert.deepEqual(again, { sent: false, reason: 'cooldown' });
  assert.equal(outbox.length, 1);
});

test('a newer link retires the older one', { skip }, async () => {
  const user = await member();
  const first = await sendAndCapture(user);
  await prisma.oneTimeCode.updateMany({ where: { userId: user.id }, data: { createdAt: new Date(Date.now() - 5 * 60 * 1000) } });
  outbox = [];
  const second = await sendAndCapture(user);
  assert.notEqual(first, second);
  assert.equal((await checkPasswordReset(first)).status, 'used');
  assert.equal((await checkPasswordReset(second)).status, 'valid');
});

test('checking a link reports it and names the account only masked', { skip }, async () => {
  const user = await member();
  const token = await sendAndCapture(user);
  const check = await checkPasswordReset(token);
  assert.equal(check.status, 'valid');
  assert.equal(check.emailHint, `${user.email.slice(0, 2)}***@example.com`);
  assert.equal((await checkPasswordReset('x'.repeat(43))).status, 'invalid');
  assert.equal((await checkPasswordReset('')).status, 'invalid');
});

test('an expired link is refused', { skip }, async () => {
  const user = await member();
  const token = await sendAndCapture(user);
  await prisma.oneTimeCode.updateMany({ where: { userId: user.id }, data: { expiresAt: new Date(Date.now() - 1000) } });
  assert.equal((await checkPasswordReset(token)).status, 'expired');
  await assert.rejects(resetPassword({ token, newPassword: NEW_PASSWORD, ipAddress: '203.0.113.9' }), (error) => error.details?.linkStatus === 'expired');
});

test('weak passwords and the current password are refused without using up the link', { skip }, async () => {
  const user = await member();
  const token = await sendAndCapture(user);
  await assert.rejects(resetPassword({ token, newPassword: 'short', ipAddress: '203.0.113.9' }), (error) => error.status === 422);
  await assert.rejects(resetPassword({ token, newPassword: OLD_PASSWORD, ipAddress: '203.0.113.9' }), /password you have now/);
  assert.equal((await checkPasswordReset(token)).status, 'valid');
});

test('a reset changes the password, signs out every device and works once', { skip }, async () => {
  const user = await member();
  const oldSession = await createSession(user.id, { ipAddress: '198.51.100.4' });
  const token = await sendAndCapture(user);

  const result = await resetPassword({ token, newPassword: NEW_PASSWORD, ipAddress: '203.0.113.9', userAgent: 'test' });
  assert.equal(result.signedIn, true);
  assert.equal(result.email, user.email);
  assert.equal(result.home, '/my-twende');
  assert.ok(result.session.token);

  const fresh = await prisma.user.findUnique({ where: { id: user.id } });
  assert.equal((await verifyPassword(NEW_PASSWORD, fresh.passwordHash)).ok, true);
  assert.equal((await verifyPassword(OLD_PASSWORD, fresh.passwordHash)).ok, false);
  assert.ok(fresh.passwordChangedAt);
  assert.ok(fresh.emailVerifiedAt, 'receiving the link proves the inbox');

  const sessions = await prisma.session.findMany({ where: { userId: user.id } });
  const old = sessions.find((session) => session.id === oldSession.sessionId);
  assert.ok(!old || old.revokedAt, 'the session from before the reset no longer works');
  assert.ok(sessions.some((session) => session.id === result.session.sessionId && !session.revokedAt));

  const notice = await prisma.notification.findFirst({ where: { userId: user.id, title: 'Your password was reset' } });
  assert.ok(notice, 'the member is told');

  assert.equal((await checkPasswordReset(token)).status, 'used');
  await assert.rejects(resetPassword({ token, newPassword: 'another good phrase 9', ipAddress: '203.0.113.9' }), (error) => error.details?.linkStatus === 'used');
});

test('with two-step verification on, the reset does not sign in', { skip }, async () => {
  const user = await member({ twoFactorEnabled: true, phone: '+254712000111', phoneVerifiedAt: new Date() });
  const token = await sendAndCapture(user);
  const result = await resetPassword({ token, newPassword: NEW_PASSWORD, ipAddress: '203.0.113.9' });
  assert.deepEqual(result, { signedIn: false, email: user.email, home: '/my-twende' });
  const live = await prisma.session.count({ where: { userId: user.id, revokedAt: null } });
  assert.equal(live, 0);
});

test('when the email cannot be sent, the unsent link is retired', { skip }, async () => {
  const user = await member();
  failSends = true;
  const result = await deliverPasswordReset(user.email, { ipAddress: '203.0.113.9' });
  assert.deepEqual(result, { sent: false, reason: 'delivery_failed' });
  const open = await prisma.oneTimeCode.count({ where: { userId: user.id, purpose: 'PASSWORD_RESET', consumedAt: null } });
  assert.equal(open, 0);
});
