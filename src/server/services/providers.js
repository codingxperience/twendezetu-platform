// Provider listings: the directory, provider pages, service requests,
// listing editor, yearly membership and the provider dashboard.

import { prisma, transaction } from '../db.js';
import { audit } from '../audit.js';
import { badRequest, conflict, forbidden, invalid, notFound, unauthorized } from '../errors.js';
import { accounts, post } from '../ledger.js';
import { getRates } from '../fx.js';
import { FEES } from '../fees.js';
import { formatMoney, percentOf, pointsFor } from '../../shared/money.js';
import { createCharge, openCheckout } from '../payments/charges.js';
import { notify, notifyGuest } from '../notify/index.js';
import { checkRateLimit } from '../security/rate-limit.js';
import { getSettings } from '../settings.js';
import { COUNTRIES, PROVIDER_CATEGORIES, initials, monthYear, rateLabel, ratingLabel, relativeTime, shortName, stars } from '../../shared/format.js';
import { awardReferral } from './referrals.js';
import { uniqueSlug } from './events.js';
import { findOrCreateThread, sendMessage } from './threads.js';
import { requireStepUp } from './identity.js';
import { leadsForProvider } from './marketplace.js';

export function providerCard(provider) {
  return {
    id: provider.id,
    slug: provider.slug,
    href: `/providers/${provider.slug}`,
    name: provider.name,
    cat: PROVIDER_CATEGORIES[provider.category].upper,
    category: provider.category,
    city: provider.city.toUpperCase(),
    rating: ratingLabel(provider),
    jobs: provider.jobsCompleted,
    rate: rateLabel(provider.rateMinor, provider.rateCurrency, provider.rateUnit),
    img: provider.coverUrl,
    verified: Boolean(provider.verifiedAt),
    desc: provider.headline,
    description: provider.description,
  };
}

export async function listProviders({ category, city, q, limit = 60, excludeId } = {}) {
  const where = { status: 'ACTIVE', ...(category ? { category } : {}), ...(city ? { city: { equals: city, mode: 'insensitive' } } : {}), ...(excludeId ? { id: { not: excludeId } } : {}) };
  if (q) {
    const terms = String(q).toLowerCase().replace(/[^\p{L}\p{N}\s]/gu, ' ').split(/\s+/).filter(Boolean).slice(0, 6);
    if (terms.length) {
      const rows = await prisma.$queryRaw`
        SELECT "id" FROM "Provider"
         WHERE app_private.search_document("name", "headline", "city") @@ to_tsquery('simple', ${terms.map((term) => `${term}:*`).join(' & ')})
         LIMIT 200`;
      where.id = { in: rows.map((row) => row.id) };
    }
  }
  const providers = await prisma.provider.findMany({
    where,
    orderBy: [{ verifiedAt: { sort: 'desc', nulls: 'last' } }, { ratingCount: 'desc' }, { jobsCompleted: 'desc' }],
    take: Math.min(limit, 200),
  });
  return providers.map(providerCard);
}

export async function ratingBreakdown(providerId) {
  const rows = await prisma.review.groupBy({ by: ['rating'], where: { providerId, hiddenAt: null }, _count: { _all: true } });
  const total = rows.reduce((sum, row) => sum + row._count._all, 0);
  return [5, 4, 3, 2, 1].map((value) => {
    const count = rows.find((row) => row.rating === value)?._count._all || 0;
    return { stars: value, count, pct: `${total ? Math.round((count / total) * 100) : 0}%` };
  });
}

export function reviewView(review) {
  return {
    id: review.id,
    stars: stars(review.rating),
    rating: review.rating,
    job: (review.jobLabel || 'Booking').toUpperCase(),
    when: monthYear(review.createdAt),
    body: review.body,
    who: `${shortName(review.author.name)}${review.bookingId ? ' · verified booking' : ''}`,
    reply: review.reply || false,
  };
}

export async function getProviderPage(slug, viewer) {
  const provider = await prisma.provider.findUnique({
    where: { slug },
    include: {
      services: { orderBy: { sortOrder: 'asc' } },
      media: { orderBy: { sortOrder: 'asc' } },
      reviews: { where: { hiddenAt: null }, orderBy: { createdAt: 'desc' }, take: 12, include: { author: { select: { name: true } } } },
    },
  });
  if (!provider) return null;
  const isOwner = viewer?.id === provider.ownerId;
  const staff = viewer && ['ADMIN', 'MODERATOR'].includes(viewer.role);
  if (provider.status !== 'ACTIVE' && !isOwner && !staff) return null;

  const [breakdown, similar, following, reviewable] = await Promise.all([
    ratingBreakdown(provider.id),
    listProviders({ category: provider.category, excludeId: provider.id, limit: 8 }),
    viewer ? prisma.follow.findUnique({ where: { followerId_providerId: { followerId: viewer.id, providerId: provider.id } } }) : null,
    viewer && !isOwner ? reviewableBookings(viewer.id, provider.id) : [],
  ]);

  return {
    provider,
    card: providerCard(provider),
    isOwner,
    following: Boolean(following),
    breakdown,
    similar,
    reviews: provider.reviews.map(reviewView),
    reviewableBookings: reviewable,
    services: provider.services.map((service, index) => ({
      num: String(index + 1).padStart(2, '0'),
      title: service.title,
      desc: service.description,
      rate: rateLabel(service.rateMinor, service.currency, service.rateUnit),
    })),
    gallery: provider.media.length ? provider.media.map((item) => [item.url, item.alt]) : [[provider.coverUrl, provider.name]],
  };
}

async function reviewableBookings(userId, providerId) {
  const bookings = await prisma.booking.findMany({
    where: { customerId: userId, providerId, status: 'RELEASED', review: null },
    select: { id: true, title: true, serviceStartsOn: true },
    orderBy: { releasedAt: 'desc' },
  });
  return bookings.map((booking) => ({ id: booking.id, label: booking.title }));
}

export async function recordProfileView(providerId, ip) {
  const { allowed } = await checkRateLimit('track.view', `provider:${providerId}:${ip}`);
  if (!allowed) return;
  const day = new Date(new Date().toISOString().slice(0, 10));
  await prisma.$executeRaw`
    INSERT INTO "ProviderStat" ("providerId", "day", "views") VALUES (${providerId}, ${day}, 1)
    ON CONFLICT ("providerId", "day") DO UPDATE SET "views" = "ProviderStat"."views" + 1`;
  await prisma.provider.update({ where: { id: providerId }, data: { profileViews: { increment: 1 } } });
}

// ── Reaching a provider ───────────────────────────────────────────────────

async function listedProvider(slug) {
  const provider = await prisma.provider.findUnique({ where: { slug } });
  if (!provider || provider.status !== 'ACTIVE') throw notFound('That provider is not taking requests.');
  return provider;
}

export async function requestService({ slug, viewer, name, email, message }) {
  const provider = await listedProvider(slug);
  if (viewer?.id === provider.ownerId) throw badRequest('That is your own listing.');
  const requesterName = (viewer?.name || name || '').trim();
  const requesterEmail = (viewer?.email || email || '').trim().toLowerCase();
  if (!requesterName || !requesterEmail) throw invalid('Add your name and email so replies can reach you.');

  let threadId = null;
  if (viewer) {
    const thread = await transaction((tx) =>
      findOrCreateThread(tx, {
        kind: 'PROVIDER',
        subject: `Service request · ${provider.name}`,
        providerId: provider.id,
        participants: [
          { userId: viewer.id, role: 'MEMBER' },
          { userId: provider.ownerId, role: 'PROVIDER' },
        ],
      }),
    );
    await sendMessage(viewer, thread.id, { text: message });
    threadId = thread.id;
  }

  await transaction(async (tx) => {
    await tx.serviceRequest.create({
      data: { providerId: provider.id, requesterId: viewer?.id || null, name: requesterName, email: requesterEmail, message: message.trim().slice(0, 2000), threadId },
    });
    await notify(tx, {
      userId: provider.ownerId,
      topic: 'LEADS',
      title: `New service request from ${shortName(requesterName)}`,
      body: message.trim().slice(0, 200),
      href: threadId ? `/messages?thread=${threadId}` : '/provider-dashboard',
    });
    if (!viewer) {
      await notifyGuest(tx, {
        email: requesterEmail,
        topic: 'OFFERS',
        subject: `Your request to ${provider.name} was sent`,
        body: `${provider.name} has your request. Replies come to this email address, and your contact details stay hidden from the provider until you choose to share them.`,
        href: `/providers/${provider.slug}`,
      });
    }
  });
  return { sent: true, threadId };
}

export async function askProvider(viewer, slug, question) {
  if (!viewer) throw unauthorized('Sign in to ask a question — replies arrive in Messages.');
  const provider = await listedProvider(slug);
  if (viewer.id === provider.ownerId) throw badRequest('That is your own listing.');
  const thread = await transaction((tx) =>
    findOrCreateThread(tx, {
      kind: 'PROVIDER',
      subject: `Question · ${provider.name}`,
      providerId: provider.id,
      participants: [
        { userId: viewer.id, role: 'MEMBER' },
        { userId: provider.ownerId, role: 'PROVIDER' },
      ],
    }),
  );
  await sendMessage(viewer, thread.id, { text: question });
  return { threadId: thread.id };
}

export async function toggleFollow(viewer, { providerSlug, organizerSlug }) {
  if (providerSlug) {
    const provider = await prisma.provider.findUnique({ where: { slug: providerSlug }, select: { id: true, ownerId: true } });
    if (!provider) throw notFound();
    if (provider.ownerId === viewer.id) throw badRequest('You cannot follow your own listing.');
    const key = { followerId_providerId: { followerId: viewer.id, providerId: provider.id } };
    if (await prisma.follow.findUnique({ where: key })) {
      await prisma.follow.delete({ where: key });
      return { following: false };
    }
    await prisma.follow.create({ data: { followerId: viewer.id, providerId: provider.id } });
    return { following: true };
  }
  const organizer = await prisma.organizer.findUnique({ where: { slug: organizerSlug }, select: { id: true } });
  if (!organizer) throw notFound();
  const key = { followerId_organizerId: { followerId: viewer.id, organizerId: organizer.id } };
  return transaction(async (tx) => {
    if (await tx.follow.findUnique({ where: key })) {
      await tx.follow.delete({ where: key });
      await tx.organizer.update({ where: { id: organizer.id }, data: { followersCount: { decrement: 1 } } });
      return { following: false };
    }
    await tx.follow.create({ data: { followerId: viewer.id, organizerId: organizer.id } });
    await tx.organizer.update({ where: { id: organizer.id }, data: { followersCount: { increment: 1 } } });
    return { following: true };
  });
}

// ── Listing editor ────────────────────────────────────────────────────────

export async function saveListing(user, input) {
  const settings = await getSettings();
  const existing = await prisma.provider.findUnique({ where: { ownerId: user.id } });
  if (!existing && !settings.providerSignups) throw forbidden('New provider sign-ups are paused for a short while. Please try again later.');
  const country = COUNTRIES[input.country || existing?.country];
  if (!country) throw invalid('Choose a supported country.');

  return transaction(async (tx) => {
    const data = {
      name: input.name?.trim() ?? existing?.name,
      category: input.category ?? existing?.category,
      city: input.city?.trim() ?? existing?.city,
      country: input.country ?? existing?.country,
      headline: input.headline?.trim() ?? existing?.headline ?? '',
      description: input.description?.trim() ?? existing?.description ?? '',
      coverUrl: input.coverUrl ?? existing?.coverUrl ?? '',
      rateMinor: input.rateMinor === undefined ? existing?.rateMinor ?? null : input.rateMinor,
      rateCurrency: input.rateCurrency ?? existing?.rateCurrency ?? country.currency,
      rateUnit: input.rateUnit === undefined ? existing?.rateUnit ?? null : input.rateUnit,
      serviceAreas: input.serviceAreas ?? existing?.serviceAreas ?? [],
      yearsActive: input.yearsActive ?? existing?.yearsActive ?? null,
    };
    if (!data.name || !data.category || !data.city) throw invalid('Add your business name, category and city.');

    const provider = existing
      ? await tx.provider.update({ where: { id: existing.id }, data })
      : await tx.provider.create({ data: { ...data, ownerId: user.id, slug: await uniqueSlug(tx, 'provider', data.name) } });

    if (input.services) {
      await tx.providerService.deleteMany({ where: { providerId: provider.id } });
      await tx.providerService.createMany({
        data: input.services.map((service, index) => ({
          providerId: provider.id,
          title: service.title.trim(),
          description: service.description?.trim() || '',
          rateMinor: service.rateMinor ?? null,
          currency: provider.rateCurrency,
          rateUnit: service.rateUnit ?? null,
          sortOrder: index,
        })),
      });
    }
    if (input.media) {
      await tx.providerMedia.deleteMany({ where: { providerId: provider.id } });
      await tx.providerMedia.createMany({ data: input.media.map((item, index) => ({ providerId: provider.id, url: item.url, alt: item.alt || provider.name, sortOrder: index })) });
    }
    await audit(tx, { actorId: user.id, action: existing ? 'provider.updated' : 'provider.created', targetType: 'Provider', targetId: provider.id });
    return { id: provider.id, slug: provider.slug, status: provider.status };
  });
}

// ── Membership ────────────────────────────────────────────────────────────

export function membershipQuote(provider, now = new Date()) {
  const currency = FEES.membershipMinor[provider.rateCurrency] ? provider.rateCurrency : 'USD';
  const base = FEES.membershipMinor[currency];
  const daysLeft = provider.membershipEndsAt ? Math.ceil((provider.membershipEndsAt - now) / 86_400_000) : 0;
  const early = daysLeft > FEES.earlyRenewalWindowDays;
  const discount = early ? percentOf(base, FEES.earlyRenewalBps) : 0;
  return { currency, base, discount, amount: base - discount, early, daysLeft: Math.max(0, daysLeft) };
}

export async function renewMembership(user, { channel, code }) {
  const provider = await prisma.provider.findUnique({ where: { ownerId: user.id } });
  if (!provider) throw forbidden('Set up your provider listing first.');
  if (provider.status === 'SUSPENDED') throw forbidden('This listing is suspended.');
  const quote = membershipQuote(provider);

  if (channel === 'POINTS') {
    await requireStepUp(user, code);
    const rates = await getRates();
    const points = pointsFor(quote.amount, quote.currency, rates);
    await transaction(async (tx) => {
      const entryId = await post(tx, {
        kind: 'MEMBERSHIP',
        memo: `Provider membership · ${provider.name}`,
        reference: provider.id,
        actorId: user.id,
        meta: { points, early: quote.early },
        lines: [
          { account: accounts.wallet(user.id), amount: -points },
          { account: accounts.fx('PTS'), amount: points },
          { account: accounts.fx(quote.currency), amount: -quote.amount },
          { account: accounts.revenue(quote.currency), amount: quote.amount },
        ],
      });
      await extendMembership(tx, provider, quote, entryId);
    });
    return { status: 'ACTIVE', points };
  }

  const charge = await transaction((tx) =>
    createCharge(tx, {
      purpose: 'MEMBERSHIP',
      subjectId: provider.id,
      userId: user.id,
      email: user.email,
      amountMinor: quote.amount,
      currency: quote.currency,
      description: `Twendezetu provider membership — 12 months${quote.early ? ' (early renewal)' : ''}`,
      returnPath: '/provider-dashboard',
    }),
  );
  if (charge.mode === 'test') {
    const { completePayment } = await import('../payments/fulfil.js');
    await completePayment(charge.paymentId, { processorRef: null, meta: { test: true } });
    return { status: 'ACTIVE', mode: 'test' };
  }
  return { mode: 'stripe', redirectUrl: await openCheckout(charge) };
}

async function extendMembership(tx, provider, quote, journalEntryId) {
  const now = new Date();
  const start = provider.membershipEndsAt && provider.membershipEndsAt > now ? provider.membershipEndsAt : now;
  const end = new Date(start);
  end.setFullYear(end.getFullYear() + 1);
  await tx.membership.create({ data: { providerId: provider.id, startsAt: start, endsAt: end, amountMinor: quote.amount, currency: quote.currency, journalEntryId } });
  const firstMembership = !provider.membershipEndsAt;
  await tx.provider.update({
    where: { id: provider.id },
    data: { membershipEndsAt: end, ...(provider.status === 'DRAFT' ? { status: 'ACTIVE' } : {}) },
  });
  if (firstMembership) await awardReferral(tx, provider.ownerId, 'BECAME_PROVIDER');
  await notify(tx, {
    userId: provider.ownerId,
    topic: 'MONEY',
    title: firstMembership ? 'Your listing is live' : 'Membership renewed',
    body: `${formatMoney(quote.amount, quote.currency)} paid. Your listing is active until ${end.toDateString()}.`,
    href: '/provider-dashboard',
  });
  await audit(tx, { actorId: provider.ownerId, action: 'provider.membership_paid', targetType: 'Provider', targetId: provider.id, meta: { until: end } });
}

export async function activateMembershipFromPayment(tx, payment) {
  const provider = await tx.provider.findUnique({ where: { id: payment.subjectId } });
  if (!provider) throw new Error(`Provider ${payment.subjectId} missing for payment ${payment.id}`);
  const entryId = await post(tx, {
    kind: 'MEMBERSHIP',
    memo: `Provider membership · ${provider.name}`,
    reference: provider.id,
    idempotencyKey: `membership:${payment.id}`,
    meta: { paymentId: payment.id, test: payment.processor === 'MOCK' },
    lines: [
      { account: accounts.paymentClearing(payment.currency), amount: -payment.amountMinor },
      { account: accounts.revenue(payment.currency), amount: payment.amountMinor },
    ],
  });
  const quote = { amount: payment.amountMinor, currency: payment.currency };
  await extendMembership(tx, provider, quote, entryId);
  return 'fulfilled';
}

// ── Reviews ───────────────────────────────────────────────────────────────

// Reviews come only from completed bookings, which is what makes them worth
// reading. One review per booking.
export async function submitReview(user, slug, { rating, body, bookingId }) {
  const provider = await prisma.provider.findUnique({ where: { slug }, select: { id: true, ownerId: true, name: true, slug: true } });
  if (!provider) throw notFound();
  if (provider.ownerId === user.id) throw badRequest('You cannot review your own listing.');
  const booking = await prisma.booking.findFirst({
    where: { customerId: user.id, providerId: provider.id, status: 'RELEASED', review: null, ...(bookingId ? { id: bookingId } : {}) },
    orderBy: { releasedAt: 'desc' },
  });
  if (!booking) throw forbidden('Reviews come from completed bookings. Once a job you booked here is done, you can review it.');
  if (await prisma.review.findUnique({ where: { providerId_authorId: { providerId: provider.id, authorId: user.id } } })) {
    throw conflict('You have already reviewed this provider.', 'already_reviewed');
  }

  return transaction(async (tx) => {
    const review = await tx.review.create({
      data: { providerId: provider.id, authorId: user.id, bookingId: booking.id, rating, body: body.trim().slice(0, 1200), jobLabel: booking.title.slice(0, 60) },
      include: { author: { select: { name: true } } },
    });
    await tx.provider.update({ where: { id: provider.id }, data: { ratingSum: { increment: rating }, ratingCount: { increment: 1 } } });
    await notify(tx, {
      userId: provider.ownerId,
      topic: 'SOCIAL',
      title: `You received a ${rating}-star review`,
      body: `${shortName(user.name)}: “${review.body.slice(0, 140)}”`,
      href: `/providers/${provider.slug}`,
    });
    return reviewView(review);
  });
}

export async function replyToReview(user, reviewId, text) {
  const review = await prisma.review.findUnique({ where: { id: reviewId }, include: { provider: { select: { ownerId: true } } } });
  if (!review || review.provider.ownerId !== user.id) throw notFound();
  if (review.reply) throw conflict('You already replied to this review.', 'already_replied');
  await prisma.review.update({ where: { id: review.id }, data: { reply: String(text).trim().slice(0, 600), repliedAt: new Date() } });
  return { replied: true };
}

// ── Dashboard ─────────────────────────────────────────────────────────────

export async function providerDashboard(user) {
  const provider = await prisma.provider.findUnique({ where: { ownerId: user.id } });
  if (!provider) return null;
  const since30 = new Date(Date.now() - 30 * 86_400_000);
  const since60 = new Date(Date.now() - 60 * 86_400_000);
  const since56 = new Date(Date.now() - 56 * 86_400_000);

  const [leads, openOffers, awaiting, views30, viewsPrior, weekly, bookings, notifications, requests, prefs, owner] = await Promise.all([
    leadsForProvider(provider),
    prisma.offer.count({ where: { providerId: provider.id, status: { in: ['OPEN', 'COUNTERED'] } } }),
    prisma.offer.count({ where: { providerId: provider.id, status: 'OPEN' } }),
    prisma.providerStat.aggregate({ where: { providerId: provider.id, day: { gte: since30 } }, _sum: { views: true } }),
    prisma.providerStat.aggregate({ where: { providerId: provider.id, day: { gte: since60, lt: since30 } }, _sum: { views: true } }),
    prisma.providerStat.findMany({ where: { providerId: provider.id, day: { gte: since56 } }, select: { day: true, views: true } }),
    prisma.booking.findMany({
      where: { providerId: provider.id, status: { in: ['PENDING_PAYMENT', 'ESCROWED', 'RELEASED'] }, serviceStartsOn: { not: null } },
      select: { id: true, title: true, status: true, serviceStartsOn: true, serviceEndsOn: true, reference: true },
    }),
    prisma.notification.findMany({ where: { userId: user.id }, orderBy: { createdAt: 'desc' }, take: 5 }),
    prisma.serviceRequest.findMany({ where: { providerId: provider.id, status: 'NEW' }, orderBy: { createdAt: 'desc' }, take: 5 }),
    prisma.notificationPreference.findMany({ where: { userId: user.id } }),
    prisma.user.findUnique({ where: { id: user.id }, select: { weeklyDigest: true } }),
  ]);

  const views = views30._sum.views || 0;
  const prior = viewsPrior._sum.views || 0;
  const delta = prior ? Math.round(((views - prior) / prior) * 100) : null;

  const weeks = Array.from({ length: 8 }, () => 0);
  for (const row of weekly) {
    const index = 7 - Math.floor((Date.now() - row.day.getTime()) / (7 * 86_400_000));
    if (index >= 0 && index < 8) weeks[index] += row.views;
  }
  const maxWeek = Math.max(1, ...weeks);

  const quote = membershipQuote(provider);
  const membershipDaysTotal = 365;
  return {
    provider: { id: provider.id, slug: provider.slug, name: provider.name, status: provider.status, verified: Boolean(provider.verifiedAt), category: provider.category, city: provider.city },
    tiles: {
      newLeads: leads.filter((lead) => !lead.myOffer).length,
      activeOffers: openOffers,
      awaitingReply: awaiting,
      jobs: provider.jobsCompleted,
      rating: ratingLabel(provider),
      views,
      viewsDelta: delta,
    },
    leads,
    requests: requests.map((request) => ({ id: request.id, name: shortName(request.name), message: request.message, when: relativeTime(request.createdAt), threadId: request.threadId })),
    bookings: bookings.map((booking) => ({ ...booking, booked: booking.status !== 'PENDING_PAYMENT' })),
    weeklyViews: weeks.map((value, index) => ({ h: `${Math.max(4, Math.round((value / maxWeek) * 100))}%`, latest: index === 7, value })),
    notifications: notifications.map((item) => ({ body: item.title, time: relativeTime(item.createdAt), topic: item.topic, href: item.href })),
    membership: {
      endsAt: provider.membershipEndsAt,
      daysLeft: quote.daysLeft,
      pct: `${Math.min(100, Math.round((quote.daysLeft / membershipDaysTotal) * 100))}%`,
      price: formatMoney(quote.amount, quote.currency),
      early: quote.early,
      saving: quote.discount ? formatMoney(quote.discount, quote.currency) : null,
    },
    prefs: Object.fromEntries(prefs.map((pref) => [pref.topic, pref.inApp])),
    weeklyDigest: owner.weeklyDigest,
    initials: initials(provider.name),
  };
}
