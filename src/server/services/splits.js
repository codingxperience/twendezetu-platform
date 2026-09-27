// Split pay: one person holds seats for a group, everyone pays their own
// share from a link, and each QR ticket is issued the moment its share is
// paid. Seats are held for 72 hours; unpaid seats go back on sale after that.

import { prisma, transaction } from '../db.js';
import { audit } from '../audit.js';
import { badRequest, conflict, invalid, notFound, unauthorized } from '../errors.js';
import { accounts, post } from '../ledger.js';
import { getRates } from '../fx.js';
import { FEES, LIMITS } from '../fees.js';
import { formatMoney, percentOf, pointsFor } from '../../shared/money.js';
import { createCharge, openCheckout } from '../payments/charges.js';
import { notify, notifyGuest } from '../notify/index.js';
import { randomToken } from '../security/crypto.js';
import { initials, shortName } from '../../shared/format.js';
import { requireStepUp } from './identity.js';
import { EVENT_FOR_CHECKOUT, afterPaid, notifyWaitlist, saleLines, uniqueOrderReference } from './checkout.js';

export async function createSplit(user, { eventSlug, tierId, guests }) {
  const names = [user.name, ...guests.map((guest) => guest.name)].map((name) => String(name || '').trim()).filter(Boolean);
  if (names.length < 2) throw invalid('Add at least one other person to split with.');
  if (names.length > LIMITS.splitShareMax) throw invalid(`A split can have at most ${LIMITS.splitShareMax} people.`);

  const event = await prisma.event.findUnique({ where: { slug: eventSlug }, select: { id: true, slug: true, title: true, status: true, startsAt: true, tiers: true } });
  if (!event || event.status !== 'PUBLISHED') throw notFound('Tickets for this event are not on sale.');
  const tier = event.tiers.find((candidate) => candidate.id === tierId && candidate.active && candidate.kind === 'ONLINE');
  if (!tier || tier.priceMinor <= 0) throw badRequest('Choose a paid ticket type to split.');

  const shareMinor = tier.priceMinor + percentOf(tier.priceMinor, FEES.ticketServiceBps);
  const expiresAt = new Date(Math.min(Date.now() + LIMITS.splitLifetimeHours * 3600 * 1000, event.startsAt.getTime()));

  return transaction(async (tx) => {
    const taken = await tx.$executeRaw`
      UPDATE "TicketTier" SET "sold" = "sold" + ${names.length}
       WHERE "id" = ${tier.id} AND ("capacity" IS NULL OR "sold" + ${names.length} <= "capacity")`;
    if (!taken) throw conflict(`Not enough ${tier.name} tickets left for ${names.length} people.`, 'sold_out');

    const split = await tx.split.create({
      data: {
        slug: randomToken(9).toLowerCase().replace(/[^a-z0-9]/g, 'x'),
        eventId: event.id,
        tierId: tier.id,
        organizerId: user.id,
        shareMinor,
        currency: tier.currency,
        expiresAt,
        shares: {
          create: names.map((name, position) => ({
            position,
            name,
            email: position === 0 ? user.email : guests[position - 1]?.email?.trim().toLowerCase() || null,
            userId: position === 0 ? user.id : null,
          })),
        },
      },
    });
    await audit(tx, { actorId: user.id, action: 'split.created', targetType: 'Split', targetId: split.id, meta: { people: names.length } });
    for (const guest of guests.filter((candidate) => candidate.email)) {
      await notifyGuest(tx, {
        email: guest.email.trim().toLowerCase(),
        topic: 'SOCIAL',
        subject: `${shortName(user.name)} saved you a seat at ${event.title}`,
        body: `Your share is ${formatMoney(shareMinor, tier.currency)}. Pay it from the link and your QR ticket arrives straight away. The seat is held until ${expiresAt.toUTCString()}.`,
        href: `/split-pay?split=${split.slug}`,
      });
    }
    return { slug: split.slug, href: `/split-pay?split=${split.slug}` };
  });
}

export async function splitView(slug, viewer) {
  const split = await prisma.split.findUnique({
    where: { slug },
    include: {
      shares: { orderBy: { position: 'asc' } },
      event: { select: { title: true, slug: true } },
      tier: { select: { name: true } },
      organizer: { select: { id: true, name: true } },
    },
  });
  if (!split) return null;
  const isOrganizer = viewer?.id === split.organizerId;
  const paid = split.shares.filter((share) => share.status === 'PAID').length;
  return {
    slug: split.slug,
    status: split.status,
    eventTitle: split.event.title,
    eventSlug: split.event.slug,
    tierName: split.tier.name,
    organizerName: shortName(split.organizer.name),
    isOrganizer,
    share: formatMoney(split.shareMinor, split.currency),
    shareMinor: split.shareMinor,
    currency: split.currency,
    paidCount: paid,
    total: split.shares.length,
    collected: formatMoney(paid * split.shareMinor, split.currency),
    remaining: formatMoney((split.shares.length - paid) * split.shareMinor, split.currency),
    pct: `${Math.round((paid / split.shares.length) * 100)}%`,
    expiresAt: split.expiresAt.toISOString(),
    shares: split.shares.map((share) => ({
      position: share.position,
      init: initials(share.name),
      name: `${shortName(share.name)}${share.userId && share.userId === viewer?.id ? ' (you)' : ''}`,
      paid: share.status === 'PAID',
      meta: share.status === 'PAID'
        ? 'paid · QR issued'
        : share.position === 0 ? 'organizer of this split'
          : share.email ? (isOrganizer ? share.email.replace(/^(.{2}).*(@.*)$/, '$1…$2') : 'invited by email') : 'via share link',
      canRemind: isOrganizer && share.status === 'PENDING' && Boolean(share.email) && (!share.remindedAt || Date.now() - share.remindedAt.getTime() > 12 * 3600 * 1000),
      reminded: Boolean(share.remindedAt),
    })),
  };
}

async function loadOpenSplit(tx, slug) {
  const split = await tx.split.findUnique({ where: { slug }, include: { shares: true, tier: true } });
  if (!split) throw notFound('That split link is not valid.');
  if (split.status !== 'OPEN') throw conflict('This split is closed.', 'split_closed');
  if (split.expiresAt < new Date()) throw conflict('This split has expired and the seats went back on sale.', 'split_expired');
  return split;
}

async function createShareOrder(tx, split, share, { buyerId, buyerName, buyerEmail, channel }) {
  const fee = split.shareMinor - split.tier.priceMinor;
  const order = await tx.order.create({
    data: {
      reference: await uniqueOrderReference(tx),
      eventId: split.eventId,
      buyerId,
      buyerName,
      buyerEmail,
      currency: split.currency,
      subtotalMinor: split.tier.priceMinor,
      discountMinor: 0,
      feeMinor: fee,
      totalMinor: split.shareMinor,
      channel,
      status: 'PENDING',
      expiresAt: channel === 'CARD' ? split.expiresAt : null,
      items: { create: [{ tierId: split.tierId, quantity: 1, unitPriceMinor: split.tier.priceMinor }] },
    },
  });
  await tx.splitShare.update({ where: { id: share.id }, data: { orderId: order.id } });
  return order;
}

// Pays one share. Signed-in members can pay with points or card; people
// following the link without an account pay by card.
// `stepUpDone` is set only by coverRemaining, which checks the code once for
// the whole batch; it is never taken from a request body.
export async function payShare({ slug, position, viewer, name, email, channel, code, stepUpDone = false }) {
  if (channel === 'POINTS' && !viewer) throw unauthorized('Sign in to pay with Twende points.');
  if (channel === 'POINTS' && !stepUpDone) await requireStepUp(viewer, code);
  const rates = channel === 'POINTS' ? await getRates() : null;

  const outcome = await transaction(async (tx) => {
    const split = await loadOpenSplit(tx, slug);
    await tx.$queryRaw`SELECT "id" FROM "SplitShare" WHERE "splitId" = ${split.id} AND "position" = ${position} FOR UPDATE`;
    const share = await tx.splitShare.findUnique({ where: { splitId_position: { splitId: split.id, position } } });
    if (!share) throw notFound();
    if (share.status === 'PAID') throw conflict('This share is already paid.', 'share_paid');
    if (share.orderId) {
      const pending = await tx.order.findUnique({ where: { id: share.orderId }, select: { status: true } });
      if (pending?.status === 'PENDING') throw conflict('A payment for this share is in progress. Try again in a few minutes.', 'share_pending');
    }

    const buyerName = (viewer?.name || name || share.name).trim();
    const buyerEmail = (viewer?.email || email || share.email || '').trim().toLowerCase();
    if (!buyerEmail) throw invalid('Add your email so we can send your QR ticket.');
    const order = await createShareOrder(tx, split, share, { buyerId: viewer?.id || null, buyerName, buyerEmail, channel });

    if (channel === 'POINTS') {
      const points = pointsFor(order.totalMinor, order.currency, rates);
      await post(tx, {
        kind: 'TICKET_SALE',
        memo: `Split share · order ${order.reference}`,
        reference: order.id,
        idempotencyKey: `order:${order.id}:paid`,
        actorId: viewer.id,
        meta: { orderReference: order.reference, points, splitId: split.id },
        lines: saleLines(order, [
          { account: accounts.wallet(viewer.id), amount: -points },
          { account: accounts.fx('PTS'), amount: points },
          { account: accounts.fx(order.currency), amount: -order.totalMinor },
        ]),
      });
      const paid = await tx.order.update({ where: { id: order.id }, data: { status: 'PAID', paidAt: new Date(), pointsSpent: points } });
      await completeShare(tx, paid, share.name);
      return { paid: true };
    }

    const charge = await createCharge(tx, {
      purpose: 'ORDER',
      subjectId: order.id,
      userId: viewer?.id || null,
      email: buyerEmail,
      amountMinor: order.totalMinor,
      currency: order.currency,
      description: `Split share — ${split.tier.name}`,
      returnPath: `/split-pay?split=${slug}`,
    });
    return { charge };
  });

  if (outcome.charge?.mode === 'test') {
    const { completePayment } = await import('../payments/fulfil.js');
    await completePayment(outcome.charge.paymentId, { processorRef: null, meta: { test: true } });
    return { paid: true, mode: 'test' };
  }
  if (outcome.charge) return { paid: false, mode: 'stripe', redirectUrl: await openCheckout(outcome.charge) };
  return outcome;
}

// Issues the ticket for a paid share and closes the split when everyone has
// paid. Called for points payments above and from payments/fulfil.js for card.
export async function completeShare(tx, order, holderName) {
  const share = await tx.splitShare.findUnique({ where: { orderId: order.id }, include: { split: { include: { tier: true } } } });
  if (!share) return false;
  const event = await tx.event.findUnique({ where: { id: order.eventId }, select: EVENT_FOR_CHECKOUT });
  await afterPaid(tx, order, event, [{ tier: share.split.tier, quantity: 1 }], [holderName || share.name]);
  await tx.splitShare.update({ where: { id: share.id }, data: { status: 'PAID', paidAt: new Date() } });
  const remaining = await tx.splitShare.count({ where: { splitId: share.splitId, status: 'PENDING' } });
  if (!remaining) {
    await tx.split.update({ where: { id: share.splitId }, data: { status: 'COMPLETED', completedAt: new Date() } });
  }
  if (share.split.organizerId !== order.buyerId) {
    await notify(tx, {
      userId: share.split.organizerId,
      topic: 'SOCIAL',
      title: `${shortName(share.name)} paid their share`,
      body: remaining ? `${remaining} share${remaining === 1 ? '' : 's'} still to pay for ${event.title}.` : `Everyone has paid — all tickets for ${event.title} are issued.`,
      href: `/split-pay?split=${share.split.slug}`,
    });
  }
  return true;
}

export async function remindShare(user, slug, position) {
  const split = await prisma.split.findUnique({ where: { slug }, include: { event: { select: { title: true } } } });
  if (!split || split.organizerId !== user.id) throw notFound();
  if (split.status !== 'OPEN') throw conflict('This split is closed.', 'split_closed');
  const share = await prisma.splitShare.findUnique({ where: { splitId_position: { splitId: split.id, position } } });
  if (!share || share.status !== 'PENDING') throw badRequest('That share is already paid.');
  if (!share.email) throw badRequest('We have no email for this person — send them the link instead.');
  if (share.remindedAt && Date.now() - share.remindedAt.getTime() < 12 * 3600 * 1000) {
    throw conflict('You reminded them recently. You can nudge again in 12 hours.', 'recently_reminded');
  }
  await transaction(async (tx) => {
    await tx.splitShare.update({ where: { id: share.id }, data: { remindedAt: new Date() } });
    await notifyGuest(tx, {
      email: share.email,
      topic: 'SOCIAL',
      subject: `Reminder: your seat at ${split.event.title}`,
      body: `${shortName(user.name)} is holding a seat for you. Your share is ${formatMoney(split.shareMinor, split.currency)}.`,
      href: `/split-pay?split=${split.slug}`,
    });
  });
  return { reminded: true };
}

// The organizer pays every remaining share from their points.
export async function coverRemaining(user, slug, code) {
  const split = await prisma.split.findUnique({ where: { slug }, include: { shares: true } });
  if (!split || split.organizerId !== user.id) throw notFound();
  const pending = split.shares.filter((share) => share.status === 'PENDING');
  if (!pending.length) throw badRequest('Every share is already paid.');
  await requireStepUp(user, code);
  for (const share of pending) {
    await payShare({ slug, position: share.position, viewer: user, channel: 'POINTS', name: share.name, email: share.email || user.email, stepUpDone: true });
  }
  return { covered: pending.length };
}

export async function expireSplits() {
  const stale = await prisma.split.findMany({ where: { status: 'OPEN', expiresAt: { lt: new Date() } }, include: { shares: true, event: { select: { title: true } } }, take: 100 });
  for (const split of stale) {
    await transaction(async (tx) => {
      const { count } = await tx.split.updateMany({ where: { id: split.id, status: 'OPEN' }, data: { status: 'CANCELLED' } });
      if (!count) return;
      const unpaid = split.shares.filter((share) => share.status === 'PENDING').length;
      if (unpaid) {
        await tx.$executeRaw`UPDATE "TicketTier" SET "sold" = GREATEST(0, "sold" - ${unpaid}) WHERE "id" = ${split.tierId}`;
        await notifyWaitlist(tx, split.tierId, unpaid);
      }
      await notify(tx, {
        userId: split.organizerId,
        topic: 'SOCIAL',
        title: `Split closed: ${split.event.title}`,
        body: unpaid ? `${unpaid} unpaid seat${unpaid === 1 ? ' was' : 's were'} released back on sale. Everyone who paid keeps their ticket.` : 'Everyone paid.',
        href: `/split-pay?split=${split.slug}`,
      });
    });
  }
  return stale.length;
}

export async function splitsForUser(userId) {
  const splits = await prisma.split.findMany({ where: { organizerId: userId }, orderBy: { createdAt: 'desc' }, take: 5, select: { slug: true } });
  return splits.map((split) => split.slug);
}

