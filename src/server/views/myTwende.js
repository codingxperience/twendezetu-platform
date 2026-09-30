// My Twende: everything about the signed-in person in one place — what they
// are going to, what they posted and the offers on it, what they saved, who
// they follow, and a calendar of it all.

import { prisma } from '../db.js';
import { config } from '../config.js';
import { accounts, balanceOf } from '../ledger.js';
import { getRates } from '../fx.js';
import { ESCROW, REFERRAL_POINTS } from '../fees.js';
import { toEventCard } from '../services/events.js';
import { dateRange } from '../services/marketplace.js';
import { REMINDER_PLANS } from '../services/rsvps.js';
import { preferencesFor } from '../notify/preferences.js';
import { COUNTRIES, dayKey, dayLabel, initials, ratingLabel, relativeTime, shortDate, timeLabel } from '../../shared/format.js';
import { convert, formatMoney } from '../../shared/money.js';
import { unauthorized } from '../errors.js';
import { me } from './common.js';

const CARD_INCLUDE = {
  organizer: { select: { id: true, name: true, slug: true } },
  tiers: { where: { active: true, kind: 'ONLINE' }, select: { priceMinor: true } },
};

// Events stay "upcoming" until six hours after they start.
const GRACE_MS = 6 * 3600 * 1000;

function plural(count, word) {
  if (count === 1) return `${count} ${word}`;
  return `${count} ${word}${word === word.toUpperCase() ? 'S' : 's'}`;
}

// A calendar cell has room for a word or two: "Afrogroove Night", "Driver".
function shortTitle(title) {
  return title.split(/\s+/).filter((word) => /[\p{L}\p{N}]/u.test(word)).slice(0, 2).join(' ').replace(/[,.;:]+$/, '');
}

function needZone(need) {
  return COUNTRIES[need.country]?.timezone || 'UTC';
}

async function waitlistPositions(entries) {
  return Promise.all(
    entries.map(async (entry) => {
      if (entry.notifiedAt) return null;
      const ahead = await prisma.waitlistEntry.count({ where: { tierId: entry.tierId, notifiedAt: null, createdAt: { lt: entry.createdAt } } });
      return ahead + 1;
    }),
  );
}

function offerView(offer, need) {
  const booking = offer.booking;
  const releaseRule = `${offer.provider.name} is paid ${ESCROW.bookingReleaseDelayHours} hours after the job unless you raise a problem.`;
  const notes = {
    PENDING_PAYMENT: `Pay into escrow to lock ${offer.provider.name} in. ${releaseRule}`,
    ESCROWED: `Paid and held in escrow. ${releaseRule}`,
    DISPUTED: 'A dispute is open on this booking. The money stays in escrow until it is settled.',
    RELEASED: `Done — ${offer.provider.name} has been paid.`,
  };
  return {
    id: offer.id,
    name: offer.provider.name,
    providerHref: `/vendors/${offer.provider.slug}`,
    rating: ratingLabel(offer.provider),
    jobs: offer.provider.jobsCompleted,
    note: offer.note || offer.title,
    price: formatMoney(offer.priceMinor, offer.currency),
    status: offer.status,
    canAccept: ['OPEN', 'COUNTERED'].includes(offer.status) && ['OPEN', 'PAUSED'].includes(need.status),
    accepted: offer.status === 'ACCEPTED',
    threadHref: `/messages?thread=${offer.threadId}`,
    bookingId: booking?.id || null,
    bookingRef: booking?.reference || null,
    bookingNote: booking ? notes[booking.status] || '' : '',
    needsPayment: booking?.status === 'PENDING_PAYMENT',
  };
}

export async function myTwendeView(viewer) {
  if (!viewer) throw unauthorized();
  const now = new Date();
  const since = new Date(now.getTime() - GRACE_MS);

  const [person, rsvps, tickets, needs, events, saved, follows, notices, waitlist, points, referralCount, referralPoints, prefs, user, bookings, rates] = await Promise.all([
    me(viewer),
    prisma.rsvp.findMany({
      where: { userId: viewer.id, status: { in: ['GOING', 'INTERESTED'] }, event: { startsAt: { gte: since }, status: { in: ['PUBLISHED', 'PAUSED', 'CANCELLED'] } } },
      include: { event: { include: CARD_INCLUDE } },
      orderBy: { event: { startsAt: 'asc' } },
      take: 30,
    }),
    prisma.ticket.findMany({
      where: { OR: [{ ownerId: viewer.id }, { order: { buyerId: viewer.id } }], status: { not: 'VOID' }, event: { startsAt: { gte: since } } },
      select: { code: true, holderName: true, eventId: true, status: true, tier: { select: { name: true } }, order: { select: { reference: true } } },
      orderBy: { createdAt: 'asc' },
    }),
    prisma.need.findMany({
      where: { posterId: viewer.id, status: { not: 'CLOSED' } },
      include: {
        offers: {
          where: { status: { in: ['OPEN', 'COUNTERED', 'ACCEPTED'] } },
          include: {
            provider: { select: { name: true, slug: true, ratingSum: true, ratingCount: true, jobsCompleted: true } },
            booking: { select: { id: true, reference: true, status: true } },
          },
          orderBy: { priceMinor: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 12,
    }),
    prisma.event.findMany({
      where: { createdById: viewer.id, status: { not: 'ARCHIVED' } },
      include: { ...CARD_INCLUDE, _count: { select: { tickets: { where: { status: { not: 'VOID' } } } } } },
      orderBy: { startsAt: 'desc' },
      take: 12,
    }),
    prisma.savedEvent.findMany({
      where: { userId: viewer.id, event: { status: 'PUBLISHED', hiddenAt: null } },
      include: { event: { include: CARD_INCLUDE } },
      orderBy: { createdAt: 'desc' },
      take: 16,
    }),
    prisma.follow.findMany({ where: { followerId: viewer.id }, include: { organizer: { select: { id: true, name: true, slug: true } } } }),
    prisma.notification.findMany({ where: { userId: viewer.id }, orderBy: { createdAt: 'desc' }, take: 30 }),
    prisma.waitlistEntry.findMany({
      where: { userId: viewer.id, event: { startsAt: { gte: now } } },
      include: { event: { select: { title: true, slug: true } }, tier: { select: { name: true } } },
      orderBy: { createdAt: 'asc' },
    }),
    balanceOf(prisma, accounts.wallet(viewer.id)),
    prisma.referralReward.count({ where: { referrerId: viewer.id, milestone: 'JOINED' } }),
    prisma.referralReward.aggregate({ where: { referrerId: viewer.id }, _sum: { points: true } }),
    preferencesFor(prisma, viewer.id),
    prisma.user.findUnique({ where: { id: viewer.id }, select: { weeklyDigest: true, city: true, country: true } }),
    prisma.booking.findMany({
      where: { customerId: viewer.id, status: { in: ['PENDING_PAYMENT', 'ESCROWED'] }, serviceStartsOn: { not: null } },
      select: { title: true, serviceStartsOn: true, threadId: true, status: true },
    }),
    getRates(),
  ]);

  const followedOrganizers = follows.filter((follow) => follow.organizer).map((follow) => follow.organizer);

  const positions = await waitlistPositions(waitlist);

  // Tickets grouped by event, for the door QR codes.
  const ticketsByEvent = new Map();
  for (const ticket of tickets) {
    const list = ticketsByEvent.get(ticket.eventId) || [];
    list.push({
      code: ticket.code,
      holder: ticket.holderName,
      tier: ticket.tier.name,
      used: ticket.status === 'CHECKED_IN',
      order: ticket.order.reference,
      qr: `/api/tickets/${ticket.code}/qr`,
    });
    ticketsByEvent.set(ticket.eventId, list);
  }

  const base = config().appUrl;
  const upcoming = rsvps.map((rsvp) => {
    const card = toEventCard(rsvp.event);
    const eventTickets = ticketsByEvent.get(rsvp.eventId) || [];
    // dayLabel() gives "SAT · 8 AUG".
    const [dow = '', dayMonth = ''] = card.date.split(' · ');
    const [day = '', mon = ''] = dayMonth.split(' ');
    return {
      rsvpId: rsvp.id,
      dow,
      day,
      mon,
      venue: card.venue,
      by: card.organizer,
      isFree: card.isFree,
      ticketsHref: card.isFree ? card.href : `/checkout?event=${card.slug}`,
      slug: card.slug,
      href: card.href,
      img: card.img,
      title: card.title,
      city: card.city,
      date: `${card.date} · ${card.time}`,
      status: rsvp.event.status === 'CANCELLED' ? 'CANCELLED' : rsvp.event.status === 'PAUSED' ? 'ON HOLD' : rsvp.status,
      owned: rsvp.event.createdById === viewer.id,
      link: `${base}/events/${card.slug}?r=${viewer.handle}`,
      reminderPlan: rsvp.reminderPlan,
      reminders: REMINDER_PLANS[rsvp.reminderPlan] || rsvp.reminderPlan,
      calendarAdded: Boolean(rsvp.calendarAddedAt),
      calendarHref: `/api/events/${card.slug}/calendar`,
      tickets: eventTickets,
      disputeHref: eventTickets.length ? `/disputes?order=${eventTickets[0].order}` : null,
      analyticsHref: `/organizer-analytics?event=${card.slug}`,
    };
  });

  const activeNeeds = needs
    .filter((need) => ['OPEN', 'PAUSED', 'ACCEPTED'].includes(need.status) && need.offers.length)
    .map((need) => ({
      id: need.id,
      title: need.title,
      offerCount: need.offerCount,
      status: need.status,
      meta: [need.city, dateRange(need.startsOn, need.endsOn), need.closesAt && need.status === 'OPEN' ? `offers close ${shortDate(need.closesAt, needZone(need))}` : null]
        .filter(Boolean)
        .join(' · ')
        .toUpperCase(),
      offers: need.offers.map((offer) => offerView(offer, need)),
    }));

  const needPosts = needs.map((need) => {
    const stageIndex = need.status === 'COMPLETED' ? 4 : need.status === 'ACCEPTED' ? 3 : need.offerCount > 0 ? 2 : 1;
    const open = ['OPEN', 'PAUSED'].includes(need.status);
    const firstThread = need.offers[0]?.threadId;
    return {
      kind: 'NEED',
      id: need.id,
      slug: need.slug,
      title: need.title,
      href: null,
      status: need.status,
      stageIndex,
      stage: need.status === 'PAUSED' ? 'PAUSED' : ['DRAFT', 'LIVE', 'OFFERS IN', 'ACCEPTED', 'DONE'][stageIndex],
      meta: [need.city, dateRange(need.startsOn, need.endsOn), need.budgetMinor ? `budget ${formatMoney(need.budgetMinor, need.currency)}` : null]
        .filter(Boolean)
        .join(' · ')
        .toUpperCase(),
      stats: [need.viewCount ? plural(need.viewCount, 'VIEW') : null, plural(need.offerCount, 'OFFER'), `POSTED ${relativeTime(need.createdAt)}`].filter(Boolean).join(' · '),
      offers: need.offerCount,
      offersHref: firstThread ? `/messages?thread=${firstThread}` : '/messages',
      editable: open,
      editHref: `/create-event?kind=need&edit=${need.id}`,
      pausable: open,
      paused: need.status === 'PAUSED',
      closable: open,
      canPublish: false,
      shareable: false,
      at: need.createdAt,
    };
  });

  const eventPosts = events.map((event) => {
    const over = (event.endsAt || event.startsAt) < now;
    const stage = { DRAFT: 'DRAFT', PAUSED: 'PAUSED', CANCELLED: 'CANCELLED' }[event.status] || (over ? 'DONE' : 'LIVE');
    const manageable = ['DRAFT', 'PUBLISHED', 'PAUSED'].includes(event.status) && !over;
    return {
      kind: 'EVENT',
      id: event.id,
      slug: event.slug,
      title: event.title,
      href: `/events/${event.slug}`,
      status: event.status,
      stageIndex: event.status === 'DRAFT' ? 0 : over ? 4 : 1,
      stage,
      meta: `${event.city} · ${dayLabel(event.startsAt, event.timezone)} · ${event.isFree ? 'free RSVP' : 'ticketed'}`.toUpperCase(),
      stats: `${event.goingCount} GOING · ${plural(event.viewCount, 'VIEW')}${event.isFree ? '' : ` · ${plural(event._count.tickets, 'TICKET')} SOLD`}`,
      offers: 0,
      offersHref: null,
      editable: manageable,
      editHref: `/create-event?edit=${event.slug}`,
      pausable: manageable && event.status !== 'DRAFT',
      paused: event.status === 'PAUSED',
      closable: manageable,
      canPublish: event.status === 'DRAFT',
      shareable: event.status === 'PUBLISHED',
      shareUrl: `${base}/events/${event.slug}?r=${viewer.handle}`,
      analyticsHref: `/organizer-analytics?event=${event.slug}`,
      at: event.createdAt,
    };
  });

  const posts = [...needPosts, ...eventPosts].sort((a, b) => b.at - a.at).map(({ at: _at, ...post }) => post);

  // Calendar entries keyed by the local day of each event, deadline or booking.
  const calendar = [
    ...rsvps.map((rsvp) => ({
      day: dayKey(rsvp.event.startsAt, rsvp.event.timezone),
      kind: 'event',
      title: rsvp.event.title,
      short: shortTitle(rsvp.event.title),
      meta: `${timeLabel(rsvp.event.startsAt, rsvp.event.timezone)} · ${rsvp.event.venue}, ${rsvp.event.city}`,
      href: `/events/${rsvp.event.slug}`,
    })),
    ...needs
      .filter((need) => need.closesAt && need.status === 'OPEN')
      .map((need) => ({
        day: dayKey(need.closesAt, needZone(need)),
        kind: 'post',
        title: `Offers close: ${need.title}`,
        short: 'Offers close',
        meta: `${plural(need.offerCount, 'offer')} so far`,
        href: '/my-twende?tab=upcoming',
      })),
    ...bookings.map((booking) => ({
      day: booking.serviceStartsOn.toISOString().slice(0, 10),
      kind: 'post',
      title: booking.title,
      short: shortTitle(booking.title),
      meta: booking.status === 'ESCROWED' ? 'Booked · paid into escrow' : 'Accepted · waiting for your payment',
      href: booking.threadId ? `/messages?thread=${booking.threadId}` : '/messages',
    })),
  ];

  const place = [user.city, COUNTRIES[user.country]?.name].filter(Boolean).join(', ');
  // One point is one US cent, so the dollar value is exact; other currencies
  // are an estimate at today's rate.
  const currency = viewer.currency || 'USD';
  const walletValue = currency === 'USD' || !rates[currency] ? formatMoney(points, 'USD') : `≈ ${formatMoney(convert(points, 'PTS', currency, rates), currency, { cents: false })}`;
  const offersByNeed = new Map(activeNeeds.map((need) => [need.id, need.offers]));

  return {
    me: person,
    place,
    notices: notices.map((notice) => ({
      id: notice.id,
      topic: notice.topic,
      title: notice.title,
      detail: notice.body,
      time: relativeTime(notice.createdAt),
      href: notice.href || '/my-twende',
      unread: !notice.readAt,
    })),
    // The organizers this person follows, for the rail.
    organizers: followedOrganizers.map((organizer) => ({ init: initials(organizer.name), name: organizer.name, slug: organizer.slug })),
    upcoming,
    activeNeeds,
    waitlist: waitlist.map((entry, index) => ({
      id: entry.id,
      title: `${entry.event.title} · ${entry.tier.name}`,
      checkoutHref: `/checkout?event=${entry.event.slug}`,
      since: relativeTime(entry.createdAt),
      notified: Boolean(entry.notifiedAt),
      position: positions[index],
    })),
    // A need's offers ride along with its post, for "View offers".
    posts: posts.map((post) => (post.kind === 'NEED' ? { ...post, offerList: offersByNeed.get(post.id) || [] } : post)),
    saved: saved.map((row) => toEventCard(row.event)),
    calendar,
    wallet: { points, value: walletValue },
    referral: {
      link: `${base}/r/${viewer.handle}`,
      friends: referralCount,
      points: referralPoints._sum.points || 0,
      joinPoints: REFERRAL_POINTS.JOINED,
      ticketPoints: REFERRAL_POINTS.FIRST_TICKET,
    },
    prefs: { reminders: prefs.REMINDERS.email, offers: prefs.OFFERS.email, social: prefs.SOCIAL.email, digest: user.weeklyDigest },
    today: dayKey(now, COUNTRIES[user.country]?.timezone || 'UTC'),
  };
}
