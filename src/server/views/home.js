// The event guide: every upcoming event, the featured one, the needs board
// and what has recently happened on the platform.

import { unstable_cache } from 'next/cache';
import { prisma } from '../db.js';
import { getRates } from '../fx.js';
import { categoryCounts, listGuideEvents } from '../services/events.js';
import { openNeeds } from '../services/marketplace.js';
import { EVENT_CATEGORIES, PROVIDER_CATEGORIES, relativeTime } from '../../shared/format.js';
import { me } from './common.js';

// Recent activity, written up as short guide entries. Every line is backed
// by a real row: a newly published event, a newly verified provider, a pool
// that people are chipping into.
async function recentActivity() {
  const [events, providers, pools] = await Promise.all([
    prisma.event.findMany({
      where: { status: 'PUBLISHED', hiddenAt: null, startsAt: { gt: new Date() } },
      orderBy: { publishedAt: 'desc' },
      take: 2,
      include: { organizer: { select: { name: true } } },
    }),
    prisma.provider.findMany({ where: { status: 'ACTIVE', verifiedAt: { not: null } }, orderBy: { verifiedAt: 'desc' }, take: 1 }),
    prisma.pool.findMany({ where: { status: { in: ['OPEN', 'FUNDED'] }, contributorCount: { gt: 1 } }, orderBy: { updatedAt: 'desc' }, take: 1 }),
  ]);
  return [
    ...events.map((event) => ({
      at: event.publishedAt,
      href: `/events/${event.slug}`,
      title: `${event.organizer.name} posts ${event.title}`,
      desc: event.blurb,
      img: event.coverUrl,
    })),
    ...providers.map((provider) => ({
      at: provider.verifiedAt,
      href: `/providers/${provider.slug}`,
      title: `${provider.name} is now verified`,
      desc: `${PROVIDER_CATEGORIES[provider.category].label} in ${provider.city}. ${provider.headline}`,
      img: provider.coverUrl,
    })),
    ...pools.map((pool) => ({
      at: pool.updatedAt,
      href: `/points-wallet?pool=${pool.slug}`,
      title: `Harambee: ${pool.contributorCount} people, one goal — ${pool.title}`,
      desc: `${Math.min(100, Math.round((pool.raisedPoints / pool.goalPoints) * 100))}% of the way there. ${pool.purpose}`,
      img: 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=500&q=80',
    })),
  ]
    .sort((a, b) => b.at - a.at)
    .map(({ at, ...story }) => ({ ...story, when: relativeTime(at) }));
}

// The public part of the guide is the same for everyone, so it is computed at
// most once a minute per server instance instead of on every visit.
const publicGuide = unstable_cache(
  async () => {
    const [events, counts, needs, stories, rates] = await Promise.all([
      listGuideEvents({ limit: 160 }),
      categoryCounts(),
      openNeeds({ limit: 3 }),
      recentActivity(),
      getRates(),
    ]);
    return { events, counts, needs, stories, rates };
  },
  ['home-guide'],
  { revalidate: 60, tags: ['guide'] },
);

export async function homeView(viewer) {
  const [{ events, counts, needs, stories, rates }, person] = await Promise.all([publicGuide(), me(viewer)]);
  const featured = events.find((event) => event.featured) || events[0] || null;
  return {
    me: person,
    events,
    featured,
    categories: Object.keys(EVENT_CATEGORIES).map((key) => ({ key, label: EVENT_CATEGORIES[key], count: counts[key] || 0 })),
    needs,
    stories,
    rates,
    city: viewer?.city || null,
  };
}
