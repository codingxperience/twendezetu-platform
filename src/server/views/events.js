// The events page: search and filters over every upcoming public event,
// with vendors that match the same search alongside.

import { prisma } from '../db.js';
import { getRates } from '../fx.js';
import { BROWSE_SORTS, browseEvents, eventCities } from '../services/events.js';
import { listProviders } from '../services/providers.js';
import { EVENT_CATEGORIES, whenBadge } from '../../shared/format.js';
import { CATEGORY_SHELVES } from './home-shelves.js';
import { me } from './common.js';

const PAGE = 48;
const WHENS = ['week', 'weekend', 'month'];

export function readBrowseQuery(params = {}) {
  const text = (value, max = 80) => (typeof value === 'string' && value.trim() ? value.trim().slice(0, max) : undefined);
  const category = text(params.category);
  const when = text(params.when);
  const sort = text(params.sort);
  const page = Math.min(Math.max(Number.parseInt(params.page, 10) || 1, 1), 5);
  return {
    q: text(params.q),
    category: category && EVENT_CATEGORIES[category] ? category : undefined,
    city: text(params.city),
    when: WHENS.includes(when) ? when : undefined,
    price: params.price === 'free' ? 'free' : undefined,
    organizer: text(params.organizer, 120),
    sort: BROWSE_SORTS.includes(sort) ? sort : 'soon',
    page,
  };
}

export async function eventsView(viewer, query) {
  const now = new Date();
  const [person, found, cities, organizer, vendors, rates] = await Promise.all([
    me(viewer),
    browseEvents({ ...query, limit: PAGE * query.page }),
    eventCities(),
    query.organizer ? prisma.organizer.findUnique({ where: { slug: query.organizer }, select: { name: true, verifiedAt: true, followersCount: true } }) : null,
    query.q ? listProviders({ q: query.q, limit: 6 }) : [],
    getRates(),
  ]);
  return {
    me: person,
    query,
    rates,
    total: found.total,
    events: found.events.map((event) => ({ ...event, when: whenBadge(event.startsAt, event.timezone, now) })),
    hasMore: found.total > found.events.length,
    cities: cities.slice(0, 24),
    categories: Object.keys(CATEGORY_SHELVES).map((key) => ({ key, title: CATEGORY_SHELVES[key].title })),
    organizer: organizer ? { name: organizer.name, verified: Boolean(organizer.verifiedAt), followers: organizer.followersCount } : null,
    vendors,
    // Which of these the viewer has saved, so the hearts start filled in.
    savedSlugs: viewer
      ? (await prisma.savedEvent.findMany({ where: { userId: viewer.id, eventId: { in: found.events.map((event) => event.id) } }, select: { event: { select: { slug: true } } } })).map((row) => row.event.slug)
      : [],
  };
}
