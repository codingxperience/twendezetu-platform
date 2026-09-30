// The home page: events first, vendors second. Every section is a query over
// real rows; a section with nothing in it is left out rather than padded.

import { unstable_cache } from 'next/cache';
import { prisma } from '../db.js';
import { getRates } from '../fx.js';
import { CARD_INCLUDE, listGuideEvents, toEventCard } from '../services/events.js';
import { listProviders } from '../services/providers.js';
import { openNeeds } from '../services/marketplace.js';
import { initials, whenBadge } from '../../shared/format.js';
import { byStart, publicShelves } from './home-shelves.js';
import { me } from './common.js';

const DAY = 24 * 60 * 60 * 1000;
const TRENDING_WINDOW = 14 * DAY;

// People who RSVPed or bought tickets in the last two weeks, per event.
async function recentInterest(since) {
  const [rsvps, tickets] = await Promise.all([
    prisma.rsvp.groupBy({ by: ['eventId'], where: { createdAt: { gte: since }, status: 'GOING' }, _sum: { partySize: true } }),
    prisma.ticket.groupBy({ by: ['eventId'], where: { createdAt: { gte: since }, status: { not: 'VOID' } }, _count: { _all: true } }),
  ]);
  const score = new Map();
  for (const row of rsvps) score.set(row.eventId, (score.get(row.eventId) || 0) + (row._sum.partySize || 0));
  for (const row of tickets) score.set(row.eventId, (score.get(row.eventId) || 0) + row._count._all);
  return Object.fromEntries(score);
}

// Organizers people follow most, with how many events each has coming up.
async function popularOrganizers() {
  const rows = await prisma.organizer.findMany({
    orderBy: [{ followersCount: 'desc' }, { name: 'asc' }],
    take: 12,
    select: {
      id: true,
      slug: true,
      name: true,
      city: true,
      verifiedAt: true,
      followersCount: true,
      _count: { select: { events: { where: { status: 'PUBLISHED', hiddenAt: null, startsAt: { gte: new Date() } } } } },
    },
  });
  return rows.map((row) => ({
    slug: row.slug,
    name: row.name,
    city: row.city,
    initials: initials(row.name),
    verified: Boolean(row.verifiedAt),
    followers: row.followersCount,
    upcoming: row._count.events,
  }));
}

// How many people have been let in at each live event, from door scans.
async function peopleHere(eventIds) {
  if (!eventIds.length) return {};
  const rows = await prisma.ticket.groupBy({ by: ['eventId'], where: { eventId: { in: eventIds }, checkedInAt: { not: null } }, _count: { _all: true } });
  return Object.fromEntries(rows.map((row) => [row.eventId, row._count._all]));
}

// What is the same for every visitor, computed at most once a minute.
const publicHome = unstable_cache(
  async () => {
    const [events, interest, vendors, needs, rates, organizers] = await Promise.all([
      listGuideEvents({ limit: 200 }),
      recentInterest(new Date(Date.now() - TRENDING_WINDOW)),
      listProviders({ limit: 12 }),
      openNeeds({ limit: 8 }),
      getRates(),
      popularOrganizers(),
    ]);
    return { events, interest, vendors, needs, rates, organizers };
  },
  ['home-shelves'],
  { revalidate: 60, tags: ['guide'] },
);

// The signed-in part: organizers and vendors followed, what is coming up for
// this person, their saved events and their next event for the bottom bar.
async function personal(viewer, now) {
  const since = new Date(now.getTime() - 6 * 60 * 60 * 1000);
  const [follows, rsvps, tickets, saved, savedSlugs] = await Promise.all([
    prisma.follow.findMany({
      where: { followerId: viewer.id },
      include: {
        organizer: { select: { id: true, name: true, slug: true, verifiedAt: true } },
        provider: { select: { id: true, name: true, slug: true, coverUrl: true, verifiedAt: true, status: true } },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.rsvp.findMany({
      where: { userId: viewer.id, status: 'GOING', event: { startsAt: { gte: since }, status: 'PUBLISHED', hiddenAt: null } },
      include: { event: { include: CARD_INCLUDE } },
      orderBy: { event: { startsAt: 'asc' } },
      take: 12,
    }),
    prisma.ticket.findMany({
      where: { OR: [{ ownerId: viewer.id }, { order: { buyerId: viewer.id } }], status: { not: 'VOID' }, event: { startsAt: { gte: since }, status: 'PUBLISHED' } },
      include: { event: { include: CARD_INCLUDE } },
      orderBy: { event: { startsAt: 'asc' } },
      take: 24,
    }),
    prisma.savedEvent.findMany({
      where: { userId: viewer.id, event: { status: 'PUBLISHED', hiddenAt: null, startsAt: { gte: since } } },
      include: { event: { include: CARD_INCLUDE } },
      orderBy: { createdAt: 'desc' },
      take: 18,
    }),
    prisma.savedEvent.findMany({ where: { userId: viewer.id }, select: { event: { select: { slug: true } } } }),
  ]);

  const organizers = follows.filter((follow) => follow.organizer).map((follow) => follow.organizer);
  const followedVendors = follows.filter((follow) => follow.provider?.status === 'ACTIVE').map((follow) => follow.provider);

  const fromFollowedRows = organizers.length
    ? await prisma.event.findMany({
        where: { organizerId: { in: organizers.map((organizer) => organizer.id) }, status: 'PUBLISHED', hiddenAt: null, startsAt: { gte: since } },
        include: CARD_INCLUDE,
        orderBy: { startsAt: 'asc' },
        take: 60,
      })
    : [];
  const badge = (event) => ({ ...toEventCard(event), when: whenBadge(event.startsAt, event.timezone, now) });
  const fromFollowed = fromFollowedRows.map(badge);

  // One entry per event: a ticket wins over an RSVP, since it opens the door.
  const coming = new Map();
  for (const ticket of tickets) {
    if (!coming.has(ticket.eventId)) coming.set(ticket.eventId, { ...badge(ticket.event), ticketCode: ticket.code, kind: 'TICKET' });
  }
  for (const rsvp of rsvps) {
    if (!coming.has(rsvp.eventId)) coming.set(rsvp.eventId, { ...badge(rsvp.event), kind: 'RSVP' });
  }
  const comingUp = [...coming.values()].sort(byStart).slice(0, 8);

  // "More from …" for the followed organizers with the most coming up.
  const perOrganizer = new Map();
  for (const event of fromFollowed) {
    const list = perOrganizer.get(event.organizerSlug) || [];
    list.push(event);
    perOrganizer.set(event.organizerSlug, list);
  }
  const moreFrom = [...perOrganizer.entries()]
    .filter(([, list]) => list.length >= 2)
    .sort((a, b) => b[1].length - a[1].length)
    .slice(0, 3)
    .map(([slug, list]) => ({ slug, name: list[0].organizer, verified: list[0].organizerVerified, events: list.slice(0, 18) }));

  const favourites = [
    ...organizers.map((organizer) => ({ kind: 'ORGANIZER', name: organizer.name, initials: initials(organizer.name), img: null, verified: Boolean(organizer.verifiedAt), href: `/events?organizer=${organizer.slug}` })),
    ...followedVendors.map((vendor) => ({ kind: 'VENDOR', name: vendor.name, initials: initials(vendor.name), img: vendor.coverUrl, verified: Boolean(vendor.verifiedAt), href: `/vendors/${vendor.slug}` })),
  ].slice(0, 12);

  return {
    favourites,
    comingUp,
    nextUp: comingUp[0] || null,
    fromFollowed: fromFollowed.slice(0, 18),
    moreFrom,
    saved: saved.map((row) => badge(row.event)),
    followsSomeone: follows.length > 0,
    followingOrganizers: organizers.map((organizer) => organizer.slug),
    // Every event this person has saved, so hearts anywhere on the page are right.
    savedSlugs: savedSlugs.map((row) => row.event.slug),
  };
}

// `city` is the city picked in the header, if any; without one the page
// leans on the city in the member's profile.
export async function homeView(viewer, { city: picked } = {}) {
  const now = new Date();
  const [shared, person, mine] = await Promise.all([publicHome(), me(viewer), viewer ? personal(viewer, now) : null]);
  const city = typeof picked === 'string' && picked ? picked : null;
  const shelves = publicShelves(shared, { city: city || viewer?.city || null, now });
  const here = await peopleHere(shelves.live.map((event) => event.id));
  return {
    me: person,
    rates: shared.rates,
    city,
    ...shelves,
    live: shelves.live.map((event) => ({ ...event, here: here[event.id] || 0 })),
    organizers: shared.organizers,
    personal: mine,
  };
}
