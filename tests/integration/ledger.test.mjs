// Runs against a real Postgres (DATABASE_URL). Every case works inside a
// transaction that is rolled back, so nothing is left behind.
import { after, test } from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';

const skip = !process.env.DATABASE_URL && 'DATABASE_URL is not set';
const { prisma } = await import('../../src/server/db.js');
const { accounts, balanceOf, ensureAccount, post } = await import('../../src/server/ledger.js');

class Rollback extends Error {}

async function inRollback(work) {
  try {
    await prisma.$transaction(async (tx) => {
      await work(tx);
      throw new Rollback();
    });
  } catch (error) {
    if (!(error instanceof Rollback)) throw error;
  }
}

after(() => prisma.$disconnect());

test('a posted entry moves balances', { skip }, async () => {
  await inRollback(async (tx) => {
    const wallet = accounts.wallet(`test-${randomUUID()}`);
    await post(tx, { kind: 'REFERRAL_REWARD', memo: 'test', lines: [{ account: accounts.promotions(), amount: -50 }, { account: wallet, amount: 50 }] });
    assert.equal(await balanceOf(tx, wallet), 50);
  });
});

test('the database refuses to overdraw a wallet', { skip }, async () => {
  await assert.rejects(
    inRollback((tx) => post(tx, { kind: 'TRANSFER', memo: 'test', lines: [{ account: accounts.wallet(`test-${randomUUID()}`), amount: -100 }, { account: accounts.fx('PTS'), amount: 100 }] })),
    /insufficient_funds/,
  );
});

test('an unbalanced entry written around the application is refused at commit', { skip }, async () => {
  await assert.rejects(
    inRollback(async (tx) => {
      const account = await ensureAccount(tx, accounts.promotions());
      const entry = await tx.journalEntry.create({ data: { kind: 'TRANSFER', memo: 'test' } });
      await tx.journalLine.create({ data: { entryId: entry.id, accountId: account.id, amount: -10n, currency: 'PTS' } });
      await tx.$executeRawUnsafe('SET CONSTRAINTS ALL IMMEDIATE');
    }),
    /journal_entry_(incomplete|unbalanced)/,
  );
});

test('journal rows cannot be edited or deleted', { skip }, async () => {
  await assert.rejects(
    inRollback(async (tx) => {
      const wallet = accounts.wallet(`test-${randomUUID()}`);
      const id = await post(tx, { kind: 'REFERRAL_REWARD', memo: 'test', lines: [{ account: accounts.promotions(), amount: -5 }, { account: wallet, amount: 5 }] });
      await tx.journalLine.updateMany({ where: { entryId: id }, data: { amount: 500n } });
    }),
    /journal_append_only/,
  );
});

test('a balance cannot be set directly', { skip }, async () => {
  await assert.rejects(
    inRollback(async (tx) => {
      const account = await ensureAccount(tx, accounts.wallet(`test-${randomUUID()}`));
      await tx.ledgerAccount.update({ where: { id: account.id }, data: { balance: 1_000_000n } });
    }),
    /ledger_balance_is_derived/,
  );
});
