// Double-entry ledger.
//
// Every movement of value — a top-up, a ticket sale, a pool chip-in, an
// escrow release — is one JournalEntry whose lines sum to zero in each
// currency. Balances are never written directly: a trigger applies each line
// to its account and refuses overdrafts (see the platform migration). This
// module builds entries and names the accounts; the database guarantees the
// arithmetic.

import { Prisma } from '@prisma/client';
import { toNumber } from './db.js';

export const PLATFORM = 'platform';

// Accounts that represent the outside world or the platform's own position
// may run negative: PAYMENT_CLEARING goes negative as money arrives from a
// card processor, FX_CONVERSION carries the platform's currency position and
// PLATFORM_PROMOTIONS funds referral rewards and discounts.
const MAY_GO_NEGATIVE = new Set(['PAYMENT_CLEARING', 'FX_CONVERSION', 'PLATFORM_PROMOTIONS']);

export const accounts = {
  wallet: (userId) => ({ kind: 'USER_WALLET', ownerKey: userId, currency: 'PTS' }),
  earnings: (userId, currency) => ({ kind: 'EARNINGS', ownerKey: userId, currency }),
  eventEscrow: (eventId, currency) => ({ kind: 'EVENT_ESCROW', ownerKey: eventId, currency }),
  bookingEscrow: (bookingId, currency) => ({ kind: 'BOOKING_ESCROW', ownerKey: bookingId, currency }),
  pool: (poolId) => ({ kind: 'POOL', ownerKey: poolId, currency: 'PTS' }),
  payoutClearing: (currency) => ({ kind: 'PAYOUT_CLEARING', ownerKey: PLATFORM, currency }),
  paymentClearing: (currency) => ({ kind: 'PAYMENT_CLEARING', ownerKey: PLATFORM, currency }),
  fx: (currency) => ({ kind: 'FX_CONVERSION', ownerKey: PLATFORM, currency }),
  revenue: (currency) => ({ kind: 'PLATFORM_REVENUE', ownerKey: PLATFORM, currency }),
  promotions: () => ({ kind: 'PLATFORM_PROMOTIONS', ownerKey: PLATFORM, currency: 'PTS' }),
};

// Finds or creates an account. ON CONFLICT DO NOTHING keeps concurrent
// first-time creators from tripping over each other.
export async function ensureAccount(tx, { kind, ownerKey, currency }) {
  const allowNegative = MAY_GO_NEGATIVE.has(kind);
  await tx.$executeRaw`
    INSERT INTO "LedgerAccount" ("id", "kind", "ownerKey", "currency", "allowNegative", "updatedAt")
    VALUES (${`acct_${kind.toLowerCase()}_${ownerKey}_${currency}`.slice(0, 120)},
            ${kind}::"LedgerAccountKind", ${ownerKey}, ${currency}, ${allowNegative}, now())
    ON CONFLICT ("kind", "ownerKey", "currency") DO NOTHING`;
  return tx.ledgerAccount.findUniqueOrThrow({
    where: { kind_ownerKey_currency: { kind, ownerKey, currency } },
  });
}

// Posts an entry. `lines` is a list of { account: <descriptor>, amount } with
// amounts in the account currency's minor unit; debits are negative.
// Returns the entry id. Throws (and the surrounding transaction rolls back)
// if any line would overdraw an account.
export async function post(tx, { kind, memo, reference, idempotencyKey, actorId, meta, lines }) {
  const merged = new Map();
  for (const line of lines) {
    const amount = Math.round(Number(line.amount));
    if (!Number.isFinite(amount)) throw new Error('Ledger amount must be a finite number.');
    if (amount === 0) continue;
    const key = `${line.account.kind}|${line.account.ownerKey}|${line.account.currency}`;
    const existing = merged.get(key);
    merged.set(key, { account: line.account, amount: (existing?.amount || 0) + amount });
  }

  const totals = new Map();
  for (const { account, amount } of merged.values()) {
    totals.set(account.currency, (totals.get(account.currency) || 0) + amount);
  }
  for (const [currency, total] of totals) {
    if (total !== 0) throw new Error(`Unbalanced ledger entry in ${currency}: ${total}`);
  }

  const postings = [...merged.values()].filter((line) => line.amount !== 0);
  if (postings.length < 2) throw new Error('A ledger entry needs at least two non-zero lines.');

  const entry = await tx.journalEntry.create({
    data: { kind, memo, reference, idempotencyKey, actorId, meta: meta ?? Prisma.JsonNull },
    select: { id: true },
  });

  // Lines for the same account were merged above, so each account is touched
  // exactly once. Debits go first so an overdraft fails fast.
  postings.sort((a, b) => a.amount - b.amount);
  for (const { account, amount } of postings) {
    const resolved = await ensureAccount(tx, account);
    await tx.journalLine.create({
      data: { entryId: entry.id, accountId: resolved.id, amount: BigInt(amount), currency: account.currency },
    });
  }
  return entry.id;
}

export async function balanceOf(db, descriptor) {
  const account = await db.ledgerAccount.findUnique({
    where: { kind_ownerKey_currency: { kind: descriptor.kind, ownerKey: descriptor.ownerKey, currency: descriptor.currency } },
    select: { balance: true },
  });
  return account ? toNumber(account.balance) : 0;
}

export async function balancesByCurrency(db, kind, ownerKey) {
  const rows = await db.ledgerAccount.findMany({ where: { kind, ownerKey }, select: { currency: true, balance: true } });
  return Object.fromEntries(rows.map((row) => [row.currency, toNumber(row.balance)]));
}

// Account history: the lines on one account, newest first, with the entry
// that produced each. Cursor is the last line id seen.
export async function statement(db, descriptor, { take = 25, cursor } = {}) {
  const account = await db.ledgerAccount.findUnique({
    where: { kind_ownerKey_currency: { kind: descriptor.kind, ownerKey: descriptor.ownerKey, currency: descriptor.currency } },
    select: { id: true },
  });
  if (!account) return { lines: [], nextCursor: null };
  const rows = await db.journalLine.findMany({
    where: { accountId: account.id, ...(cursor ? { id: { lt: BigInt(cursor) } } : {}) },
    orderBy: { id: 'desc' },
    take: take + 1,
    include: { entry: { select: { id: true, kind: true, memo: true, reference: true, meta: true, createdAt: true } } },
  });
  const page = rows.slice(0, take);
  return {
    lines: page.map((row) => ({
      id: row.id.toString(),
      amount: toNumber(row.amount),
      currency: row.currency,
      createdAt: row.createdAt,
      entry: row.entry,
    })),
    nextCursor: rows.length > take ? page[page.length - 1].id.toString() : null,
  };
}
