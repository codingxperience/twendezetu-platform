// The finance console: volume and revenue straight from the ledger, the
// escrow book, payout approval and exports.

import { prisma, transaction, toNumber } from '../db.js';
import { audit } from '../audit.js';
import { conflict, notFound } from '../errors.js';
import { getRates } from '../fx.js';
import { convert, formatMoney } from '../../shared/money.js';
import { notify } from '../notify/index.js';
import { shortDate, shortName } from '../../shared/format.js';
import { releaseBooking } from './marketplace.js';
import { pendingPayoutSummary } from './payouts.js';
import { csvCell } from './wallet.js';
import { FEES } from '../fees.js';

const RANGES = { '7d': 7, '30d': 30, '90d': 90 };

export const LEDGER_FILTERS = Object.freeze({
  ALL: null,
  TICKETS: ['TICKET_SALE'],
  BOOKINGS: ['BOOKING_ESCROW', 'ESCROW_RELEASE'],
  MEMBERSHIPS: ['MEMBERSHIP'],
  POINTS: ['TOPUP', 'TRANSFER', 'CASHOUT', 'POOL_CONTRIBUTION', 'POOL_RELEASE', 'REFERRAL_REWARD'],
  PAYOUTS: ['PAYOUT', 'PAYOUT_REVERSAL'],
  REFUNDS: ['REFUND'],
});

const STREAMS = {
  TICKET_SALE: `Ticket fees (${FEES.ticketServiceBps / 100}%)`,
  ESCROW_RELEASE: `Booking fees (${FEES.bookingCommissionBps / 100}%)`,
  MEMBERSHIP: 'Vendor memberships',
  CASHOUT: 'Cash-out & withdrawal fees',
  PAYOUT: 'Cash-out & withdrawal fees',
  REFUND: 'Refunded fees',
  PAYOUT_REVERSAL: 'Cash-out & withdrawal fees',
};

function since(range) {
  return new Date(Date.now() - (RANGES[range] || 30) * 86_400_000);
}

function usd(minor, currency, rates) {
  return convert(minor, currency, 'USD', rates);
}

function usdLabel(cents) {
  const dollars = cents / 100;
  const sign = dollars < 0 ? '−' : '';
  const size = Math.abs(dollars);
  if (size >= 100_000) return `${sign}$${(size / 1000).toFixed(1)}K`;
  // Small figures keep their cents so a few dollars of fees do not read as $0.
  const digits = size < 1000 ? 2 : 0;
  return `${sign}$${size.toLocaleString('en-US', { minimumFractionDigits: digits, maximumFractionDigits: digits })}`;
}

export async function financeOverview({ range = '30d', filter = 'ALL' } = {}) {
  const from = since(range);
  const rates = await getRates();

  const [orders, bookings, topups, revenueLines, activeMemberships] = await Promise.all([
    prisma.order.groupBy({ by: ['currency'], where: { status: { in: ['PAID', 'REFUNDED'] }, paidAt: { gte: from } }, _sum: { totalMinor: true } }),
    prisma.booking.groupBy({ by: ['currency'], where: { escrowedAt: { gte: from } }, _sum: { amountMinor: true } }),
    prisma.payment.groupBy({ by: ['currency'], where: { purpose: 'TOPUP', status: 'SUCCEEDED', succeededAt: { gte: from } }, _sum: { amountMinor: true } }),
    prisma.journalLine.findMany({
      where: { createdAt: { gte: from }, account: { kind: 'PLATFORM_REVENUE' } },
      select: { amount: true, currency: true, entry: { select: { kind: true } } },
    }),
    prisma.provider.count({ where: { membershipEndsAt: { gt: new Date() } } }),
  ]);

  const byCurrency = {};
  const add = (rows, field) => {
    for (const row of rows) byCurrency[row.currency] = (byCurrency[row.currency] || 0) + (row._sum[field] || 0);
  };
  add(orders, 'totalMinor');
  add(bookings, 'amountMinor');
  add(topups, 'amountMinor');
  const gmv = Object.entries(byCurrency).reduce((sum, [currency, minor]) => sum + usd(minor, currency, rates), 0);

  const streams = {};
  let revenue = 0;
  for (const line of revenueLines) {
    const cents = usd(toNumber(line.amount), line.currency, rates);
    revenue += cents;
    const label = STREAMS[line.entry.kind] || 'Other';
    streams[label] = (streams[label] || 0) + cents;
  }
  const membership = streams['Vendor memberships'] || 0;
  const flowFees = revenue - membership;

  const currencies = Object.entries(byCurrency)
    .map(([code, minor]) => ({ code, cents: usd(minor, code, rates) }))
    .sort((a, b) => b.cents - a.cents)
    .map((row) => ({ code: row.code, pct: `${gmv ? Math.round((row.cents / gmv) * 100) : 0}%`, usd: usdLabel(row.cents) }));

  const soon = new Date(Date.now() + 30 * 86_400_000);
  const [ledger, escrow, payouts, heldEscrow, wallets, renewSoon, lapsed, queue, pools] = await Promise.all([
    ledgerRows({ from, filter, rates }),
    escrowBook(rates),
    pendingPayoutSummary(),
    prisma.ledgerAccount.findMany({ where: { kind: { in: ['BOOKING_ESCROW', 'EVENT_ESCROW'] }, balance: { gt: 0 } }, select: { kind: true, currency: true, balance: true } }),
    prisma.ledgerAccount.aggregate({ where: { kind: { in: ['USER_WALLET', 'POOL'] }, currency: 'PTS' }, _sum: { balance: true } }),
    prisma.provider.count({ where: { membershipEndsAt: { gt: new Date(), lt: soon } } }),
    prisma.provider.count({ where: { membershipEndsAt: { lt: new Date(), gt: new Date(Date.now() - 90 * 86_400_000) } } }),
    payoutQueue(),
    poolReviews(),
  ]);
  const payoutUsd = payouts.reduce((sum, row) => sum + usd(row.net, row.currency, rates), 0);
  const escrowUsd = (kind) => heldEscrow.filter((row) => row.kind === kind).reduce((sum, row) => sum + usd(toNumber(row.balance), row.currency, rates), 0);
  const points = toNumber(wallets._sum.balance || 0);

  return {
    range,
    kpis: [
      { label: 'GROSS VOLUME (GMV)', big: usdLabel(gmv), sub: 'tickets + bookings + top-ups' },
      { label: 'PLATFORM REVENUE', big: usdLabel(revenue), sub: 'fees + memberships, net of refunds' },
      { label: 'FEES ON PAID FLOWS', big: usdLabel(flowFees), sub: `${FEES.ticketServiceBps / 100}% tickets · ${FEES.bookingCommissionBps / 100}% bookings · cash-out fees` },
      { label: 'MEMBERSHIP REVENUE', big: usdLabel(membership), sub: `${activeMemberships.toLocaleString('en-US')} active vendor memberships` },
    ],
    streams: Object.entries(streams)
      .filter(([, cents]) => cents !== 0)
      .sort((a, b) => b[1] - a[1])
      .map(([label, cents]) => ({ label, amount: usdLabel(cents), pct: `${revenue ? Math.round((cents / revenue) * 100) : 0}%` })),
    currencies,
    ledger,
    escrow,
    payouts: { count: payouts.reduce((sum, row) => sum + row.count, 0), total: usdLabel(payoutUsd), byCurrency: payouts.map((row) => ({ ...row, label: row.currency === 'PTS' ? `${row.net.toLocaleString('en-US')} pts` : formatMoney(row.net, row.currency) })) },
    held: {
      bookings: usdLabel(escrowUsd('BOOKING_ESCROW')),
      tickets: usdLabel(escrowUsd('EVENT_ESCROW')),
      bookingCount: heldEscrow.filter((row) => row.kind === 'BOOKING_ESCROW').length,
    },
    // Points in wallets and pools, at 1 US cent each: what members could
    // spend or cash out.
    pointsLiability: { points: points.toLocaleString('en-US'), usd: usdLabel(points) },
    memberships: { active: activeMemberships, renewSoon, lapsed },
    queue,
    pools,
  };
}

async function ledgerRows({ from, filter, rates, take = 40 }) {
  const kinds = LEDGER_FILTERS[filter] || null;
  const entries = await prisma.journalEntry.findMany({
    where: { createdAt: { gte: from }, ...(kinds ? { kind: { in: kinds } } : {}) },
    orderBy: { createdAt: 'desc' },
    take,
    include: { lines: { include: { account: { select: { kind: true } } } } },
  });
  return entries.map((entry) => {
    const lines = entry.lines.map((line) => ({ ...line, amount: toNumber(line.amount) }));
    const inflow = lines.filter((line) => line.amount > 0 && !['FX_CONVERSION'].includes(line.account.kind));
    const primary = inflow.sort((a, b) => usd(b.amount, b.currency, rates) - usd(a.amount, a.currency, rates))[0] || lines[0];
    const gross = inflow.filter((line) => line.currency === primary.currency).reduce((sum, line) => sum + line.amount, 0);
    const fee = lines.filter((line) => line.account.kind === 'PLATFORM_REVENUE').reduce((sum, line) => sum + usd(line.amount, line.currency, rates), 0);
    const refund = entry.kind === 'REFUND' || entry.kind === 'PAYOUT_REVERSAL';
    const escrowed = lines.some((line) => ['EVENT_ESCROW', 'BOOKING_ESCROW'].includes(line.account.kind) && line.amount > 0);
    return {
      id: entry.id,
      type: Object.entries(LEDGER_FILTERS).find(([key, list]) => key !== 'ALL' && list?.includes(entry.kind))?.[0] || 'OTHER',
      kind: entry.kind,
      title: entry.memo,
      meta: `${shortDate(entry.createdAt)} · ${primary ? (primary.currency === 'PTS' ? `${gross.toLocaleString('en-US')} PTS` : formatMoney(gross, primary.currency)) : ''}${entry.meta?.test ? ' · TEST PAYMENT' : ''}`,
      status: refund ? 'REFUNDED' : escrowed ? 'IN ESCROW' : 'SETTLED',
      gross: `${refund ? '−' : ''}${usdLabel(Math.abs(usd(gross, primary?.currency || 'USD', rates)))}`,
      fee: fee ? usdLabel(fee) : '$0',
      createdAt: entry.createdAt,
    };
  });
}

async function escrowBook(rates) {
  const bookings = await prisma.booking.findMany({
    where: { status: { in: ['ESCROWED', 'DISPUTED'] } },
    include: { provider: { select: { name: true } } },
    orderBy: { releaseAfter: 'asc' },
    take: 20,
  });
  return bookings.map((booking) => ({
    id: booking.id,
    label: `${booking.provider.name} — ${booking.title}`,
    meta: `${booking.reference}${booking.serviceStartsOn ? ` · JOB ${shortDate(booking.serviceStartsOn)}` : ''}`,
    amount: usdLabel(usd(booking.amountMinor, booking.currency, rates)),
    local: formatMoney(booking.amountMinor, booking.currency),
    until: booking.status === 'DISPUTED' ? 'FROZEN · DISPUTE' : booking.releaseAfter ? `AUTO ${shortDate(booking.releaseAfter)}` : 'ON CONFIRM',
    releasable: booking.status === 'ESCROWED',
  }));
}

export async function financeReleaseBooking(financeUser, bookingId) {
  const booking = await prisma.booking.findUnique({ where: { id: bookingId }, select: { status: true } });
  if (!booking) throw notFound();
  if (booking.status !== 'ESCROWED') throw conflict('Only funded bookings without a dispute can be released.', 'not_releasable');
  const released = await transaction(async (tx) => {
    const done = await releaseBooking(tx, bookingId, financeUser.id, 'released by finance');
    if (done) await audit(tx, { actorId: financeUser.id, action: 'finance.escrow_released', targetType: 'Booking', targetId: bookingId });
    return done;
  });
  if (!released) throw conflict('This booking has an open dispute.', 'disputed');
  return { released: true };
}

// Reminds providers whose membership ends within 30 days. One reminder per
// provider per month (dedupe key).
export async function sendRenewalReminders(financeUser) {
  const soon = new Date(Date.now() + 30 * 86_400_000);
  const providers = await prisma.provider.findMany({
    where: { status: 'ACTIVE', membershipEndsAt: { gt: new Date(), lt: soon } },
    select: { id: true, ownerId: true, membershipEndsAt: true },
  });
  const month = new Date().toISOString().slice(0, 7);
  await transaction(async (tx) => {
    for (const provider of providers) {
      await notify(tx, {
        userId: provider.ownerId,
        topic: 'MONEY',
        title: 'Your listing membership ends soon',
        body: `Your membership ends on ${provider.membershipEndsAt.toDateString()}. Renew to stay listed and keep receiving leads.`,
        href: '/provider-dashboard',
        dedupeKey: `renewal:${provider.id}:${month}`,
      });
    }
    await audit(tx, { actorId: financeUser?.id || null, action: 'finance.renewal_reminders', meta: { count: providers.length } });
  });
  return { queued: providers.length };
}

export async function ledgerCsv({ range = '30d', filter = 'ALL' }) {
  const rates = await getRates();
  const rows = await ledgerRows({ from: since(range), filter, rates, take: 5000 });
  const header = ['date', 'type', 'kind', 'description', 'detail', 'status', 'gross_usd', 'fee_usd', 'entry_id'];
  return [header, ...rows.map((row) => [row.createdAt.toISOString(), row.type, row.kind, row.title, row.meta, row.status, row.gross, row.fee, row.id])]
    .map((row) => row.map(csvCell).join(','))
    .join('\r\n');
}

// Pools whose creators asked for a release that needs a finance review.
export async function poolReviews() {
  const pools = await prisma.pool.findMany({
    where: { releaseRequestedAt: { not: null }, status: { not: 'RELEASED' } },
    orderBy: { releaseRequestedAt: 'asc' },
    include: { creator: { select: { name: true } } },
    take: 20,
  });
  return pools.map((pool) => ({
    slug: pool.slug,
    title: pool.title,
    creator: shortName(pool.creator.name),
    points: pool.raisedPoints.toLocaleString('en-US'),
    contributors: pool.contributorCount,
    asked: shortDate(pool.releaseRequestedAt),
  }));
}

export async function payoutQueue() {
  const payouts = await prisma.payout.findMany({
    where: { status: { in: ['REQUESTED', 'APPROVED'] } },
    orderBy: { requestedAt: 'asc' },
    include: { user: { select: { name: true } } },
    take: 100,
  });
  return payouts.map((payout) => ({
    id: payout.id,
    reference: payout.reference,
    who: payout.user.name,
    destination: payout.destinationLabel,
    status: payout.status,
    net: payout.currency === 'PTS' ? `${(payout.amountMinor - payout.feeMinor).toLocaleString('en-US')} pts` : formatMoney(payout.amountMinor - payout.feeMinor, payout.currency),
    requested: shortDate(payout.requestedAt),
  }));
}
