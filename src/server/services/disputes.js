// Disputes. Opening a case freezes the money: booking escrow stops its
// automatic release and an event's ticket escrow waits. The other side has
// 72 hours to refund, offer part of it, or contest; after that the case goes
// to the resolution team, whose ruling moves the money.

import { prisma, transaction } from '../db.js';
import { audit } from '../audit.js';
import { badRequest, conflict, forbidden, invalid, notFound } from '../errors.js';
import { accounts, post } from '../ledger.js';
import { ESCROW } from '../fees.js';
import { formatMoney } from '../../shared/money.js';
import { notify } from '../notify/index.js';
import { reference } from '../security/crypto.js';
import { refundOrder } from './checkout.js';
import { releaseBooking } from './marketplace.js';
import { relativeTime, shortDate } from '../../shared/format.js';

export const REASONS = Object.freeze({
  EVENT_CANCELLED: ['Event cancelled or moved', 'Automatic full refund if the organizer cancelled'],
  NO_SHOW: ['Provider no-show', 'The provider never arrived or stopped responding'],
  NOT_AS_DESCRIBED: ['Not as described', 'What arrived differs materially from the offer'],
  CHARGED_INCORRECTLY: ['Charged incorrectly', 'Double charge, wrong amount, or unknown charge'],
});

const LIVE = ['OPEN', 'ESCALATED'];

// Purchases this person can open a case on: paid ticket orders and funded
// bookings from the last 60 days.
export async function eligiblePurchases(userId) {
  const since = new Date(Date.now() - 60 * 86_400_000);
  const [orders, bookings] = await Promise.all([
    prisma.order.findMany({
      where: { buyerId: userId, status: 'PAID', paidAt: { gte: since } },
      include: { event: { select: { title: true } }, _count: { select: { tickets: true } } },
      orderBy: { paidAt: 'desc' },
      take: 10,
    }),
    prisma.booking.findMany({
      where: { customerId: userId, status: { in: ['ESCROWED', 'DISPUTED', 'RELEASED'] }, escrowedAt: { gte: since } },
      include: { provider: { select: { name: true } } },
      orderBy: { escrowedAt: 'desc' },
      take: 10,
    }),
  ]);
  return [
    ...orders.map((order) => ({
      kind: 'order',
      id: order.id,
      title: `${order.event.title} — ${order._count.tickets} ticket${order._count.tickets === 1 ? '' : 's'}`,
      meta: `ORDER ${order.reference} · PAID ${shortDate(order.paidAt)} · ${order.channel === 'POINTS' ? 'POINTS' : 'CARD'}`,
      amount: formatMoney(order.totalMinor, order.currency),
    })),
    ...bookings.map((booking) => ({
      kind: 'booking',
      id: booking.id,
      title: `${booking.provider.name} — ${booking.title}`,
      meta: `BOOKING ${booking.reference} · ${booking.status === 'RELEASED' ? 'PAID OUT' : 'ESCROW HELD'}`,
      amount: formatMoney(booking.amountMinor, booking.currency),
    })),
  ];
}

export async function openDispute(user, { orderId, bookingId, reason, detail, evidenceFileIds = [] }) {
  if (!REASONS[reason]) throw invalid('Pick what happened so we can route the case.');
  const text = String(detail || '').trim();
  if (text.length < 10) throw invalid('Add a short description — the other side needs context to respond.');

  let subject;
  if (orderId) {
    const order = await prisma.order.findUnique({ where: { id: orderId }, include: { event: { select: { title: true, status: true, organizer: { select: { ownerId: true } } } } } });
    if (!order || order.buyerId !== user.id) throw notFound();
    if (order.status !== 'PAID') throw badRequest('Only paid orders can be disputed.');
    subject = { orderId: order.id, amountMinor: order.totalMinor, currency: order.currency, respondentId: order.event.organizer.ownerId, title: order.event.title, cancelled: order.event.status === 'CANCELLED' };
  } else if (bookingId) {
    const booking = await prisma.booking.findUnique({ where: { id: bookingId }, include: { provider: { select: { ownerId: true, name: true } } } });
    if (!booking || booking.customerId !== user.id) throw notFound();
    if (!['ESCROWED', 'RELEASED'].includes(booking.status)) throw badRequest('Only funded bookings can be disputed.');
    subject = { bookingId: booking.id, amountMinor: booking.amountMinor, currency: booking.currency, respondentId: booking.provider.ownerId, title: `${booking.provider.name} — ${booking.title}`, released: booking.status === 'RELEASED' };
  } else {
    throw invalid('Choose the purchase this is about.');
  }

  if (evidenceFileIds.length) {
    const files = await prisma.fileObject.findMany({ where: { id: { in: evidenceFileIds }, ownerId: user.id, purpose: 'DISPUTE_EVIDENCE' }, select: { id: true } });
    if (files.length !== evidenceFileIds.length) throw forbidden('One of the attachments is not available.');
  }

  const dispute = await transaction(async (tx) => {
    const created = await tx.dispute.create({
      data: {
        reference: reference('DSP', 6),
        openedById: user.id,
        respondentId: subject.respondentId,
        orderId: subject.orderId || null,
        bookingId: subject.bookingId || null,
        reason,
        detail: text.slice(0, 2000),
        amountMinor: subject.amountMinor,
        currency: subject.currency,
        respondBy: new Date(Date.now() + ESCROW.disputeResponseHours * 3600 * 1000),
        evidence: { create: evidenceFileIds.map((fileId) => ({ fileId, uploadedBy: user.id })) },
        timeline: { create: [{ actorId: user.id, kind: 'opened', note: `Case opened · ${formatMoney(subject.amountMinor, subject.currency)} frozen` }] },
      },
    });
    if (subject.bookingId && !subject.released) {
      await tx.booking.update({ where: { id: subject.bookingId }, data: { status: 'DISPUTED' } });
    }
    await notify(tx, {
      userId: subject.respondentId,
      topic: 'MONEY',
      urgent: true,
      title: `Case ${created.reference} opened on ${subject.title}`,
      body: `${REASONS[reason][0]}. You have ${ESCROW.disputeResponseHours} hours to refund, offer a partial refund, or respond with your side.`,
      href: `/disputes?case=${created.reference}`,
    });
    await audit(tx, { actorId: user.id, action: 'dispute.opened', targetType: 'Dispute', targetId: created.id });
    return created;
  });

  // An organizer who cancelled owes a full refund; there is nothing to argue.
  if (reason === 'EVENT_CANCELLED' && subject.cancelled) {
    await resolveDispute(null, dispute.id, { outcome: 'refund', note: 'Automatic refund: the organizer cancelled the event.' });
  }
  return { reference: dispute.reference, id: dispute.id };
}

async function moveMoney(dispute, refundMinor, actorId) {
  if (!refundMinor) return;
  if (dispute.orderId) {
    await refundOrder(dispute.orderId, { actorId, reason: `Dispute ${dispute.reference}`, amountMinor: refundMinor, refundKey: `dispute:${dispute.id}` });
    return;
  }
  const booking = await prisma.booking.findUnique({ where: { id: dispute.bookingId }, include: { provider: { select: { ownerId: true } } } });
  const fromEscrow = booking.status === 'DISPUTED' || booking.status === 'ESCROWED';
  const escrowEntry = await prisma.journalEntry.findUnique({ where: { idempotencyKey: `booking:${booking.id}:escrow` } });
  const paidWithPoints = escrowEntry?.meta?.channel === 'POINTS';

  await transaction(async (tx) => {
    const source = fromEscrow ? accounts.bookingEscrow(booking.id, booking.currency) : accounts.earnings(booking.provider.ownerId, booking.currency);
    const points = paidWithPoints ? Math.floor((escrowEntry.meta.points * refundMinor) / booking.amountMinor) : 0;
    await post(tx, {
      kind: 'REFUND',
      memo: `Refund · ${booking.title} (${booking.reference})`,
      reference: booking.id,
      idempotencyKey: `refund:dispute:${dispute.id}`,
      actorId,
      meta: { dispute: dispute.reference, ...(points ? { points } : {}) },
      lines: paidWithPoints
        ? [
            { account: source, amount: -refundMinor },
            { account: accounts.fx(booking.currency), amount: refundMinor },
            { account: accounts.fx('PTS'), amount: -points },
            { account: accounts.wallet(booking.customerId), amount: points },
          ]
        : [
            { account: source, amount: -refundMinor },
            { account: accounts.paymentClearing(booking.currency), amount: refundMinor },
          ],
    });
  });

  if (!paidWithPoints) {
    const payment = await prisma.payment.findFirst({ where: { subjectId: booking.id, status: 'SUCCEEDED' } });
    if (payment) {
      const { refundCharge } = await import('../payments/charges.js');
      await refundCharge(payment, refundMinor, `dispute:${dispute.id}`);
    }
  }
}

// After a refund decision on a booking: whatever the customer did not get
// back goes to the provider as normal; a full refund cancels the booking.
async function settleBooking(dispute, refundMinor, actorId) {
  if (!dispute.bookingId) return;
  await transaction(async (tx) => {
    const [locked] = await tx.$queryRaw`SELECT "status", "amountMinor" FROM "Booking" WHERE "id" = ${dispute.bookingId} FOR UPDATE`;
    if (!locked || locked.status !== 'DISPUTED') return;
    if (refundMinor >= locked.amountMinor) {
      await tx.booking.update({ where: { id: dispute.bookingId }, data: { status: 'REFUNDED' } });
      return;
    }
    // Whatever was not refunded is still in escrow and goes to the provider.
    await tx.booking.update({ where: { id: dispute.bookingId }, data: { status: 'ESCROWED' } });
    await releaseBooking(tx, dispute.bookingId, actorId, `dispute ${dispute.reference} settled`);
  });
}

async function liveDispute(disputeId) {
  const dispute = await prisma.dispute.findUnique({ where: { id: disputeId } });
  if (!dispute) throw notFound();
  if (!LIVE.includes(dispute.status)) throw conflict('This case is already closed.', 'dispute_closed');
  return dispute;
}

// The other side's answer: refund in full, refund part, or contest.
export async function respondToDispute(user, disputeId, { action, refundMinor, note }) {
  const dispute = await liveDispute(disputeId);
  if (dispute.respondentId !== user.id) throw forbidden();
  if (action === 'contest') {
    await prisma.$transaction([
      prisma.dispute.update({ where: { id: dispute.id }, data: { status: 'ESCALATED' } }),
      prisma.disputeEvent.create({ data: { disputeId: dispute.id, actorId: user.id, kind: 'contested', note: note?.slice(0, 1000) || 'Contested' } }),
    ]);
    return { status: 'ESCALATED' };
  }
  const amount = action === 'refund' ? dispute.amountMinor : Number(refundMinor);
  if (!Number.isInteger(amount) || amount <= 0 || amount > dispute.amountMinor) throw invalid('Enter a refund between 1 and the amount paid.');
  return resolveDispute(user, dispute.id, { outcome: amount >= dispute.amountMinor ? 'refund' : 'partial', refundMinor: amount, note, byRespondent: true });
}

export async function resolveDispute(actor, disputeId, { outcome, refundMinor, note, byRespondent = false }) {
  const dispute = await liveDispute(disputeId);
  const amount = outcome === 'refund' ? dispute.amountMinor : outcome === 'partial' ? Number(refundMinor) : 0;
  if (outcome === 'partial' && (!Number.isInteger(amount) || amount <= 0 || amount >= dispute.amountMinor)) throw invalid('A partial refund must be less than the full amount.');

  // Money first: every step is idempotent, so a retry after a failure (or a
  // second resolver racing this one) can never move it twice.
  await moveMoney(dispute, amount, actor?.id || null);

  const claimed = await prisma.dispute.updateMany({
    where: { id: dispute.id, status: { in: LIVE } },
    data: {
      status: outcome === 'refund' ? 'RESOLVED_REFUNDED' : outcome === 'partial' ? 'RESOLVED_PARTIAL' : 'RESOLVED_DENIED',
      refundMinor: amount,
      resolution: note?.slice(0, 1000) || null,
      resolvedById: actor?.id || null,
      resolvedAt: new Date(),
    },
  });
  if (!claimed.count) throw conflict('This case is already closed.', 'dispute_closed');
  await settleBooking(dispute, amount, actor?.id || null);

  await transaction(async (tx) => {
    await tx.disputeEvent.create({
      data: { disputeId: dispute.id, actorId: actor?.id || null, kind: 'resolved', note: `${byRespondent ? 'Settled by the other party' : 'Decision'}: ${amount ? `${formatMoney(amount, dispute.currency)} refunded` : 'no refund'}${note ? ` — ${note}` : ''}` },
    });
    for (const userId of [dispute.openedById, dispute.respondentId].filter(Boolean)) {
      await notify(tx, {
        userId,
        topic: 'MONEY',
        urgent: true,
        title: `Case ${dispute.reference} closed`,
        body: amount ? `${formatMoney(amount, dispute.currency)} was refunded.` : 'The case closed without a refund.',
        href: `/disputes?case=${dispute.reference}`,
      });
    }
    await audit(tx, { actorId: actor?.id || null, action: 'dispute.resolved', targetType: 'Dispute', targetId: dispute.id, meta: { outcome, amount } });
  });
  return { status: outcome, refunded: amount };
}

export async function withdrawDispute(user, disputeId) {
  const dispute = await liveDispute(disputeId);
  if (dispute.openedById !== user.id) throw forbidden();
  await transaction(async (tx) => {
    await tx.dispute.update({ where: { id: dispute.id }, data: { status: 'WITHDRAWN', resolvedAt: new Date() } });
    if (dispute.bookingId) {
      const booking = await tx.booking.findUnique({ where: { id: dispute.bookingId } });
      if (booking.status === 'DISPUTED') await tx.booking.update({ where: { id: booking.id }, data: { status: 'ESCROWED' } });
    }
    await tx.disputeEvent.create({ data: { disputeId: dispute.id, actorId: user.id, kind: 'withdrawn', note: 'Case withdrawn by the person who opened it' } });
    if (dispute.respondentId) {
      await notify(tx, { userId: dispute.respondentId, topic: 'MONEY', title: `Case ${dispute.reference} withdrawn`, body: 'The case was withdrawn and the money is no longer frozen.', href: '/disputes' });
    }
  });
  return { status: 'WITHDRAWN' };
}

export async function escalateOverdueDisputes() {
  const overdue = await prisma.dispute.findMany({ where: { status: 'OPEN', respondBy: { lt: new Date() } }, select: { id: true } });
  for (const { id } of overdue) {
    await prisma.$transaction([
      prisma.dispute.update({ where: { id }, data: { status: 'ESCALATED' } }),
      prisma.disputeEvent.create({ data: { disputeId: id, kind: 'escalated', note: 'No response within 72 hours — sent to the resolution team' } }),
    ]);
  }
  return overdue.length;
}

export async function disputesForUser(userId) {
  const disputes = await prisma.dispute.findMany({
    where: { OR: [{ openedById: userId }, { respondentId: userId }] },
    include: { timeline: { orderBy: { createdAt: 'asc' } } },
    orderBy: { createdAt: 'desc' },
    take: 10,
  });
  return disputes.map((dispute) => ({
    id: dispute.id,
    reference: dispute.reference,
    status: dispute.status,
    mine: dispute.openedById === userId,
    reason: REASONS[dispute.reason][0],
    amount: formatMoney(dispute.amountMinor, dispute.currency),
    amountMinor: dispute.amountMinor,
    respondBy: dispute.respondBy,
    respondIn: dispute.status === 'OPEN' ? `${Math.max(0, Math.ceil((dispute.respondBy.getTime() - Date.now()) / 3_600_000))}H LEFT` : null,
    timeline: dispute.timeline.map((event) => ({ kind: event.kind, note: event.note, when: relativeTime(event.createdAt) })),
  }));
}
