// Checkout for one event: tiers with live availability, the buyer's points
// balance and how card payments will be taken.

import { prisma } from '../db.js';
import { getRates } from '../fx.js';
import { FEES } from '../fees.js';
import { paymentMode } from '../payments/charges.js';
import { accounts, balanceOf } from '../ledger.js';
import { dayLabel, timeLabel } from '../../shared/format.js';
import { formatMoney } from '../../shared/money.js';
import { canOpenOrder } from '../services/checkout.js';
import { me } from './common.js';

// Reads an order's details only after the access check passes, so nothing
// about someone else's order is ever loaded into this render.
async function openOrder(reference, eventId, viewer, key) {
  if (!reference) return null;
  const gate = await prisma.order.findUnique({ where: { reference }, select: { id: true, buyerId: true, eventId: true } });
  if (!gate || gate.eventId !== eventId || !canOpenOrder(gate, viewer, key)) return null;
  return prisma.order.findUnique({ where: { id: gate.id }, include: { tickets: { select: { code: true, holderName: true } } } });
}

export async function checkoutView(viewer, { event: slug, order: reference, key } = {}) {
  const event = slug
    ? await prisma.event.findUnique({
        where: { slug },
        include: { tiers: { where: { active: true }, orderBy: { sortOrder: 'asc' } } },
      })
    : null;
  if (!event || event.status !== 'PUBLISHED' || event.hiddenAt) return null;

  const [person, rates, points, order] = await Promise.all([
    me(viewer),
    getRates(),
    viewer ? balanceOf(prisma, accounts.wallet(viewer.id)) : 0,
    openOrder(reference, event.id, viewer, key),
  ]);

  const general = event.tiers.find((tier) => tier.kind === 'ONLINE' && !tier.compareAtMinor);
  const earlyBird = event.tiers.find((tier) => tier.kind === 'ONLINE' && tier.compareAtMinor);
  const past = (event.endsAt || event.startsAt) < new Date();

  return {
    me: person,
    event: {
      slug: event.slug,
      title: event.title,
      currency: event.currency,
      isFree: event.isFree,
      past,
      dateLine: `${dayLabel(event.startsAt, event.timezone)} · ${timeLabel(event.startsAt, event.timezone)}`,
      venue: event.venue,
    },
    tiers: event.tiers.map((tier) => ({
      id: tier.id,
      name: tier.name,
      desc: tier.description,
      tag: tier.tag,
      kind: tier.kind,
      priceMinor: tier.priceMinor,
      compareAtMinor: tier.compareAtMinor,
      remaining: tier.capacity == null ? null : Math.max(0, tier.capacity - tier.sold),
    })),
    incentive: earlyBird && general
      ? `Early bird is ${Math.round((1 - earlyBird.priceMinor / (earlyBird.compareAtMinor || general.priceMinor)) * 100)}% off while it lasts. The platform fee is ${FEES.ticketServiceBps / 100}% on paid tickets only — free events stay free.`
      : `The platform fee is ${FEES.ticketServiceBps / 100}% on paid tickets only — free events stay free.`,
    feeBps: FEES.ticketServiceBps,
    rates,
    points,
    paymentMode: paymentMode(),
    order: order
      ? {
          reference: order.reference,
          status: order.status,
          total: formatMoney(order.totalMinor, order.currency),
          email: order.buyerEmail,
          name: order.buyerName,
          tickets: order.tickets,
          accessKey: order.buyerId ? null : key,
        }
      : null,
  };
}
