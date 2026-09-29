// A provider's public page. Providers with a gallery and a list of services
// get the full layout; everyone else gets the compact one. Same data either
// way.

import { prisma } from '../db.js';
import { FEES } from '../fees.js';
import { getProviderPage } from '../services/providers.js';
import { COUNTRIES, PROVIDER_CATEGORIES, shortDate } from '../../shared/format.js';
import { appUrl, me } from './common.js';

const RICH_MIN_MEDIA = 3;
const SAMPLE_THREADS = 30;
const MIN_SAMPLES = 3;

// Median time from a customer's first message to the vendor's first
// reply, over recent conversations. Null until there is enough to go on.
async function typicalResponse(provider) {
  const threads = await prisma.thread.findMany({
    where: { providerId: provider.id, kind: { in: ['PROVIDER', 'NEED'] } },
    orderBy: { lastMessageAt: 'desc' },
    take: SAMPLE_THREADS,
    select: { messages: { where: { senderId: { not: null } }, orderBy: { createdAt: 'asc' }, take: 20, select: { senderId: true, createdAt: true } } },
  });
  const waits = [];
  for (const { messages } of threads) {
    const asked = messages.find((message) => message.senderId !== provider.ownerId);
    const answered = asked && messages.find((message) => message.senderId === provider.ownerId && message.createdAt > asked.createdAt);
    if (answered) waits.push(answered.createdAt - asked.createdAt);
  }
  if (waits.length < MIN_SAMPLES) return null;
  waits.sort((a, b) => a - b);
  const median = waits[Math.floor(waits.length / 2)];
  const minutes = Math.max(1, Math.round(median / 60_000));
  if (minutes < 60) return `RESPONDS IN ~${minutes} MIN`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `RESPONDS IN ~${hours} HR${hours === 1 ? '' : 'S'}`;
  return `RESPONDS IN ~${Math.round(hours / 24)} DAYS`;
}

export async function providerView(viewer, { slug } = {}) {
  const page = slug ? await getProviderPage(String(slug), viewer) : null;
  if (!page) return null;
  const { provider, card } = page;
  const [person, response] = await Promise.all([me(viewer), typicalResponse(provider)]);
  const country = COUNTRIES[provider.country]?.name || provider.country;
  const areas = provider.serviceAreas.filter((area) => area.toLowerCase() !== provider.city.toLowerCase());
  const rich = provider.media.length >= RICH_MIN_MEDIA && page.services.length > 0;

  return {
    me: person,
    layout: rich ? 'provider' : 'providerDetail',
    slug: provider.slug,
    name: provider.name,
    headline: provider.headline,
    description: provider.description,
    category: PROVIDER_CATEGORIES[provider.category].label,
    categoryCode: provider.category,
    place: `${provider.city}, ${country}`,
    city: provider.city,
    areasLabel: [provider.city, ...areas].slice(0, 3).join(' + ').toUpperCase(),
    since: provider.createdAt.getUTCFullYear(),
    verified: Boolean(provider.verifiedAt),
    membershipEndsOn: provider.membershipEndsAt ? shortDate(provider.membershipEndsAt) : null,
    response,
    card,
    img: provider.coverUrl,
    gallery: page.gallery.map(([url, alt]) => ({ url, alt })),
    services: page.services,
    breakdown: page.breakdown,
    ratingCount: provider.ratingCount,
    reviews: page.reviews,
    reviewable: page.reviewableBookings,
    similar: page.similar,
    following: page.following,
    isOwner: page.isOwner,
    commissionPercent: `${FEES.bookingCommissionBps / 100}%`,
    shareUrl: `${appUrl()}/providers/${provider.slug}`,
  };
}
