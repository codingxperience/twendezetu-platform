// Organizer analytics for one event: traffic, the RSVP/ticket funnel, where
// people came from, revenue by day and sales by ticket tier.

import { prisma, toNumber } from '../db.js';
import { forbidden, notFound } from '../errors.js';
import { formatMoney } from '../../shared/money.js';
import { shortDate } from '../../shared/format.js';

const SOURCE_LABELS = { whatsapp: 'WhatsApp', facebook: 'Facebook', direct: 'Direct link', feed: 'Twende feed', email: 'Email', x: 'X', instagram: 'Instagram' };

export async function organizerEvents(user) {
  return prisma.event.findMany({
    where: { OR: [{ createdById: user.id }, { organizer: { ownerId: user.id } }], status: { not: 'ARCHIVED' } },
    orderBy: { startsAt: 'desc' },
    select: { slug: true, title: true, startsAt: true },
    take: 20,
  });
}

function pct(part, whole) {
  return whole ? `${Math.round((part / whole) * 100)}%` : '0%';
}

export async function eventAnalytics(user, slug) {
  const event = await prisma.event.findUnique({
    where: { slug },
    include: { organizer: { select: { ownerId: true } }, tiers: { orderBy: { sortOrder: 'asc' } } },
  });
  if (!event) throw notFound();
  const staff = ['ADMIN', 'MODERATOR', 'FINANCE'].includes(user.role);
  if (event.createdById !== user.id && event.organizer.ownerId !== user.id && !staff) throw forbidden();

  const weekAgo = new Date(Date.now() - 7 * 86_400_000);
  const twoWeeksAgo = new Date(Date.now() - 14 * 86_400_000);
  const [stats, rsvps, paidOrders, ticketsSold, checkedIn, escrow, thisWeek, lastWeek, revenueByDay, soldByTier] = await Promise.all([
    prisma.eventStat.groupBy({ by: ['source'], where: { eventId: event.id }, _sum: { views: true, ctaClicks: true } }),
    prisma.rsvp.count({ where: { eventId: event.id, status: 'GOING' } }),
    prisma.order.count({ where: { eventId: event.id, status: 'PAID' } }),
    prisma.ticket.count({ where: { eventId: event.id, status: { not: 'VOID' }, order: { status: { in: ['PAID', 'RESERVED'] } } } }),
    prisma.ticket.count({ where: { eventId: event.id, status: 'CHECKED_IN' } }),
    prisma.ledgerAccount.findMany({ where: { kind: 'EVENT_ESCROW', ownerKey: event.id } }),
    prisma.eventStat.aggregate({ where: { eventId: event.id, day: { gte: weekAgo } }, _sum: { views: true } }),
    prisma.eventStat.aggregate({ where: { eventId: event.id, day: { gte: twoWeeksAgo, lt: weekAgo } }, _sum: { views: true } }),
    prisma.$queryRaw`
      SELECT date_trunc('day', "paidAt") AS day, SUM("subtotalMinor" - "discountMinor")::bigint AS amount
        FROM "Order" WHERE "eventId" = ${event.id} AND "status" = 'PAID' AND "paidAt" >= now() - interval '8 days'
       GROUP BY 1 ORDER BY 1`,
    prisma.orderItem.groupBy({ by: ['tierId'], where: { order: { eventId: event.id, status: 'PAID' } }, _sum: { quantity: true } }),
  ]);

  const views = stats.reduce((sum, row) => sum + (row._sum.views || 0), 0);
  const clicks = stats.reduce((sum, row) => sum + (row._sum.ctaClicks || 0), 0);
  const weekViews = thisWeek._sum.views || 0;
  const priorViews = lastWeek._sum.views || 0;
  const growth = priorViews ? Math.round(((weekViews - priorViews) / priorViews) * 100) : null;
  const held = escrow.map((account) => ({ currency: account.currency, amount: toNumber(account.balance) })).filter((row) => row.amount > 0);
  const attendees = event.isFree ? rsvps : ticketsSold;

  const days = Array.from({ length: 8 }, (_value, index) => {
    const day = new Date(Date.now() - (7 - index) * 86_400_000);
    return day.toISOString().slice(0, 10);
  });
  const revenue = Object.fromEntries(revenueByDay.map((row) => [new Date(row.day).toISOString().slice(0, 10), Number(row.amount)]));
  const maxDay = Math.max(1, ...days.map((day) => revenue[day] || 0));

  const soldMap = Object.fromEntries(soldByTier.map((row) => [row.tierId, row._sum.quantity || 0]));
  return {
    event: { slug: event.slug, title: event.title, date: shortDate(event.startsAt, event.timezone), isFree: event.isFree },
    kpis: [
      { label: 'PAGE VIEWS', value: views.toLocaleString('en-US'), sub: growth == null ? 'this week' : `${growth >= 0 ? '+' : ''}${growth}% this week` },
      { label: 'RSVPs', value: rsvps.toLocaleString('en-US'), sub: `${pct(rsvps, views)} of views` },
      { label: 'TICKETS SOLD', value: ticketsSold.toLocaleString('en-US'), sub: held.length ? `${held.map((row) => formatMoney(row.amount, row.currency)).join(' + ')} in escrow` : event.isFree ? 'free event' : 'nothing held' },
      { label: 'CHECKED IN', value: pct(checkedIn, attendees), sub: `${checkedIn} of ${attendees} at gate` },
    ],
    funnel: [
      { label: 'Viewed the event', value: views, pct: '100%' },
      { label: 'Clicked RSVP / tickets', value: clicks, pct: pct(clicks, views) },
      { label: 'RSVP’d', value: rsvps, pct: pct(rsvps, views) },
      { label: 'Paid for a ticket', value: paidOrders, pct: pct(paidOrders, views) },
      { label: 'Checked in at gate', value: checkedIn, pct: pct(checkedIn, views) },
    ].map((row) => ({ ...row, value: row.value.toLocaleString('en-US') })),
    sources: stats
      .map((row) => ({ label: SOURCE_LABELS[row.source] || row.source, views: row._sum.views || 0 }))
      .sort((a, b) => b.views - a.views)
      .map((row) => ({ label: row.label, pct: pct(row.views, views) })),
    revBars: days.map((day, index) => ({ h: `${Math.max(4, Math.round(((revenue[day] || 0) / maxDay) * 100))}%`, peak: (revenue[day] || 0) === maxDay && maxDay > 1, last: index === 7 })),
    tiers: event.tiers
      .filter((tier) => tier.kind === 'ONLINE')
      .map((tier) => {
        const sold = soldMap[tier.id] || 0;
        return {
          name: tier.name,
          sold,
          cap: tier.capacity ?? '∞',
          rev: formatMoney(sold * tier.priceMinor, tier.currency),
          pct: tier.capacity ? pct(sold, tier.capacity) : '—',
        };
      }),
  };
}
