// The provider portal: leads matched to the listing, bookings, membership,
// earnings, and the listing editor. A member without a listing gets the same
// editor as a way to start one.

import { prisma, toNumber } from '../db.js';
import { unauthorized } from '../errors.js';
import { FEES } from '../fees.js';
import { preferencesFor } from '../notify/preferences.js';
import { providerDashboard } from '../services/providers.js';
import { COUNTRIES, PROVIDER_CATEGORIES, initials } from '../../shared/format.js';
import { formatCompact, formatMoney, toMajor } from '../../shared/money.js';
import { appUrl, me } from './common.js';

const WEEKS = 12;
const WEEK_MS = 7 * 86_400_000;

// Memberships are priced in the provider's local currency where we have a
// price for it, otherwise in dollars.
function membershipCurrency(country) {
  const currency = COUNTRIES[country]?.currency;
  return FEES.membershipMinor[currency] ? currency : 'USD';
}

function options() {
  return {
    categories: Object.entries(PROVIDER_CATEGORIES).map(([code, item]) => ({ code, label: item.label })),
    countries: Object.entries(COUNTRIES).map(([code, item]) => ({ code, name: item.name, currency: item.currency })),
  };
}

// What the provider earned (money credited to their earnings account) over
// the last twelve weeks, in the listing's currency, week by week.
async function earningsTrend(userId, currency) {
  const since = new Date(Date.now() - WEEKS * WEEK_MS);
  const lines = await prisma.journalLine.findMany({
    where: { amount: { gt: 0 }, createdAt: { gte: since }, currency, account: { kind: 'EARNINGS', ownerKey: userId } },
    select: { amount: true, createdAt: true },
  });
  const weeks = Array.from({ length: WEEKS }, () => 0);
  for (const line of lines) {
    const index = WEEKS - 1 - Math.floor((Date.now() - line.createdAt.getTime()) / WEEK_MS);
    if (index >= 0) weeks[index] += toNumber(line.amount);
  }
  const total = weeks.reduce((sum, value) => sum + value, 0);
  const peak = Math.max(1, ...weeks);
  return {
    total: formatCompact(total, currency),
    bars: weeks.map((value, index) => ({ h: `${Math.max(3, Math.round((value / peak) * 100))}%`, latest: index === WEEKS - 1, value })),
  };
}

function listingValues(provider, services, media) {
  const major = (minor, currency) => (minor == null ? '' : String(toMajor(minor, currency)));
  return {
    name: provider.name,
    category: provider.category,
    city: provider.city,
    country: provider.country,
    currency: provider.rateCurrency,
    headline: provider.headline,
    description: provider.description,
    coverUrl: provider.coverUrl,
    rate: major(provider.rateMinor, provider.rateCurrency),
    rateUnit: provider.rateUnit || '',
    serviceAreas: provider.serviceAreas.join(', '),
    services: services.map((service) => ({ title: service.title, description: service.description, rate: major(service.rateMinor, service.currency), rateUnit: service.rateUnit || '' })),
    media: media.map((item) => ({ url: item.url, alt: item.alt })),
  };
}

export async function providerDashboardView(viewer) {
  if (!viewer) throw unauthorized();
  const person = await me(viewer);
  const provider = await prisma.provider.findUnique({
    where: { ownerId: viewer.id },
    include: { services: { orderBy: { sortOrder: 'asc' } }, media: { orderBy: { sortOrder: 'asc' } } },
  });

  if (!provider) {
    const country = COUNTRIES[viewer.country] ? viewer.country : 'KE';
    const currency = membershipCurrency(country);
    return {
      me: person,
      hasListing: false,
      ...options(),
      listing: {
        name: viewer.name,
        category: 'MUSIC_DJS',
        city: viewer.city || '',
        country,
        currency: COUNTRIES[country].currency,
        headline: '',
        description: '',
        coverUrl: '',
        rate: '',
        rateUnit: '',
        serviceAreas: '',
        services: [],
        media: [],
      },
      membershipPrice: formatMoney(FEES.membershipMinor[currency], currency),
    };
  }

  const [dashboard, earnings, prefs, user, unread] = await Promise.all([
    providerDashboard(viewer),
    earningsTrend(viewer.id, provider.rateCurrency),
    preferencesFor(prisma, viewer.id),
    prisma.user.findUnique({ where: { id: viewer.id }, select: { weeklyDigest: true } }),
    prisma.notification.count({ where: { userId: viewer.id, readAt: null } }),
  ]);

  return {
    me: person,
    hasListing: true,
    ...options(),
    appUrl: appUrl(),
    provider: {
      ...dashboard.provider,
      initials: initials(provider.name),
      coverUrl: provider.coverUrl,
      rating: dashboard.tiles.rating,
      jobs: provider.jobsCompleted,
      areas: [provider.city, ...provider.serviceAreas.filter((area) => area.toLowerCase() !== provider.city.toLowerCase())].slice(0, 3).join(' + '),
      matchedTo: [PROVIDER_CATEGORIES[provider.category].label, provider.city, ...provider.serviceAreas].join(' · ').toLowerCase(),
      currency: provider.rateCurrency,
    },
    listing: listingValues(provider, provider.services, provider.media),
    tiles: dashboard.tiles,
    leads: dashboard.leads,
    requests: dashboard.requests,
    bookings: dashboard.bookings.map((booking) => ({
      ...booking,
      serviceStartsOn: booking.serviceStartsOn.toISOString().slice(0, 10),
      serviceEndsOn: (booking.serviceEndsOn || booking.serviceStartsOn).toISOString().slice(0, 10),
    })),
    weeklyViews: dashboard.weeklyViews,
    notifications: dashboard.notifications,
    unread,
    membership: {
      ...dashboard.membership,
      endsAt: provider.membershipEndsAt ? provider.membershipEndsAt.toISOString() : null,
      status: provider.status,
      discountPercent: FEES.earlyRenewalBps / 100,
      earlyWindowDays: FEES.earlyRenewalWindowDays,
    },
    earnings,
    commissionPercent: FEES.bookingCommissionBps / 100,
    prefs: { leads: prefs.LEADS.inApp, offers: prefs.OFFERS.inApp, money: prefs.MONEY.email, digest: user.weeklyDigest },
    today: new Date().toISOString().slice(0, 10),
  };
}
