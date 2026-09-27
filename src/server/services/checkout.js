// Ticket checkout.
//
// Prices are always computed here from the database; the browser only says
// which tiers and how many. Inventory is taken with a conditional UPDATE, so
// two buyers racing for the last seat cannot both win, and a card checkout
// holds its seats until the payment settles or the hold expires.

import { prisma, transaction } from '../db.js';
import { config } from '../config.js';
import { audit } from '../audit.js';
import { badRequest, conflict, invalid, notFound, unauthorized, unavailable } from '../errors.js';
import { hmac, reference, safeEqual } from '../security/crypto.js';
import { accounts, post } from '../ledger.js';
import { getRates } from '../fx.js';
import { ESCROW, FEES, LIMITS } from '../fees.js';
import { formatMoney, percentOf, pointsFor } from '../../shared/money.js';
import { createCharge, openCheckout, refundCharge } from '../payments/charges.js';
import { notify, notifyGuest } from '../notify/index.js';
import { awardReferral } from './referrals.js';
import { ensureAttendeeRsvp } from './rsvps.js';
import { newTicketCode } from './tickets.js';
import { requireStepUp } from './identity.js';
import { dayLabel, timeLabel } from '../../shared/format.js';
import { log } from '../log.js';

const EVENT_FOR_CHECKOUT = {
  id: true, slug: true, title: true, status: true, hiddenAt: true, isFree: true, currency: true,
  startsAt: true, endsAt: true, timezone: true, venue: true, payoutReleasedAt: true,
  organizer: { select: { ownerId: true } },
};

export { EVENT_FOR_CHECKOUT };

export async function loadCheckoutEvent(slug) {
  const event = await prisma.event.findUnique({
    where: { slug },
    select: { ...EVENT_FOR_CHECKOUT, tiers: { where: { active: true }, orderBy: { sortOrder: 'asc' } } },
  });
  if (!event || event.status !== 'PUBLISHED' || event.hiddenAt) throw notFound('Tickets for this event are not on sale.');
  return event;
}

// ── Pricing ───────────────────────────────────────────────────────────────

async function findPromo(db, eventId, code) {
  if (!code) return null;
  const normalized = String(code).trim().toUpperCase();
  const promo = await db.promoCode.findUnique({ where: { eventId_code: { eventId, code: normalized } } });
  const now = new Date();
  if (!promo || !promo.active || (promo.startsAt && promo.startsAt > now) || (promo.endsAt && promo.endsAt < now)) return { invalid: true };
  if (promo.maxRedemptions != null && promo.redeemedCount >= promo.maxRedemptions) return { invalid: true, exhausted: true };
  return promo;
}

export function priceLines(tiers, items) {
  const byId = new Map(tiers.map((tier) => [tier.id, tier]));
  const lines = [];
  let quantity = 0;
  for (const item of items) {
    if (!item.quantity) continue;
    const tier = byId.get(item.tierId);
    if (!tier || !tier.active) throw badRequest('One of those ticket types is no longer available.');
    if (tier.kind !== 'ONLINE') throw badRequest(`${tier.name} is sold at the door only.`);
    if (tier.salesEndAt && tier.salesEndAt < new Date()) throw badRequest(`${tier.name} is no longer on sale.`);
    lines.push({ tier, quantity: item.quantity, amount: tier.priceMinor * item.quantity });
    quantity += item.quantity;
  }
  if (!quantity) throw badRequest('Pick at least one ticket.');
  if (quantity > LIMITS.maxTicketsPerOrder) throw badRequest(`You can buy up to ${LIMITS.maxTicketsPerOrder} tickets at a time.`);
  return { lines, quantity };
}

export async function quote(db, event, { items, promoCode, channel }) {
  const { lines, quantity } = priceLines(event.tiers, items);
  const subtotal = lines.reduce((sum, line) => sum + line.amount, 0);
  const promo = await findPromo(db, event.id, promoCode);

  let discount = 0;
  let promoMessage = null;
  if (promo?.invalid) promoMessage = promo.exhausted ? 'That code has been fully used.' : 'That code is not valid for this event.';
  else if (promo && subtotal < promo.minSubtotalMinor) {
    promoMessage = `Spend ${formatMoney(promo.minSubtotalMinor, event.currency)} to use this code.`;
  } else if (promo) {
    discount = promo.kind === 'PERCENT' ? percentOf(subtotal, promo.value) : Math.min(promo.value, subtotal);
  }

  const fee = channel === 'DOOR' ? 0 : percentOf(subtotal - discount, FEES.ticketServiceBps);
  return {
    lines,
    quantity,
    subtotal,
    discount,
    fee,
    total: subtotal - discount + fee,
    promo: promo && !promo.invalid && discount > 0 ? promo : null,
    promoMessage,
    currency: event.currency,
  };
}

async function reserveSeats(tx, lines) {
  for (const { tier, quantity } of lines) {
    const taken = await tx.$executeRaw`
      UPDATE "TicketTier" SET "sold" = "sold" + ${quantity}
       WHERE "id" = ${tier.id} AND ("capacity" IS NULL OR "sold" + ${quantity} <= "capacity")`;
    if (!taken) throw conflict(`${tier.name} has sold out. Join the waitlist to hear when seats come back.`, 'sold_out');
  }
}

// Guests have no account, so their order page and ticket QR codes open with
// a key derived from the order id. The key is in their confirmation email
// and in the link the card page returns to; the order reference alone shows
// nothing. A member's order only ever opens for that member.
export function orderAccessKey(orderId) {
  return hmac('order-access', orderId).toString('base64url').slice(0, 32);
}

export function canOpenOrder(order, viewer, key) {
  if (order.buyerId) return Boolean(viewer && order.buyerId === viewer.id);
  return typeof key === 'string' && key.length > 0 && safeEqual(key, orderAccessKey(order.id));
}

function orderPath(order, slug) {
  return `/checkout?event=${slug}&order=${order.reference}${order.buyerId ? '' : `&key=${orderAccessKey(order.id)}`}`;
}

async function releaseSeats(tx, orderId) {
  const items = await tx.orderItem.findMany({ where: { orderId }, select: { tierId: true, quantity: true } });
  for (const item of items) {
    await tx.$executeRaw`UPDATE "TicketTier" SET "sold" = GREATEST(0, "sold" - ${item.quantity}) WHERE "id" = ${item.tierId}`;
    await notifyWaitlist(tx, item.tierId, item.quantity);
  }
}

// Seats came back on a tier: tell the people waiting, oldest first, one
// person per seat. Seats are not reserved for them — whoever checks out
// first gets it — so the message says exactly that.
export async function notifyWaitlist(tx, tierId, seats) {
  const waiting = await tx.waitlistEntry.findMany({
    where: { tierId, notifiedAt: null },
    orderBy: { createdAt: 'asc' },
    take: seats,
    include: { event: { select: { title: true, slug: true, status: true } }, tier: { select: { name: true } } },
  });
  const open = waiting.filter((entry) => entry.event.status === 'PUBLISHED');
  for (const entry of open) {
    const title = `A ${entry.tier.name} seat is back`;
    const body = `A seat for ${entry.event.title} has just come back. It goes to whoever checks out first.`;
    const href = `/checkout?event=${entry.event.slug}`;
    const dedupeKey = `waitlist:${entry.id}`;
    if (entry.userId) await notify(tx, { userId: entry.userId, topic: 'REMINDERS', title, body, href, urgent: true, dedupeKey });
    else await notifyGuest(tx, { email: entry.email, topic: 'REMINDERS', subject: title, body, href, dedupeKey });
  }
  if (open.length) await tx.waitlistEntry.updateMany({ where: { id: { in: open.map((entry) => entry.id) } }, data: { notifiedAt: new Date() } });
}

async function redeemPromo(tx, promo) {
  if (!promo) return;
  const redeemed = await tx.$executeRaw`
    UPDATE "PromoCode" SET "redeemedCount" = "redeemedCount" + 1
     WHERE "id" = ${promo.id} AND ("maxRedemptions" IS NULL OR "redeemedCount" < "maxRedemptions")`;
  if (!redeemed) throw conflict('That promo code has just been fully used.', 'promo_exhausted');
}

export async function uniqueOrderReference(tx) {
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const candidate = reference('ORD', 6);
    if (!(await tx.order.findUnique({ where: { reference: candidate }, select: { id: true } }))) return candidate;
  }
  throw new Error('Could not allocate an order reference.');
}

async function issueTickets(tx, order, lines, holders) {
  const names = holders.filter((name) => name && name.trim());
  let index = 0;
  const created = [];
  for (const { tier, quantity } of lines) {
    for (let n = 0; n < quantity; n += 1) {
      const holderName = (names[index] || order.buyerName).trim().slice(0, 80);
      index += 1;
      for (let attempt = 0; attempt < 5; attempt += 1) {
        const code = newTicketCode();
        const clash = await tx.ticket.findUnique({ where: { code }, select: { id: true } });
        if (clash) continue;
        created.push(
          await tx.ticket.create({
            data: { code, orderId: order.id, eventId: order.eventId, tierId: tier.id, ownerId: order.buyerId, holderName },
            select: { code: true, holderName: true, tierId: true },
          }),
        );
        break;
      }
    }
  }
  return created;
}

// Books the money for a paid order: what the buyer paid lands in the
// event's escrow (face value) and platform revenue (service fee).
export function saleLines(order, source) {
  const net = order.subtotalMinor - order.discountMinor;
  return [
    ...source,
    { account: accounts.eventEscrow(order.eventId, order.currency), amount: net },
    { account: accounts.revenue(order.currency), amount: order.feeMinor },
  ];
}

export async function afterPaid(tx, order, event, lines, holders, { reserved = false } = {}) {
  const tickets = await issueTickets(tx, order, lines, holders);
  await ensureAttendeeRsvp(tx, { event, userId: order.buyerId, name: order.buyerName, email: order.buyerEmail, partySize: tickets.length });
  if (order.buyerId) await awardReferral(tx, order.buyerId, 'FIRST_TICKET');

  const when = `${dayLabel(event.startsAt, event.timezone)} · ${timeLabel(event.startsAt, event.timezone)}`;
  const codes = tickets.map((ticket) => `${ticket.code} — ${ticket.holderName}`).join('\n');
  const subject = `Your tickets: ${event.title}`;
  const payLine = reserved
    ? `Reserved — pay ${formatMoney(order.totalMinor, order.currency)} at the door.`
    : `Order ${order.reference} · ${formatMoney(order.totalMinor, order.currency)}`;
  const where = order.buyerId ? 'Your QR codes are in My Twende — show them at the gate.' : 'Open the link below for your QR codes and show them at the gate. Keep this email private: the link opens your tickets.';
  const body = `${when} · ${event.venue}\n${payLine}\n\n${codes}\n\n${where}`;
  if (order.buyerId) await notify(tx, { userId: order.buyerId, topic: 'REMINDERS', title: subject, body, href: '/my-twende?tab=upcoming', urgent: true });
  else await notifyGuest(tx, { email: order.buyerEmail, topic: 'REMINDERS', subject, body, href: orderPath(order, event.slug) });

  if (event.organizer?.ownerId) {
    const count = `${tickets.length} ticket${tickets.length === 1 ? '' : 's'}`;
    await notify(tx, {
      userId: event.organizer.ownerId,
      topic: 'MONEY',
      title: reserved ? `${count} reserved to pay at the door · ${event.title}` : `${count} sold · ${event.title}`,
      body: reserved
        ? `Order ${order.reference}. Collect payment at the gate.`
        : `Order ${order.reference}. The money is held in escrow and released to you ${ESCROW.eventReleaseDelayHours} hours after the event.`,
      href: '/organizer-analytics',
    });
  }
  return tickets;
}

// ── Placing orders ────────────────────────────────────────────────────────

export async function placeOrder({ viewer, slug, items, promoCode, channel, buyerName, buyerEmail, guestNames = [], referrerHandle, source, stepUpCode }) {
  const event = await loadCheckoutEvent(slug);
  if (event.isFree) throw badRequest('This event is free — RSVP instead.');
  if ((event.endsAt || event.startsAt) < new Date()) throw badRequest('This event has already happened.');
  if (channel === 'POINTS' && !viewer) throw unauthorized('Sign in to pay with Twende points.');
  if (channel === 'POINTS') await requireStepUp(viewer, stepUpCode);

  const name = (viewer?.name || buyerName || '').trim();
  const email = (viewer?.email || buyerEmail || '').trim().toLowerCase();
  if (!name) throw invalid('Add your name — it goes on the ticket.');
  if (!email) throw invalid('We need an email to send your QR ticket.');

  const referrer = referrerHandle
    ? await prisma.user.findUnique({ where: { handle: String(referrerHandle).toLowerCase() }, select: { id: true } })
    : null;
  const rates = channel === 'POINTS' ? await getRates() : null;

  const outcome = await transaction(async (tx) => {
    const priced = await quote(tx, event, { items, promoCode, channel });
    if (promoCode && !priced.promo) throw badRequest(priced.promoMessage || 'That promo code does not apply.');

    await reserveSeats(tx, priced.lines);
    await redeemPromo(tx, priced.promo);

    const order = await tx.order.create({
      data: {
        reference: await uniqueOrderReference(tx),
        eventId: event.id,
        buyerId: viewer?.id || null,
        buyerName: name,
        buyerEmail: email,
        currency: event.currency,
        subtotalMinor: priced.subtotal,
        discountMinor: priced.discount,
        feeMinor: priced.fee,
        totalMinor: priced.total,
        channel,
        status: channel === 'DOOR' ? 'RESERVED' : 'PENDING',
        promoCodeId: priced.promo?.id || null,
        referrerId: referrer && referrer.id !== viewer?.id ? referrer.id : null,
        source: source || null,
        expiresAt: channel === 'CARD' ? new Date(Date.now() + 30 * 60 * 1000) : null,
        items: { create: priced.lines.map(({ tier, quantity }) => ({ tierId: tier.id, quantity, unitPriceMinor: tier.priceMinor })) },
      },
    });

    if (channel === 'DOOR') {
      const tickets = await afterPaid(tx, order, event, priced.lines, guestNames, { reserved: true });
      return { order, tickets };
    }

    if (channel === 'POINTS') {
      const points = pointsFor(order.totalMinor, order.currency, rates);
      const entryId = await post(tx, {
        kind: 'TICKET_SALE',
        memo: `${event.title} · ${priced.quantity} ticket${priced.quantity === 1 ? '' : 's'}`,
        reference: order.id,
        idempotencyKey: `order:${order.id}:paid`,
        actorId: viewer.id,
        meta: { orderReference: order.reference, points, rate: rates[order.currency] || 1 },
        lines: saleLines(order, [
          { account: accounts.wallet(viewer.id), amount: -points },
          { account: accounts.fx('PTS'), amount: points },
          { account: accounts.fx(order.currency), amount: -order.totalMinor },
        ]),
      });
      const paid = await tx.order.update({ where: { id: order.id }, data: { status: 'PAID', paidAt: new Date(), pointsSpent: points } });
      await audit(tx, { actorId: viewer.id, action: 'order.paid', targetType: 'Order', targetId: order.id, meta: { channel, entryId } });
      const tickets = await afterPaid(tx, paid, event, priced.lines, guestNames);
      return { order: paid, tickets };
    }

    const charge = await createCharge(tx, {
      purpose: 'ORDER',
      subjectId: order.id,
      userId: viewer?.id || null,
      email,
      amountMinor: order.totalMinor,
      currency: order.currency,
      description: `${event.title} — ${priced.quantity} ticket${priced.quantity === 1 ? '' : 's'}`,
      returnPath: orderPath(order, event.slug),
    });
    return { order, charge, lines: priced.lines };
  });

  if (outcome.charge?.mode === 'test') {
    const { completePayment } = await import('../payments/fulfil.js');
    await completePayment(outcome.charge.paymentId, { processorRef: null, meta: { test: true } });
    const tickets = await prisma.ticket.findMany({ where: { orderId: outcome.order.id }, select: { code: true, holderName: true } });
    return summary(await prisma.order.findUnique({ where: { id: outcome.order.id } }), tickets, { mode: 'test' });
  }
  if (outcome.charge) {
    try {
      const redirectUrl = await openCheckout(outcome.charge);
      return { ...summary(outcome.order, []), redirectUrl, mode: 'stripe' };
    } catch (error) {
      // Give the seats back straight away rather than holding them for 30
      // minutes behind a checkout page that never opened.
      log.error('checkout session failed', { orderId: outcome.order.id, error });
      await prisma.order.update({ where: { id: outcome.order.id }, data: { expiresAt: new Date(0) } });
      await expireStaleOrders();
      throw unavailable('The card payment page could not be opened. Nothing was charged — please try again.');
    }
  }
  return summary(outcome.order, outcome.tickets);
}

function summary(order, tickets, extra = {}) {
  return {
    reference: order.reference,
    status: order.status,
    currency: order.currency,
    subtotal: order.subtotalMinor,
    discount: order.discountMinor,
    fee: order.feeMinor,
    total: order.totalMinor,
    pointsSpent: order.pointsSpent,
    totalLabel: formatMoney(order.totalMinor, order.currency),
    tickets: tickets.map((ticket) => ({ code: ticket.code, holderName: ticket.holderName })),
    ...(order.buyerId ? {} : { accessKey: orderAccessKey(order.id) }),
    ...extra,
  };
}

// Called by payments/fulfil.js inside its transaction once the processor
// confirms the money. Returns 'fulfilled', or 'duplicate' if the order was
// already paid (the caller refunds the extra payment).
export async function fulfilOrderPayment(tx, payment) {
  await tx.$queryRaw`SELECT "id" FROM "Order" WHERE "id" = ${payment.subjectId} FOR UPDATE`;
  const order = await tx.order.findUnique({ where: { id: payment.subjectId }, include: { items: { include: { tier: true } } } });
  if (!order) throw new Error(`Order ${payment.subjectId} not found for payment ${payment.id}`);
  if (order.status === 'PAID' || order.status === 'REFUNDED') return 'duplicate';

  if (order.status === 'EXPIRED' || order.status === 'CANCELLED') {
    // The hold lapsed before the processor confirmed. Take the seats again if
    // they are still there; otherwise the payment is refunded by the caller.
    await reserveSeats(tx, order.items.map((item) => ({ tier: item.tier, quantity: item.quantity })));
  } else if (order.status !== 'PENDING') {
    throw new Error(`Order ${order.id} cannot be paid from status ${order.status}`);
  }

  const event = await tx.event.findUnique({ where: { id: order.eventId }, select: EVENT_FOR_CHECKOUT });
  await post(tx, {
    kind: 'TICKET_SALE',
    memo: `${event.title} · order ${order.reference}`,
    reference: order.id,
    idempotencyKey: `order:${order.id}:paid`,
    meta: { orderReference: order.reference, paymentId: payment.id, test: payment.processor === 'MOCK' },
    lines: saleLines(order, [{ account: accounts.paymentClearing(order.currency), amount: -order.totalMinor }]),
  });
  const paid = await tx.order.update({ where: { id: order.id }, data: { status: 'PAID', paidAt: new Date(), expiresAt: null } });
  await afterPaid(tx, paid, event, order.items.map((item) => ({ tier: item.tier, quantity: item.quantity })), []);
  return 'fulfilled';
}

// ── Holds, refunds and the waitlist ───────────────────────────────────────

export async function expireStaleOrders() {
  const stale = await prisma.order.findMany({
    where: { status: 'PENDING', expiresAt: { lt: new Date() } },
    select: { id: true, promoCodeId: true, splitShare: { select: { id: true } } },
    take: 200,
  });
  let expired = 0;
  for (const order of stale) {
    await transaction(async (tx) => {
      const { count } = await tx.order.updateMany({ where: { id: order.id, status: 'PENDING' }, data: { status: 'EXPIRED' } });
      if (!count) return;
      // A split-pay share's seat belongs to the split, which releases it on
      // its own schedule; only a normal order hands seats back here.
      if (!order.splitShare) await releaseSeats(tx, order.id);
      if (order.promoCodeId) {
        await tx.$executeRaw`UPDATE "PromoCode" SET "redeemedCount" = GREATEST(0, "redeemedCount" - 1) WHERE "id" = ${order.promoCodeId}`;
      }
      await tx.payment.updateMany({ where: { subjectId: order.id, status: 'PENDING' }, data: { status: 'CANCELLED' } });
      expired += 1;
    });
  }
  return expired;
}

// Refunds an order in full (default) or in part. Money comes back out of the
// event escrow, or out of the organizer's earnings if the escrow was already
// released. Points go straight back to the wallet; card payments are
// refunded at the processor first, so the ledger never claims a refund that
// did not happen.
//
// Partial refunds add up on the order, and a "full" refund returns only what
// is left, so a case settled for part of the money followed by a cancellation
// never pays out twice. Fee and points shares are worked out on the running
// total, so the rounding of several partial refunds still ends exactly at the
// amounts paid.
export async function refundOrder(orderId, { actorId, reason, amountMinor, refundKey }) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { event: { select: EVENT_FOR_CHECKOUT } },
  });
  if (!order) throw notFound();
  if (order.status !== 'PAID') throw conflict('Only paid orders can be refunded.', 'not_refundable');
  if (order.channel === 'POINTS' && !order.buyerId) {
    throw conflict('The buyer account no longer exists, so points cannot be returned automatically.', 'refund_manual');
  }

  const remaining = order.totalMinor - order.refundedMinor;
  if (remaining <= 0) throw conflict('This order has already been refunded in full.', 'not_refundable');
  const full = amountMinor == null || amountMinor >= remaining;
  const refund = full ? remaining : amountMinor;
  if (refund <= 0) throw badRequest('Refund amount must be positive.');
  const before = order.refundedMinor;
  const after = before + refund;
  const share = (whole, round = Math.round) => round((whole * after) / order.totalMinor) - round((whole * before) / order.totalMinor);
  const feePart = share(order.feeMinor);
  const netPart = refund - feePart;
  const key = refundKey || `order:${order.id}:${full ? 'full' : `${before}+${refund}`}`;

  if (order.channel === 'CARD') {
    const payment = await prisma.payment.findFirst({ where: { subjectId: order.id, status: 'SUCCEEDED' } });
    if (payment) await refundCharge(payment, refund, key);
  }

  const source = order.event.payoutReleasedAt
    ? accounts.earnings(order.event.organizer.ownerId, order.currency)
    : accounts.eventEscrow(order.eventId, order.currency);

  await transaction(async (tx) => {
    // Two refunds racing on one order: only the one that saw the current
    // total gets to record it.
    const claimed = await tx.order.updateMany({
      where: { id: order.id, status: 'PAID', refundedMinor: before },
      data: { refundedMinor: after, ...(full ? { status: 'REFUNDED', refundedAt: new Date() } : {}) },
    });
    if (!claimed.count) throw conflict('Another refund on this order just went through. Refresh and try again.', 'refund_race');

    const points = order.channel === 'POINTS' ? share(order.pointsSpent, Math.floor) : 0;
    const destination = order.channel === 'POINTS'
      ? [
          { account: accounts.fx(order.currency), amount: refund },
          { account: accounts.fx('PTS'), amount: -points },
          { account: accounts.wallet(order.buyerId), amount: points },
        ]
      : [{ account: accounts.paymentClearing(order.currency), amount: refund }];

    await post(tx, {
      kind: 'REFUND',
      memo: `Refund · ${order.event.title} · ${order.reference}`,
      reference: order.id,
      idempotencyKey: `refund:${key}`,
      actorId,
      meta: { reason, orderReference: order.reference, ...(points ? { points } : {}) },
      lines: [
        { account: source, amount: -netPart },
        { account: accounts.revenue(order.currency), amount: -feePart },
        ...destination,
      ],
    });

    if (full) {
      await tx.ticket.updateMany({ where: { orderId: order.id, status: 'VALID' }, data: { status: 'VOID', voidedAt: new Date() } });
      await tx.payment.updateMany({ where: { subjectId: order.id, status: 'SUCCEEDED' }, data: { status: 'REFUNDED' } });
      if (order.event.status !== 'CANCELLED') await releaseSeats(tx, order.id);
    }
    await audit(tx, { actorId, action: 'order.refunded', targetType: 'Order', targetId: order.id, meta: { refund, reason, refundedTotal: after } });

    const body = `${formatMoney(refund, order.currency)} for ${order.event.title} (order ${order.reference}) is on its way back${order.channel === 'POINTS' ? ' to your Twende points — it is there now.' : ' to your card. Banks take 3–5 days to show it.'}`;
    if (order.buyerId) await notify(tx, { userId: order.buyerId, topic: 'MONEY', title: 'Refund issued', body, href: '/my-twende?tab=upcoming', urgent: true });
    else await notifyGuest(tx, { email: order.buyerEmail, topic: 'MONEY', subject: 'Refund issued', body });
  });
  return { refunded: refund, full };
}

export async function joinWaitlist({ slug, tierId, viewer, email, name }) {
  const event = await loadCheckoutEvent(slug);
  const tier = event.tiers.find((candidate) => candidate.id === tierId);
  if (!tier) throw notFound('That ticket type is not available.');
  const address = (viewer?.email || email || '').trim().toLowerCase();
  if (!address) throw invalid('Add your email so we can tell you when seats come back.');
  await prisma.waitlistEntry.upsert({
    where: { tierId_email: { tierId, email: address } },
    create: { eventId: event.id, tierId, email: address, name: viewer?.name || name || null, userId: viewer?.id || null },
    update: {},
  });
  return { waitlisted: true };
}

export async function leaveWaitlist(viewer, entryId) {
  const { count } = await prisma.waitlistEntry.deleteMany({ where: { id: entryId, userId: viewer.id } });
  if (!count) throw notFound();
  return { left: true };
}

// Returns the order only to someone allowed to open it; anyone else gets
// null, the same answer as a reference that does not exist.
export async function orderForViewer(referenceCode, viewer, key) {
  const order = await prisma.order.findUnique({
    where: { reference: referenceCode },
    include: { tickets: { select: { code: true, holderName: true, status: true } }, event: { select: { title: true, slug: true } } },
  });
  if (!order || !canOpenOrder(order, viewer, key)) return null;
  return order;
}

export function paymentConfigSummary() {
  return { cardPayments: Boolean(config().payments.stripeSecretKey), testMode: !config().payments.stripeSecretKey && config().payments.mockAllowed };
}

