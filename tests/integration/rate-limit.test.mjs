import { after, test } from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';

const skip = !process.env.DATABASE_URL && 'DATABASE_URL is not set';
const { prisma } = await import('../../src/server/db.js');
const { POLICIES, checkRateLimit } = await import('../../src/server/security/rate-limit.js');

after(() => prisma.$disconnect());

test('a burst up to the limit passes and the next request waits', { skip }, async () => {
  const identity = `test-${randomUUID()}`;
  const { limit } = POLICIES['otp.send'];
  try {
    for (let index = 0; index < limit; index += 1) {
      assert.equal((await checkRateLimit('otp.send', identity)).allowed, true, `request ${index + 1}`);
    }
    const blocked = await checkRateLimit('otp.send', identity);
    assert.equal(blocked.allowed, false);
    assert.ok(blocked.retryAfterMs > 0);
    // Someone else is unaffected.
    assert.equal((await checkRateLimit('otp.send', `${identity}-other`)).allowed, true);
  } finally {
    await prisma.rateLimitBucket.deleteMany({ where: { key: { startsWith: `otp.send:${identity}` } } });
  }
});
