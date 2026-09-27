// The business wallet: earnings available to withdraw, money in escrow,
// this month against last, withdrawals on their way, and the ledger.

import { prisma, toNumber } from '../db.js';
import { unauthorized } from '../errors.js';
import { FEES } from '../fees.js';
import { getRates } from '../fx.js';
import { providerWallet } from '../services/payouts.js';
import { convert, formatCompact, formatMoney } from '../../shared/money.js';
import { shortDate } from '../../shared/format.js';
import { me } from './common.js';

function monthStart(offset = 0) {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + offset, 1));
}

// Money credited to earnings in a calendar month, and how many releases.
async function earnedBetween(userId, currency, from, to) {
  const lines = await prisma.journalLine.findMany({
    where: { amount: { gt: 0 }, currency, createdAt: { gte: from, lt: to }, account: { kind: 'EARNINGS', ownerKey: userId }, entry: { kind: 'ESCROW_RELEASE' } },
    select: { amount: true },
  });
  return { total: lines.reduce((sum, line) => sum + toNumber(line.amount), 0), count: lines.length };
}

export async function providerWalletView(viewer) {
  if (!viewer) throw unauthorized();
  const [person, wallet, rates, provider] = await Promise.all([
    me(viewer),
    providerWallet(viewer),
    getRates(),
    prisma.provider.findUnique({ where: { ownerId: viewer.id }, select: { name: true, rateCurrency: true } }),
  ]);
  const { currency } = wallet;
  const [thisMonth, lastMonth, pending, escrowCount] = await Promise.all([
    earnedBetween(viewer.id, currency, monthStart(0), monthStart(1)),
    earnedBetween(viewer.id, currency, monthStart(-1), monthStart(0)),
    prisma.payout.findMany({
      where: { userId: viewer.id, currency: { not: 'PTS' }, status: { in: ['REQUESTED', 'APPROVED'] } },
      orderBy: { requestedAt: 'desc' },
      select: { reference: true, amountMinor: true, feeMinor: true, currency: true, destinationLabel: true, requestedAt: true, status: true },
    }),
    wallet.activity.filter((row) => row.type === 'ESCROW').length,
  ]);
  const change = lastMonth.total ? Math.round(((thisMonth.total - lastMonth.total) / lastMonth.total) * 100) : null;
  const usd = currency === 'USD' ? null : formatMoney(convert(wallet.available, currency, 'USD', rates), 'USD');

  return {
    me: person,
    businessName: provider?.name || viewer.name,
    currency,
    available: wallet.available,
    availableLabel: formatMoney(wallet.available, currency, { cents: false }),
    availableUsd: usd,
    otherBalances: wallet.otherBalances,
    escrowLabel: wallet.escrowLabel,
    escrowCount,
    monthLabel: formatCompact(thisMonth.total, currency),
    monthJobs: thisMonth.count,
    monthChange: change,
    lastMonthName: monthStart(-1).toLocaleString('en-US', { month: 'short', timeZone: 'UTC' }).toUpperCase(),
    fee: wallet.fee,
    feeLabel: wallet.fee == null ? null : formatMoney(wallet.fee, currency, { cents: false }),
    fees: {
      commissionPercent: FEES.bookingCommissionBps / 100,
      membership: FEES.membershipMinor[currency] != null ? formatMoney(FEES.membershipMinor[currency], currency, { cents: false }) : formatMoney(FEES.membershipMinor.USD, 'USD'),
    },
    methods: wallet.methods,
    // Points per major unit of the currency, for the conversion preview.
    pointsPerUnit: currency === 'USD' ? 100 : rates[currency] ? 100 / rates[currency] : null,
    pending: pending.map((payout) => ({
      reference: payout.reference,
      net: formatMoney(payout.amountMinor - payout.feeMinor, payout.currency, { cents: false }),
      to: payout.destinationLabel,
      since: shortDate(payout.requestedAt),
      status: payout.status === 'APPROVED' ? 'APPROVED · SENDING' : 'WAITING FOR THE NEXT BATCH',
    })),
    activity: wallet.activity.map(({ at, ...row }) => ({ ...row, at: new Date(at).toISOString() })),
  };
}
