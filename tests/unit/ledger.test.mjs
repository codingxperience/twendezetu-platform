import { test } from 'node:test';
import assert from 'node:assert/strict';

process.env.DATABASE_URL ||= 'postgresql://test@localhost:5432/unused';
process.env.AUTH_SECRET ||= 'test-secret-that-is-long-enough-for-config';
const { accounts, post } = await import('../../src/server/ledger.js');

// Stands in for a Prisma transaction and records what would be written.
function fakeTx() {
  const written = { entries: [], lines: [] };
  const tx = {
    written,
    $executeRaw: async () => 1,
    ledgerAccount: { findUniqueOrThrow: async ({ where }) => ({ id: JSON.stringify(where.kind_ownerKey_currency) }) },
    journalEntry: { create: async ({ data }) => { written.entries.push(data); return { id: `entry-${written.entries.length}` }; } },
    journalLine: { create: async ({ data }) => { written.lines.push(data); return data; } },
  };
  return tx;
}

test('an entry that does not balance in every currency is refused before anything is written', async () => {
  const tx = fakeTx();
  await assert.rejects(
    post(tx, { kind: 'TRANSFER', memo: 'x', lines: [{ account: accounts.wallet('a'), amount: -100 }, { account: accounts.wallet('b'), amount: 99 }] }),
    /Unbalanced ledger entry in PTS/,
  );
  await assert.rejects(
    post(tx, {
      kind: 'TICKET_SALE',
      memo: 'x',
      lines: [
        { account: accounts.paymentClearing('USD'), amount: -2625 },
        { account: accounts.eventEscrow('e', 'USD'), amount: 2500 },
        { account: accounts.revenue('KES'), amount: 125 },
      ],
    }),
    /Unbalanced/,
  );
  assert.equal(tx.written.entries.length, 0);
});

test('an entry needs two sides', async () => {
  await assert.rejects(post(fakeTx(), { kind: 'TRANSFER', memo: 'x', lines: [{ account: accounts.wallet('a'), amount: 0 }] }), /at least two/);
});

test('lines on the same account are merged, and debits are written first', async () => {
  const tx = fakeTx();
  const id = await post(tx, {
    kind: 'TICKET_SALE',
    memo: 'Order',
    lines: [
      { account: accounts.eventEscrow('e', 'USD'), amount: 2500 },
      { account: accounts.revenue('USD'), amount: 100 },
      { account: accounts.revenue('USD'), amount: 25 },
      { account: accounts.paymentClearing('USD'), amount: -2625 },
    ],
  });
  assert.equal(id, 'entry-1');
  assert.deepEqual(tx.written.lines.map((line) => Number(line.amount)), [-2625, 125, 2500]);
  assert.equal(tx.written.lines.reduce((sum, line) => sum + Number(line.amount), 0), 0);
});

test('a multi-currency entry balances per currency', async () => {
  const tx = fakeTx();
  await post(tx, {
    kind: 'TICKET_SALE',
    memo: 'Paid with points',
    lines: [
      { account: accounts.wallet('buyer'), amount: -776 },
      { account: accounts.fx('PTS'), amount: 776 },
      { account: accounts.fx('KES'), amount: -100000 },
      { account: accounts.eventEscrow('e', 'KES'), amount: 100000 },
    ],
  });
  assert.equal(tx.written.lines.length, 4);
});
