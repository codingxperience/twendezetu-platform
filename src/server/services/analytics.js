// Organizer analytics for one event: traffic, the funnel from view to gate,
// where people came from, who shared it, sales by day and by ticket tier.
// Every figure is counted from stored rows; nothing is estimated.

import { prisma, toNumber } from '../db.js';
import { forbidden, notFound } from '../errors.js';
import { ESCROW, FEES } from '../fees.js';
import { formatMoney } from '../../shared/money.js';
import { dayLabel, shortDate, shortName } from '../../shared/format.js';

const SOURCE_LABELS = { whatsapp: 'WhatsApp', facebook: 'Facebook', direct: 'Direct link', feed: 'Twende feed', email: 'Email', x: 'X', instagram: 'Instagram' };

// Below this many views a funnel says more about chance than about the page.
const FUNNEL_MIN_VIEWS = 20;

// Events coming up, soonest first, then recent past ones, newest first.
export async function organizerEvents(user) {
  const where = { OR: [{ createdById: user.id }, { organizer: { ownerId: user.id } }], status: { not: 'ARCHIVED' } };
  const select = { slug: true, title: true, startsAt: true, timezone: true };
  const now = new Date();
  const [upcoming, past] = await Promise.all([
    prisma.event.findMany({ where: { ...where, startsAt: { gte: now } }, orderBy: { startsAt: 'asc' }, select, take: 30 }),
    prisma.event.findMany({ where: { ...where, startsAt: { lt: now } }, orderBy: { startsAt: 'desc' }, select, take: 10 }),
  ]);
  return [...upcoming, ...past];
}

function pct(part, whole) {
  return whole ? `${Math.min(100, Math.round((part / whole) * 100))}%` : '0%';
}

function localDay(date, timeZone) {
  return new Intl.DateTimeFormat('en-CA', { timeZone, year: 'numeric', month: '2-digit', day: '2-digit' }).format(date);
}

// Where the funnel loses the most people, and what usually helps there.
const DROP_ADVICE = {
  click: 'Most people look but do not click. The cover photo, the title and the first line of the description do the most work here.',
  rsvp: 'People open the RSVP but do not finish. Make sure the date, place and who it is for are plain at a glance.',
  convert: 'People start but do not finish. Make sure the price, date and place are plain at a glance; a cheaper tier helps undecided guests.',
  gate: 'Many ticket holders did not come through the gate. A reminder the day before usually brings more of them.',
};

function funnelNote(stages, views, started) {
  if (views < FUNNEL_MIN_VIEWS) return 'Too few views yet to read the funnel. Share the event link; every share is counted by where it was opened.';
  let worst = null;
  for (let index = 1; index < stages.length; index += 1) {
    const stage = stages[index];
    if (stage.key === 'gate' && !started) continue;
    const previous = stages[index - 1].count;
    const lost = previous ? 1 - stage.count / previous : 0;
    if (!worst || lost > worst.lost) worst = { key: stage.key, lost, from: stages[index - 1].label, to: stage.label };
  }
  if (!worst || worst.lost <= 0) return 'No stage stands out: people move through the funnel evenly.';
  return `Biggest drop: “${worst.from}” to “${worst.to}”, ${Math.round(worst.lost * 100)}% lost. ${DROP_ADVICE[worst.key]}`;
}

export async function eventAnalytics(user, slug) {
  const event = await prisma.event.findUnique({
    where: { slug },
    include: { organizer: { select: { ownerId: true } }, tiers: { orderBy: { sortOrder: 'asc' } } },
  });
  if (!event) throw notFound();
  const staff = ['ADMIN', 'MODERATOR', 'FINANCE'].includes(user.role);
  if (event.createdById !== user.id && event.organizer.ownerId !== user.id && !staff) throw forbidden();

  const now = Date.now();
  const weekAgo = new Date(now - 7 * 86_400_000);
  const twoWeeksAgo = new Date(now - 14 * 86_400_000);
  const zone = event.timezone;
  const [stats, rsvps, saves, paidOrders, ticketsSold, checkedIn, escrow, thisWeek, lastWeek, salesByDay, soldByTier, rsvpReferrers, orderReferrers] = await Promise.all([
    prisma.eventStat.groupBy({ by: ['source'], where: { eventId: event.id }, _sum: { views: true, ctaClicks: true } }),
    prisma.rsvp.count({ where: { eventId: event.id, status: 'GOING' } }),
    prisma.savedEvent.count({ where: { eventId: event.id } }),
    prisma.order.count({ where: { eventId: event.id, status: 'PAID' } }),
    prisma.ticket.count({ where: { eventId: event.id, status: { not: 'VOID' }, order: { status: 'PAID' } } }),
    prisma.ticket.count({ where: { eventId: event.id, status: 'CHECKED_IN' } }),
    prisma.ledgerAccount.findMany({ where: { kind: 'EVENT_ESCROW', ownerKey: event.id } }),
    prisma.eventStat.aggregate({ where: { eventId: event.id, day: { gte: weekAgo } }, _sum: { views: true } }),
    prisma.eventStat.aggregate({ where: { eventId: event.id, day: { gte: twoWeeksAgo, lt: weekAgo } }, _sum: { views: true } }),
    // Ticket sales per local day, net of partial refunds; the service fee is
    // the buyer's and is not the organizer's revenue.
    prisma.$queryRaw`
      SELECT to_char(("paidAt" AT TIME ZONE 'UTC') AT TIME ZONE ${zone}, 'YYYY-MM-DD') AS day,
             ROUND(SUM(("subtotalMinor" - "discountMinor") * ("totalMinor" - "refundedMinor")::numeric / NULLIF("totalMinor", 0)))::bigint AS amount
        FROM "Order"
       WHERE "eventId" = ${event.id} AND "status" = 'PAID' AND "paidAt" >= now() - interval '9 days'
       GROUP BY 1`,
    prisma.orderItem.groupBy({ by: ['tierId'], where: { order: { eventId: event.id, status: 'PAID' } }, _sum: { quantity: true } }),
    prisma.rsvp.groupBy({ by: ['referrerId'], where: { eventId: event.id, status: 'GOING', referrerId: { not: null } }, _count: { _all: true } }),
    prisma.order.groupBy({ by: ['referrerId'], where: { eventId: event.id, status: 'PAID', referrerId: { not: null } }, _count: { _all: true } }),
  ]);

  const views = stats.reduce((sum, row) => sum + (row._sum.views || 0), 0);
  const clicks = stats.reduce((sum, row) => sum + (row._sum.ctaClicks || 0), 0);
  const weekViews = thisWeek._sum.views || 0;
  const priorViews = lastWeek._sum.views || 0;
  const growth = priorViews ? Math.round(((weekViews - priorViews) / priorViews) * 100) : null;
  const held = escrow.map((account) => ({ currency: account.currency, amount: toNumber(account.balance) })).filter((row) => row.amount > 0);
  const started = event.startsAt.getTime() <= now;

  // Free events have RSVPs, not tickets, so there is no gate to count.
  const stages = event.isFree
    ? [
        { key: 'view', label: 'Viewed the event', count: views },
        { key: 'click', label: 'Clicked RSVP', count: clicks },
        { key: 'rsvp', label: 'RSVP’d', count: rsvps },
      ]
    : [
        { key: 'view', label: 'Viewed the event', count: views },
        { key: 'click', label: 'Clicked tickets', count: clicks },
        { key: 'convert', label: 'Bought tickets', count: paidOrders },
        { key: 'gate', label: 'Checked in at the gate', count: checkedIn },
      ];

  // Eight local days ending today, in the event's own time zone.
  const days = Array.from({ length: 8 }, (_value, index) => new Date(now - (7 - index) * 86_400_000));
  const sales = Object.fromEntries(salesByDay.map((row) => [row.day, Number(row.amount)]));
  const dayAmounts = days.map((date) => sales[localDay(date, zone)] || 0);
  const maxDay = Math.max(0, ...dayAmounts);
  const peakIndex = maxDay ? dayAmounts.indexOf(maxDay) : -1;
  const weekSales = dayAmounts.reduce((sum, amount) => sum + amount, 0);

  const referrerIds = [...new Set([...rsvpReferrers, ...orderReferrers].map((row) => row.referrerId))];
  const referrerNames = referrerIds.length ? await prisma.user.findMany({ where: { id: { in: referrerIds } }, select: { id: true, name: true } }) : [];
  const referrers = referrerNames
    .map((person) => {
      const rsvpCount = rsvpReferrers.find((row) => row.referrerId === person.id)?._count._all || 0;
      const orderCount = orderReferrers.find((row) => row.referrerId === person.id)?._count._all || 0;
      return { name: shortName(person.name), rsvps: rsvpCount, orders: orderCount, total: rsvpCount + orderCount };
    })
    .sort((a, b) => b.total - a.total)
    .slice(0, 5)
    .map((row) => ({
      name: row.name,
      brought: [row.rsvps && `${row.rsvps} RSVP${row.rsvps === 1 ? '' : 's'}`, row.orders && `${row.orders} order${row.orders === 1 ? '' : 's'}`].filter(Boolean).join(' · '),
    }));

  const soldMap = Object.fromEntries(soldByTier.map((row) => [row.tierId, row._sum.quantity || 0]));
  const tiers = event.tiers
    .filter((tier) => tier.kind === 'ONLINE')
    .map((tier) => {
      const sold = soldMap[tier.id] || 0;
      return {
        name: tier.name,
        sold,
        cap: tier.capacity ?? '∞',
        rev: formatMoney(sold * tier.priceMinor, tier.currency),
        pct: tier.capacity ? pct(sold, tier.capacity) : '0%',
        share: tier.capacity ? sold / tier.capacity : 0,
        soldOut: Boolean(tier.capacity) && sold >= tier.capacity,
      };
    });
  const tight = tiers.filter((tier) => tier.share >= 0.8 && !tier.soldOut).sort((a, b) => b.share - a.share)[0];
  const soldOut = tiers.find((tier) => tier.soldOut);
  const tierNote = tight
    ? `${tight.name} is ${tight.pct} sold: ${tight.cap - tight.sold} left. Once it sells out, guests can join its waitlist and hear first when a seat comes back.`
    : soldOut
      ? `${soldOut.name} is sold out. Guests can join its waitlist and hear first when a seat comes back.`
      : null;

  return {
    event: { slug: event.slug, title: event.title, date: shortDate(event.startsAt, zone), isFree: event.isFree, status: event.status, started },
    kpis: [
      { label: 'PAGE VIEWS', value: views.toLocaleString('en-US'), sub: growth == null ? `${weekViews.toLocaleString('en-US')} this week` : `${growth >= 0 ? '+' : ''}${growth}% on last week` },
      event.isFree
        ? { label: 'RSVPs', value: rsvps.toLocaleString('en-US'), sub: `${pct(rsvps, views)} of views` }
        : { label: 'TICKETS SOLD', value: ticketsSold.toLocaleString('en-US'), sub: `${paidOrders} order${paidOrders === 1 ? '' : 's'}` },
      event.isFree
        ? { label: 'SHARES THAT LANDED', value: referrers.length.toLocaleString('en-US'), sub: 'members who brought a guest' }
        : { label: 'HELD FOR YOU', value: held.length ? held.map((row) => formatMoney(row.amount, row.currency)).join(' + ') : formatMoney(0, event.currency), sub: 'in escrow until after the event' },
      event.isFree
        ? { label: 'SAVED', value: saves.toLocaleString('en-US'), sub: 'people keeping an eye on it' }
        : started
          ? { label: 'CHECKED IN', value: pct(checkedIn, ticketsSold), sub: `${checkedIn} of ${ticketsSold} tickets at the gate` }
          : { label: 'CHECKED IN', value: '—', sub: `the door opens ${dayLabel(event.startsAt, zone).toLowerCase()}` },
    ],
    funnel: stages.map((stage) => ({ label: stage.label, value: stage.count.toLocaleString('en-US'), pct: pct(stage.count, views) })),
    funnelNote: funnelNote(stages, views, started),
    sources: stats
      .map((row) => ({ label: SOURCE_LABELS[row.source] || row.source, views: row._sum.views || 0 }))
      .filter((row) => row.views > 0)
      .sort((a, b) => b.views - a.views)
      .map((row) => ({ label: row.label, pct: pct(row.views, views), views: row.views.toLocaleString('en-US') })),
    referrers,
    sales: {
      week: formatMoney(weekSales, event.currency),
      bars: days.map((date, index) => ({
        h: `${maxDay ? Math.max(3, Math.round((dayAmounts[index] / maxDay) * 100)) : 3}%`,
        peak: index === peakIndex,
        label: dayLabel(date, zone).slice(0, 1),
        title: `${dayLabel(date, zone)} · ${formatMoney(dayAmounts[index], event.currency)}`,
      })),
      peak: peakIndex >= 0 ? `${dayLabel(days[peakIndex], zone)} · ${formatMoney(maxDay, event.currency)}` : null,
      terms: `Buyers pay the ${FEES.ticketServiceBps / 100}% service fee on top, so you receive the full ticket price. It is released ${ESCROW.eventReleaseDelayHours} hours after the event ends; each withdrawal costs a flat ${formatMoney(FEES.withdrawalFeeMinor[event.currency] ?? FEES.withdrawalFeeMinor.USD, FEES.withdrawalFeeMinor[event.currency] ? event.currency : 'USD')}.`,
    },
    tiers,
    tierNote,
  };
}
