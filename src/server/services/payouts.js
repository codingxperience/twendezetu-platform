// Earnings and withdrawals for providers and organizers, the finance team's
// payout batches, and the automatic release of ticket escrow after events.

import { prisma, transaction, toNumber } from '../db.js';
import { audit } from '../audit.js';
import { badRequest, conflict, invalid, notFound } from '../errors.js';
import { accounts, balancesByCurrency, post, statement } from '../ledger.js';
import { ESCROW, FEES } from '../fees.js';
import { formatCompact, formatMoney, toMajor } from '../../shared/money.js';
import { getRates } from '../fx.js';
import { csvCell } from './wallet.js';
import { notify } from '../notify/index.js';
import { reference } from '../security/crypto.js';
import { requireStepUp } from './identity.js';
import { shortDate } from '../../shared/format.js';

// Where a person follows their withdrawals: points in the points wallet,
// business money in the provider wallet or, for organizers, payouts.
async function walletHref(db, userId, currency) {
  if (currency === 'PTS') return '/points-wallet';
  return (await db.provider.count({ where: { ownerId: userId } })) ? '/provider-wallet' : '/organizer-payouts';
}

export async function payoutMethods(userId) {
  const methods = await prisma.paymentMethod.findMany({
    where: { userId, deletedAt: null, kind: { in: ['MPESA', 'MTN_MOMO', 'AIRTEL_MONEY', 'BANK'] } },
    orderBy: [{ isDefault: 'desc' }, { createdAt: 'asc' }],
    select: { id: true, label: true, kind: true, isDefault: true },
  });
  return methods;
}

export async function earnings(userId) {
  return balancesByCurrency(prisma, 'EARNINGS', userId);
}

export async function requestWithdrawal(user, { currency, amountMinor, methodId, code }) {
  if (!Number.isInteger(amountMinor) || amountMinor <= 0) throw invalid('Enter an amount above 0.');
  const fee = FEES.withdrawalFeeMinor[currency];
  if (fee == null) throw badRequest('Withdrawals are not available in that currency.');
  if (amountMinor <= fee) throw invalid(`Withdraw more than the ${formatMoney(fee, currency)} fee.`);
  const method = await prisma.paymentMethod.findFirst({ where: { id: methodId, userId: user.id, deletedAt: null } });
  if (!method || !['MPESA', 'MTN_MOMO', 'AIRTEL_MONEY', 'BANK'].includes(method.kind)) throw notFound('Choose one of your payout methods.');
  await requireStepUp(user, code);

  const payoutReference = reference('WD', 6);
  await transaction(async (tx) => {
    await post(tx, {
      kind: 'PAYOUT',
      memo: `Withdrawal to ${method.label}`,
      reference: payoutReference,
      actorId: user.id,
      meta: { destination: method.label, fee, reference: payoutReference },
      lines: [
        { account: accounts.earnings(user.id, currency), amount: -amountMinor },
        { account: accounts.payoutClearing(currency), amount: amountMinor - fee },
        { account: accounts.revenue(currency), amount: fee },
      ],
    });
    const source = await tx.ledgerAccount.findUniqueOrThrow({
      where: { kind_ownerKey_currency: { kind: 'EARNINGS', ownerKey: user.id, currency } },
      select: { id: true },
    });
    await tx.payout.create({
      data: { reference: payoutReference, userId: user.id, accountId: source.id, methodId: method.id, destinationLabel: method.label, amountMinor, feeMinor: fee, currency },
    });
    await audit(tx, { actorId: user.id, action: 'payout.requested', targetType: 'Payout', targetId: payoutReference, meta: { amountMinor, currency } });
    await notify(tx, {
      userId: user.id,
      topic: 'MONEY',
      urgent: true,
      title: 'Withdrawal requested',
      body: `${formatMoney(amountMinor - fee, currency)} to ${method.label} after the ${formatMoney(fee, currency)} fee. Reference ${payoutReference}.`,
      href: await walletHref(tx, user.id, currency),
    });
  });
  return { reference: payoutReference, net: amountMinor - fee, fee };
}

// Moves business earnings into the owner's personal points wallet, to spend
// on tickets, bookings or pools. No fee: the money stays on the platform.
// Points are rounded down, so a conversion never credits more than it takes.
export async function earningsToPoints(user, { currency, amountMinor, code }) {
  if (!Number.isInteger(amountMinor) || amountMinor <= 0) throw invalid('Enter an amount above 0.');
  const rates = await getRates();
  const rate = currency === 'USD' ? 1 : rates[currency];
  if (!rate) throw badRequest('Points conversion is not available in that currency.');
  const points = Math.floor((toMajor(amountMinor, currency) / rate) * 100);
  if (points < 1) throw invalid('That amount is worth less than one point.');
  await requireStepUp(user, code);

  await transaction(async (tx) => {
    await post(tx, {
      kind: 'CONVERSION',
      memo: `Business earnings to points (${formatMoney(amountMinor, currency)})`,
      reference: user.id,
      actorId: user.id,
      meta: { currency, amountMinor, points, rate },
      lines: [
        { account: accounts.earnings(user.id, currency), amount: -amountMinor },
        { account: accounts.fx(currency), amount: amountMinor },
        { account: accounts.fx('PTS'), amount: -points },
        { account: accounts.wallet(user.id), amount: points },
      ],
    });
    await audit(tx, { actorId: user.id, action: 'earnings.to_points', targetType: 'User', targetId: user.id, meta: { currency, amountMinor, points } });
  });
  return { points, amount: formatMoney(amountMinor, currency) };
}

export async function earningsStatementCsv(userId, currency) {
  const rows = [['date', 'type', 'description', 'detail', 'amount', 'currency']];
  let cursor;
  for (let page = 0; page < 40; page += 1) {
    const result = await statement(prisma, accounts.earnings(userId, currency), { take: 250, cursor });
    for (const line of result.lines) {
      const row = earningsRow(line);
      rows.push([new Date(line.createdAt).toISOString(), line.entry.kind, row.title, row.meta, String(toMajor(line.amount, currency)), currency]);
    }
    if (!result.nextCursor) break;
    cursor = result.nextCursor;
  }
  return rows.map((row) => row.map(csvCell).join(',')).join('\r\n');
}

// ── Provider wallet view ──────────────────────────────────────────────────

function earningsRow(line) {
  const { entry } = line;
  const meta = entry.meta || {};
  const when = shortDate(new Date(entry.createdAt));
  const amount = formatCompact(Math.abs(line.amount), line.currency);
  switch (entry.kind) {
    case 'ESCROW_RELEASE':
      if (meta.eventId) return { icon: 'T', type: 'TICKETS', title: entry.memo, meta: `${when} · TICKET ESCROW RELEASED`, amount: `+${amount}`, in: true };
      return {
        icon: 'J',
        type: 'JOBS',
        title: entry.memo,
        meta: `${when} · GROSS ${formatCompact(meta.gross, line.currency)} · FEE ${formatCompact(meta.fee, line.currency)}`,
        amount: `+${amount}`,
        in: true,
      };
    case 'PAYOUT':
      return { icon: 'W', type: 'PAYOUTS', title: entry.memo, meta: `${when} · FEE ${formatCompact(meta.fee, line.currency)} · REF ${meta.reference}`, amount: `−${amount}`, in: false };
    case 'PAYOUT_REVERSAL':
      return { icon: '↺', type: 'PAYOUTS', title: 'Withdrawal returned', meta: `${when} · ${meta.reason || ''}`.trim(), amount: `+${amount}`, in: true };
    case 'REFUND':
      return { icon: 'R', type: 'FEES', title: entry.memo, meta: `${when} · REFUND AFTER RELEASE`, amount: `−${amount}`, in: false };
    case 'CONVERSION':
      return { icon: 'P', type: 'PAYOUTS', title: 'Moved to your points wallet', meta: `${when} · ${Number(meta.points || 0).toLocaleString('en-US')} POINTS`, amount: `−${amount}`, in: false };
    default:
      return { icon: '·', type: 'FEES', title: entry.memo, meta: when, amount: `${line.amount < 0 ? '−' : '+'}${amount}`, in: line.amount > 0 };
  }
}

export async function providerWallet(user) {
  const provider = await prisma.provider.findUnique({ where: { ownerId: user.id }, select: { id: true, rateCurrency: true } });
  const currency = provider?.rateCurrency || user.currency || 'USD';
  const balances = await earnings(user.id);
  const available = balances[currency] || 0;

  const [page, escrowed, memberships, methods] = await Promise.all([
    statement(prisma, accounts.earnings(user.id, currency), { take: 30 }),
    provider ? prisma.booking.findMany({ where: { providerId: provider.id, status: { in: ['ESCROWED', 'DISPUTED'] } }, orderBy: { escrowedAt: 'desc' } }) : [],
    provider ? prisma.membership.findMany({ where: { providerId: provider.id }, orderBy: { createdAt: 'desc' }, take: 3 }) : [],
    payoutMethods(user.id),
  ]);

  const activity = [
    ...escrowed.map((booking) => ({
      icon: 'E',
      type: 'ESCROW',
      title: `Escrow hold: ${booking.title} (${booking.reference})`,
      meta: booking.status === 'DISPUTED' ? 'FROZEN · DISPUTE OPEN' : `RELEASES ${booking.releaseAfter ? shortDate(booking.releaseAfter) : 'ON CONFIRM'}`,
      amount: formatCompact(booking.amountMinor, booking.currency),
      in: null,
      at: booking.escrowedAt,
    })),
    ...memberships.map((membership) => ({
      icon: 'M',
      type: 'FEES',
      title: 'Membership (12 months)',
      meta: `${shortDate(membership.createdAt)} · UNTIL ${shortDate(membership.endsAt)}`,
      amount: `−${formatCompact(membership.amountMinor, membership.currency)}`,
      in: false,
      at: membership.createdAt,
    })),
    ...page.lines.map((line) => ({ ...earningsRow(line), at: line.createdAt })),
  ].sort((a, b) => new Date(b.at) - new Date(a.at));

  const escrowTotal = escrowed.filter((booking) => booking.currency === currency).reduce((sum, booking) => sum + booking.amountMinor, 0);
  return {
    currency,
    available,
    availableLabel: formatCompact(available, currency),
    escrowLabel: formatCompact(escrowTotal, currency),
    otherBalances: Object.entries(balances).filter(([code, value]) => code !== currency && value > 0).map(([code, value]) => formatMoney(value, code)),
    fee: FEES.withdrawalFeeMinor[currency] ?? null,
    feeLabel: FEES.withdrawalFeeMinor[currency] != null ? formatCompact(FEES.withdrawalFeeMinor[currency], currency) : null,
    methods,
    activity,
  };
}

// ── Finance operations ────────────────────────────────────────────────────

export async function pendingPayoutSummary() {
  const rows = await prisma.payout.groupBy({ by: ['currency'], where: { status: 'REQUESTED' }, _sum: { amountMinor: true, feeMinor: true }, _count: { _all: true } });
  return rows.map((row) => ({ currency: row.currency, count: row._count._all, net: (row._sum.amountMinor || 0) - (row._sum.feeMinor || 0) }));
}

export async function approvePayoutBatch(financeUser) {
  const requested = await prisma.payout.findMany({ where: { status: 'REQUESTED' }, select: { id: true, currency: true, amountMinor: true, feeMinor: true } });
  if (!requested.length) throw conflict('There are no withdrawals waiting for approval.', 'empty_batch');
  const totals = {};
  for (const payout of requested) totals[payout.currency] = (totals[payout.currency] || 0) + payout.amountMinor - payout.feeMinor;
  return transaction(async (tx) => {
    const batch = await tx.payoutBatch.create({
      data: { reference: reference('PB', 6), approvedById: financeUser.id, payoutCount: requested.length, totals },
    });
    const { count } = await tx.payout.updateMany({
      where: { id: { in: requested.map((payout) => payout.id) }, status: 'REQUESTED' },
      data: { status: 'APPROVED', approvedAt: new Date(), batchId: batch.id },
    });
    await audit(tx, { actorId: financeUser.id, action: 'payout.batch_approved', targetType: 'PayoutBatch', targetId: batch.id, meta: { count, totals } });
    return { reference: batch.reference, count, totals };
  });
}

async function payoutSourceDescriptor(tx, payout) {
  const account = await tx.ledgerAccount.findUnique({ where: { id: payout.accountId }, select: { kind: true, ownerKey: true, currency: true } });
  return { kind: account.kind, ownerKey: account.ownerKey, currency: account.currency };
}

// Records that the money actually left (mobile money or bank reference).
export async function markPayoutPaid(financeUser, payoutId, externalRef) {
  const payout = await prisma.payout.findUnique({ where: { id: payoutId } });
  if (!payout) throw notFound();
  if (payout.status !== 'APPROVED') throw conflict('Only approved withdrawals can be marked as paid.', 'not_approved');
  if (!externalRef) throw invalid('Add the transfer reference from the mobile money or bank statement.');
  const net = payout.amountMinor - payout.feeMinor;
  await transaction(async (tx) => {
    const claimed = await tx.payout.updateMany({ where: { id: payout.id, status: 'APPROVED' }, data: { status: 'PAID', paidAt: new Date(), externalRef } });
    if (!claimed.count) throw conflict('This withdrawal was already settled.', 'settled');
    await post(tx, {
      kind: 'PAYOUT',
      memo: `Paid out ${payout.reference} to ${payout.destinationLabel}`,
      reference: payout.reference,
      idempotencyKey: `payout:${payout.id}:paid`,
      actorId: financeUser.id,
      meta: { externalRef },
      lines: [
        { account: accounts.payoutClearing(payout.currency), amount: -net },
        { account: accounts.paymentClearing(payout.currency), amount: net },
      ],
    });
    await audit(tx, { actorId: financeUser.id, action: 'payout.paid', targetType: 'Payout', targetId: payout.id, meta: { externalRef } });
    await notify(tx, {
      userId: payout.userId,
      topic: 'MONEY',
      title: 'Withdrawal sent',
      body: `${payout.currency === 'PTS' ? `${net.toLocaleString('en-US')} points' value` : formatMoney(net, payout.currency)} was sent to ${payout.destinationLabel}. Reference ${externalRef}.`,
      href: await walletHref(tx, payout.userId, payout.currency),
    });
  });
  return { status: 'PAID' };
}

// A transfer that bounced: the full amount (fee included) goes back.
export async function markPayoutFailed(financeUser, payoutId, reason) {
  const payout = await prisma.payout.findUnique({ where: { id: payoutId } });
  if (!payout) throw notFound();
  if (!['REQUESTED', 'APPROVED'].includes(payout.status)) throw conflict('This withdrawal was already settled.', 'settled');
  await transaction(async (tx) => {
    const claimed = await tx.payout.updateMany({ where: { id: payout.id, status: { in: ['REQUESTED', 'APPROVED'] } }, data: { status: 'FAILED', failure: reason?.slice(0, 200) || 'Transfer failed' } });
    if (!claimed.count) throw conflict('This withdrawal was already settled.', 'settled');
    const source = await payoutSourceDescriptor(tx, payout);
    await post(tx, {
      kind: 'PAYOUT_REVERSAL',
      memo: `Withdrawal ${payout.reference} returned`,
      reference: payout.reference,
      idempotencyKey: `payout:${payout.id}:failed`,
      actorId: financeUser.id,
      meta: { reason },
      lines: [
        { account: accounts.payoutClearing(payout.currency), amount: -(payout.amountMinor - payout.feeMinor) },
        { account: accounts.revenue(payout.currency), amount: -payout.feeMinor },
        { account: source, amount: payout.amountMinor },
      ],
    });
    await audit(tx, { actorId: financeUser.id, action: 'payout.failed', targetType: 'Payout', targetId: payout.id, meta: { reason } });
    await notify(tx, {
      userId: payout.userId,
      topic: 'MONEY',
      urgent: true,
      title: 'Withdrawal could not be completed',
      body: `${payout.reference} was returned to your balance in full, fee included${reason ? `: ${reason}` : '.'} Check your payout details and try again.`,
      href: await walletHref(tx, payout.userId, payout.currency),
    });
  });
  return { status: 'FAILED' };
}

// ── Ticket escrow release ─────────────────────────────────────────────────

// An event with no end time is taken to run six hours.
const ASSUMED_EVENT_HOURS = 6;

// When an event's ticket money leaves escrow: 48 hours after it ends.
export function eventReleaseTime(event) {
  const end = event.endsAt || new Date(event.startsAt.getTime() + ASSUMED_EVENT_HOURS * 3600 * 1000);
  return new Date(end.getTime() + ESCROW.eventReleaseDelayHours * 3600 * 1000);
}

// Releases each finished event's ticket money to its organizer (see
// eventReleaseTime). An event with an open dispute waits until it closes.
export async function releaseEventEscrows() {
  const cutoff = new Date(Date.now() - ESCROW.eventReleaseDelayHours * 3600 * 1000);
  const events = await prisma.event.findMany({
    where: {
      payoutReleasedAt: null,
      status: { in: ['PUBLISHED', 'PAUSED', 'ARCHIVED'] },
      OR: [{ endsAt: { lt: cutoff } }, { endsAt: null, startsAt: { lt: new Date(cutoff.getTime() - ASSUMED_EVENT_HOURS * 3600 * 1000) } }],
    },
    select: { id: true, title: true, organizer: { select: { ownerId: true } } },
    take: 50,
  });

  let released = 0;
  for (const event of events) {
    const disputed = await prisma.dispute.count({ where: { status: { in: ['OPEN', 'ESCALATED'] }, order: { eventId: event.id } } });
    if (disputed) continue;
    await transaction(async (tx) => {
      const escrows = await tx.ledgerAccount.findMany({ where: { kind: 'EVENT_ESCROW', ownerKey: event.id } });
      for (const escrow of escrows) {
        const balance = toNumber(escrow.balance);
        if (balance <= 0) continue;
        await post(tx, {
          kind: 'ESCROW_RELEASE',
          memo: `Ticket sales: ${event.title}`,
          reference: event.id,
          idempotencyKey: `event:${event.id}:release:${escrow.currency}`,
          meta: { eventId: event.id },
          lines: [
            { account: accounts.eventEscrow(event.id, escrow.currency), amount: -balance },
            { account: accounts.earnings(event.organizer.ownerId, escrow.currency), amount: balance },
          ],
        });
        await notify(tx, {
          userId: event.organizer.ownerId,
          topic: 'MONEY',
          title: `Payout released: ${event.title}`,
          body: `${formatMoney(balance, escrow.currency)} from ticket sales is in your balance, ready to withdraw.`,
          href: '/organizer-payouts',
        });
      }
      await tx.event.update({ where: { id: event.id }, data: { payoutReleasedAt: new Date() } });
    });
    released += 1;
  }
  return released;
}

// ── Organizer payouts view ────────────────────────────────────────────────

const PAYOUT_STATUS = { REQUESTED: 'WAITING FOR BATCH', APPROVED: 'SENDING', PAID: 'PAID OUT', FAILED: 'RETURNED' };

// Ticket money an organizer has: available to withdraw, held per event until
// release, and what has been released and withdrawn, in one currency at a
// time. The currency defaults to wherever the money is.
export async function organizerPayouts(user, { currency: wanted } = {}) {
  // Only events whose money has not been released can still hold any, so
  // this stays small however many events an organizer has run.
  const [waitingEvents, balances, eventCount] = await Promise.all([
    prisma.event.findMany({
      where: { organizer: { ownerId: user.id }, isFree: false, payoutReleasedAt: null },
      select: { id: true, title: true, startsAt: true, endsAt: true },
    }),
    earnings(user.id),
    prisma.event.count({ where: { organizer: { ownerId: user.id }, isFree: false } }),
  ]);
  const eventIds = waitingEvents.map((event) => event.id);
  const [escrowAccounts, liveCases] = await Promise.all([
    prisma.ledgerAccount.findMany({ where: { kind: 'EVENT_ESCROW', ownerKey: { in: eventIds }, balance: { gt: 0 } } }),
    prisma.dispute.groupBy({ by: ['orderId'], where: { status: { in: ['OPEN', 'ESCALATED'] }, order: { eventId: { in: eventIds } } }, _count: { _all: true } }),
  ]);
  const casesByEvent = {};
  if (liveCases.length) {
    const orders = await prisma.order.findMany({ where: { id: { in: liveCases.map((row) => row.orderId) } }, select: { eventId: true } });
    for (const order of orders) casesByEvent[order.eventId] = (casesByEvent[order.eventId] || 0) + 1;
  }

  const held = escrowAccounts
    .map((account) => ({ eventId: account.ownerKey, currency: account.currency, amount: toNumber(account.balance) }))
    .filter((row) => row.amount > 0);
  const currencies = [...new Set([
    ...Object.entries(balances).filter(([, amount]) => amount !== 0).map(([code]) => code),
    ...held.map((row) => row.currency),
  ])];
  const fallback = Object.entries(balances).sort((a, b) => b[1] - a[1])[0]?.[0] || held[0]?.currency || user.currency || 'USD';
  const currency = currencies.includes(wanted) ? wanted : fallback;
  if (!currencies.includes(currency)) currencies.unshift(currency);

  const byId = Object.fromEntries(waitingEvents.map((event) => [event.id, event]));
  const waiting = held.filter((row) => row.currency === currency);
  const heldTotal = waiting.reduce((sum, row) => sum + row.amount, 0);
  const schedule = waiting
    .map((row) => {
      const event = byId[row.eventId];
      const releaseAt = eventReleaseTime(event);
      const cases = casesByEvent[event.id] || 0;
      return {
        title: event.title,
        releaseAt,
        when: cases
          ? `HELD WHILE ${cases === 1 ? 'A CASE IS' : `${cases} CASES ARE`} OPEN`
          : releaseAt.getTime() <= Date.now()
            ? 'RELEASING IN THE NEXT RUN'
            : `RELEASES ${shortDate(releaseAt)} · ${ESCROW.eventReleaseDelayHours}H AFTER THE EVENT`,
        amount: formatMoney(row.amount, currency),
        frozen: Boolean(cases),
      };
    })
    .sort((a, b) => a.releaseAt - b.releaseAt);

  const [payouts, releases] = await Promise.all([
    prisma.payout.findMany({ where: { userId: user.id, currency }, orderBy: { requestedAt: 'desc' }, take: 12 }),
    prisma.journalEntry.findMany({
      where: { kind: 'ESCROW_RELEASE', lines: { some: { currency, account: { kind: 'EARNINGS', ownerKey: user.id } } } },
      include: { lines: { where: { amount: { gt: 0 }, account: { kind: 'EARNINGS', ownerKey: user.id } } } },
      orderBy: { createdAt: 'desc' },
      take: 12,
    }),
  ]);

  // The same balance also takes booking releases for someone who is a
  // provider too; only ticket releases from their own events belong here.
  const ownEvents = new Set((await prisma.event.findMany({ where: { id: { in: releases.map((entry) => entry.reference).filter(Boolean) }, organizer: { ownerId: user.id } }, select: { id: true } })).map((event) => event.id));
  const ticketReleases = releases.filter((entry) => ownEvents.has(entry.reference));

  const history = [
    ...ticketReleases.map((entry) => ({
      title: entry.memo.replace('Ticket sales: ', ''),
      meta: `RELEASED ${shortDate(entry.createdAt)} · ADDED TO YOUR BALANCE`,
      status: 'RELEASED',
      tone: 'in',
      amount: `+${formatMoney(toNumber(entry.lines[0]?.amount || 0), currency)}`,
      at: entry.createdAt,
    })),
    ...payouts.map((payout) => ({
      title: `Withdrawal to ${payout.destinationLabel}`,
      meta: `${payout.reference} · ${payout.status === 'PAID' && payout.paidAt ? `SENT ${shortDate(payout.paidAt)}` : `ASKED ${shortDate(payout.requestedAt)}`} · ${formatMoney(payout.feeMinor, currency)} FEE`,
      status: PAYOUT_STATUS[payout.status] || payout.status,
      tone: payout.status === 'FAILED' ? 'failed' : payout.status === 'PAID' ? 'out' : 'pending',
      amount: `−${formatMoney(payout.amountMinor - payout.feeMinor, currency)}`,
      at: payout.requestedAt,
    })),
  ]
    .sort((a, b) => b.at - a.at)
    .slice(0, 15)
    .map(({ at: _at, ...row }) => row);

  const lastRelease = ticketReleases[0];
  const fee = FEES.withdrawalFeeMinor[currency] ?? null;
  return {
    currency,
    currencies,
    available: balances[currency] || 0,
    availableLabel: formatMoney(balances[currency] || 0, currency),
    lastRelease: lastRelease ? `last release: “${lastRelease.memo.replace('Ticket sales: ', '')}”, ${shortDate(lastRelease.createdAt)}` : null,
    heldLabel: formatMoney(heldTotal, currency),
    heldCount: schedule.length,
    fee,
    feeLabel: fee == null ? null : formatMoney(fee, currency),
    serviceFeePercent: FEES.ticketServiceBps / 100,
    releaseHours: ESCROW.eventReleaseDelayHours,
    methods: await payoutMethods(user.id),
    schedule: schedule.map(({ releaseAt: _releaseAt, ...row }) => row),
    history,
    hasEvents: eventCount > 0,
  };
}
