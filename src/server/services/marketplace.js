// The needs board: someone posts what they need, providers in that city and
// category are told, offers arrive in masked threads, the poster accepts one
// and pays into escrow, and the provider is paid when the job is done.

import { prisma, transaction } from '../db.js';
import { audit } from '../audit.js';
import { badRequest, conflict, forbidden, invalid, notFound } from '../errors.js';
import { accounts, balanceOf, post } from '../ledger.js';
import { getRates } from '../fx.js';
import { ESCROW, FEES } from '../fees.js';
import { formatCompact, formatMoney, isCurrency, percentOf, pointsFor } from '../../shared/money.js';
import { createCharge, openCheckout } from '../payments/charges.js';
import { notify } from '../notify/index.js';
import { reference } from '../security/crypto.js';
import { COUNTRIES, PROVIDER_CATEGORIES, relativeTime, shortDate, shortName } from '../../shared/format.js';
import { awardReferral } from './referrals.js';
import { uniqueSlug } from './events.js';
import { requireStepUp } from './identity.js';
import { appendMessage, findOrCreateThread, NOTICES, notifyParticipants, sendMessage } from './threads.js';

// ── Needs ─────────────────────────────────────────────────────────────────

export function dateRange(startsOn, endsOn) {
  if (!startsOn) return null;
  const start = shortDate(startsOn, 'UTC');
  if (!endsOn || endsOn.getTime() === startsOn.getTime()) return titleCase(start);
  const end = shortDate(endsOn, 'UTC');
  const [startDay, startMonth] = start.split(' ');
  const [endDay, endMonth] = end.split(' ');
  return startMonth === endMonth ? `${startDay}–${endDay} ${titleCase(endMonth)}` : `${titleCase(start)} – ${titleCase(end)}`;
}

function titleCase(value) {
  return value.replace(/\b([A-Z])([A-Z]+)\b/g, (_m, first, rest) => first + rest.toLowerCase());
}

export function needCard(need, index = 0) {
  const parts = [need.city, dateRange(need.startsOn, need.endsOn), need.budgetMinor ? `budget ${formatCompact(need.budgetMinor, need.currency)}` : null];
  return {
    num: String(index + 1).padStart(2, '0'),
    slug: need.slug,
    title: need.title,
    meta: parts.filter(Boolean).join(' · '),
    offers: need.offerCount,
    category: PROVIDER_CATEGORIES[need.category]?.label,
  };
}

export async function openNeeds({ limit = 6, city, category } = {}) {
  const needs = await prisma.need.findMany({
    where: { status: 'OPEN', hiddenAt: null, ...(city ? { city } : {}), ...(category ? { category } : {}), OR: [{ closesAt: null }, { closesAt: { gt: new Date() } }] },
    orderBy: [{ offerCount: 'desc' }, { createdAt: 'desc' }],
    take: limit,
  });
  return needs.map(needCard);
}

export async function createNeed(user, input) {
  if (!COUNTRIES[input.country]) throw invalid('Choose a supported country.');
  const currency = input.currency || COUNTRIES[input.country].currency;
  if (!isCurrency(currency) || currency === 'PTS') throw invalid('Choose a supported currency.');
  const relatedEvent = input.relatedEventSlug
    ? await prisma.event.findUnique({ where: { slug: input.relatedEventSlug }, select: { id: true } })
    : null;

  const need = await transaction(async (tx) => {
    const firstPost = !(await tx.need.findFirst({ where: { posterId: user.id }, select: { id: true } }))
      && !(await tx.event.findFirst({ where: { createdById: user.id }, select: { id: true } }));
    const created = await tx.need.create({
      data: {
        slug: await uniqueSlug(tx, 'need', input.title),
        posterId: user.id,
        title: input.title.trim(),
        description: input.description.trim(),
        category: input.category,
        city: input.city.trim(),
        country: input.country,
        startsOn: input.startsOn ? new Date(input.startsOn) : null,
        endsOn: input.endsOn ? new Date(input.endsOn) : null,
        budgetMinor: input.budgetMinor ?? null,
        currency,
        relatedEventId: relatedEvent?.id || null,
        closesAt: input.closesAt ? new Date(input.closesAt) : null,
        revealContactsOnAccept: Boolean(input.revealContactsOnAccept),
        notifyOnOffers: input.notifyOnOffers !== false,
        weeklyDigest: Boolean(input.weeklyDigest),
        allowComments: Boolean(input.allowComments),
      },
    });
    if (firstPost) await awardReferral(tx, user.id, 'FIRST_POST');
    await audit(tx, { actorId: user.id, action: 'need.created', targetType: 'Need', targetId: created.id });

    // Tell matching providers. The cap keeps one post from turning into an
    // unbounded fan-out; providers are ordered by rating so the best hear first.
    const providers = await tx.provider.findMany({
      where: {
        status: 'ACTIVE',
        category: created.category,
        ownerId: { not: user.id },
        OR: [{ city: { equals: created.city, mode: 'insensitive' } }, { serviceAreas: { has: created.city } }],
      },
      orderBy: [{ ratingCount: 'desc' }],
      select: { ownerId: true },
      take: 200,
    });
    for (const provider of providers) {
      await notify(tx, {
        userId: provider.ownerId,
        topic: 'LEADS',
        title: `New matched need: ${created.title}`,
        body: needCard(created).meta,
        href: '/provider-dashboard',
        dedupeKey: `lead:${created.id}:${provider.ownerId}`,
      });
    }
    return { ...created, notified: providers.length };
  });
  return { slug: need.slug, id: need.id, notified: need.notified };
}

// Editing a need while it is still taking offers. Country and currency stay
// fixed (offers were priced in that currency). Providers with an offer on the
// table see a note in their thread; nobody else is re-notified.
export async function updateNeed(user, needId, input) {
  const need = await ownNeed(user, needId);
  if (!['OPEN', 'PAUSED'].includes(need.status)) throw badRequest('Only a need that is still taking offers can be edited.');
  if (input.country !== need.country || (input.currency && input.currency !== need.currency)) {
    throw badRequest('The country and currency are fixed once a need is posted, because offers were priced in them.');
  }
  const startsOn = input.startsOn ? new Date(input.startsOn) : null;
  const endsOn = input.endsOn ? new Date(input.endsOn) : null;
  if (startsOn && endsOn && endsOn < startsOn) throw invalid('The end date must be on or after the start date.');
  const closesAt = input.closesAt ? new Date(input.closesAt) : null;
  if (closesAt && closesAt < new Date()) throw invalid('The offer window must close in the future.');

  await transaction(async (tx) => {
    await tx.need.update({
      where: { id: need.id },
      data: {
        title: input.title.trim(),
        description: input.description.trim(),
        category: input.category,
        city: input.city.trim(),
        startsOn,
        endsOn,
        budgetMinor: input.budgetMinor ?? null,
        closesAt,
        revealContactsOnAccept: Boolean(input.revealContactsOnAccept),
        notifyOnOffers: input.notifyOnOffers !== false,
        weeklyDigest: Boolean(input.weeklyDigest),
      },
    });
    const live = await tx.offer.findMany({ where: { needId: need.id, status: { in: ['OPEN', 'COUNTERED'] } }, select: { threadId: true } });
    for (const { threadId } of live) {
      await appendMessage(tx, { threadId, kind: 'NOTICE', body: 'The poster updated the details of this need. Check them before the job, and revise your offer if it changes your price.' });
    }
    await audit(tx, { actorId: user.id, action: 'need.updated', targetType: 'Need', targetId: need.id });
  });
  return { id: need.id, slug: need.slug };
}

async function ownNeed(user, needId) {
  const need = await prisma.need.findUnique({ where: { id: needId } });
  if (!need) throw notFound();
  if (need.posterId !== user.id && !['ADMIN', 'MODERATOR'].includes(user.role)) throw forbidden();
  return need;
}

export async function needForEditing(user, needId) {
  const need = await prisma.need.findUnique({ where: { id: needId } });
  if (!need || (need.posterId !== user.id && !['ADMIN', 'MODERATOR'].includes(user.role))) return null;
  return need;
}

export async function setNeedStatus(user, needId, action, reason) {
  const need = await ownNeed(user, needId);
  const rules = {
    pause: { from: ['OPEN'], to: 'PAUSED' },
    resume: { from: ['PAUSED'], to: 'OPEN' },
    close: { from: ['OPEN', 'PAUSED'], to: 'CLOSED' },
  };
  const rule = rules[action];
  if (!rule) throw badRequest('Unknown action.');
  if (!rule.from.includes(need.status)) throw badRequest(`This need is ${need.status.toLowerCase()}.`);
  await transaction(async (tx) => {
    await tx.need.update({ where: { id: need.id }, data: { status: rule.to, ...(action === 'close' ? { closedReason: reason?.slice(0, 200) || null } : {}) } });
    if (action === 'close') {
      const open = await tx.offer.findMany({ where: { needId: need.id, status: { in: ['OPEN', 'COUNTERED'] } }, include: { provider: { select: { ownerId: true } } } });
      await tx.offer.updateMany({ where: { needId: need.id, status: { in: ['OPEN', 'COUNTERED'] } }, data: { status: 'DECLINED', respondedAt: new Date() } });
      for (const offer of open) {
        await notify(tx, { userId: offer.provider.ownerId, topic: 'OFFERS', title: `${need.title} was closed`, body: reason ? `The poster closed this need: ${reason}` : 'The poster closed this need without accepting an offer.', href: '/provider-dashboard' });
      }
    }
    await audit(tx, { actorId: user.id, action: `need.${action}`, targetType: 'Need', targetId: need.id, meta: { reason } });
  });
  return { status: rule.to };
}

export async function leadsForProvider(provider, { limit = 12 } = {}) {
  const cities = [provider.city, ...(provider.serviceAreas || [])];
  const needs = await prisma.need.findMany({
    where: {
      status: 'OPEN',
      hiddenAt: null,
      category: provider.category,
      posterId: { not: provider.ownerId },
      OR: cities.map((city) => ({ city: { equals: city, mode: 'insensitive' } })),
    },
    include: {
      offers: { where: { providerId: provider.id }, select: { id: true, status: true, priceMinor: true, currency: true, threadId: true } },
      poster: { select: { country: true } },
    },
    orderBy: { createdAt: 'desc' },
    take: limit,
  });
  return needs.map((need) => {
    const mine = need.offers[0];
    const posterCountry = need.poster.country && need.poster.country !== need.country ? COUNTRIES[need.poster.country]?.name : null;
    return {
      id: need.id,
      title: need.title,
      hot: Date.now() - need.createdAt.getTime() < 24 * 3600 * 1000,
      meta: [need.city, dateRange(need.startsOn, need.endsOn), posterCountry ? `POSTED FROM ${posterCountry}` : relativeTime(need.createdAt)]
        .filter(Boolean).join(' · ').toUpperCase(),
      body: need.description,
      budget: need.budgetMinor ? formatCompact(need.budgetMinor, need.currency) : 'Open budget',
      budgetMinor: need.budgetMinor,
      currency: need.currency,
      offers: need.offerCount,
      myOffer: mine ? { status: mine.status, price: formatMoney(mine.priceMinor, mine.currency), threadId: mine.threadId } : null,
    };
  });
}

// ── Offers ────────────────────────────────────────────────────────────────

async function activeProviderFor(user) {
  const provider = await prisma.provider.findUnique({ where: { ownerId: user.id } });
  if (!provider) throw forbidden('Set up your provider listing first.');
  if (provider.status !== 'ACTIVE') throw forbidden('Your listing needs an active membership before you can send offers.');
  return provider;
}

async function uniqueReference(tx, model, prefix) {
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const candidate = reference(prefix, 6);
    if (!(await tx[model].findUnique({ where: { reference: candidate }, select: { id: true } }))) return candidate;
  }
  throw new Error(`Could not allocate a ${prefix} reference.`);
}

export async function submitOffer(user, needId, { priceMinor, title, note }) {
  const provider = await activeProviderFor(user);
  const need = await prisma.need.findUnique({ where: { id: needId } });
  if (!need || need.hiddenAt) throw notFound('That need is no longer on the board.');
  if (need.status !== 'OPEN') throw badRequest('This need is not taking offers right now.');
  if (need.posterId === user.id) throw badRequest('You cannot make an offer on your own need.');
  if (!Number.isInteger(priceMinor) || priceMinor <= 0) throw invalid('Enter your price.');

  return transaction(async (tx) => {
    const thread = await findOrCreateThread(tx, {
      kind: 'NEED',
      subject: `RE: ${need.title}`,
      needId: need.id,
      providerId: provider.id,
      participants: [
        { userId: need.posterId, role: 'POSTER' },
        { userId: user.id, role: 'PROVIDER' },
      ],
    });
    const offer = await tx.offer.create({
      data: {
        reference: await uniqueReference(tx, 'offer', 'OF'),
        needId: need.id,
        providerId: provider.id,
        threadId: thread.id,
        title: (title || need.title).trim().slice(0, 120),
        note: (note || '').trim().slice(0, 600),
        priceMinor,
        currency: need.currency,
      },
    });
    const isFirstMessage = !(await tx.message.findFirst({ where: { threadId: thread.id }, select: { id: true } }));
    await appendMessage(tx, { threadId: thread.id, senderId: user.id, kind: 'OFFER', body: `Formal offer: ${formatMoney(priceMinor, need.currency)} · ${offer.title}`, offerId: offer.id });
    if (isFirstMessage && !need.revealContactsOnAccept) await appendMessage(tx, { threadId: thread.id, kind: 'NOTICE', body: NOTICES.masked });
    await tx.need.update({ where: { id: need.id }, data: { offerCount: { increment: 1 } } });
    if (need.notifyOnOffers) {
      await notify(tx, {
        userId: need.posterId,
        topic: 'OFFERS',
        title: `New offer on ${need.title}`,
        body: `${provider.name}: ${formatMoney(priceMinor, need.currency)} · ${offer.title}`,
        href: `/messages?thread=${thread.id}`,
      });
    }
    await audit(tx, { actorId: user.id, action: 'offer.submitted', targetType: 'Offer', targetId: offer.id });
    return { offerId: offer.id, threadId: thread.id, reference: offer.reference };
  });
}

export async function askOnNeed(user, needId, question) {
  const provider = await activeProviderFor(user);
  const need = await prisma.need.findUnique({ where: { id: needId } });
  if (!need || need.status !== 'OPEN') throw notFound('That need is no longer on the board.');
  if (need.posterId === user.id) throw badRequest('That is your own need.');
  const thread = await transaction((tx) =>
    findOrCreateThread(tx, {
      kind: 'NEED',
      subject: `RE: ${need.title}`,
      needId: need.id,
      providerId: provider.id,
      participants: [
        { userId: need.posterId, role: 'POSTER' },
        { userId: user.id, role: 'PROVIDER' },
      ],
    }),
  );
  await sendMessage(user, thread.id, { text: question });
  return { threadId: thread.id };
}

async function offerForPoster(user, offerId) {
  const offer = await prisma.offer.findUnique({
    where: { id: offerId },
    include: { need: true, provider: { select: { id: true, name: true, ownerId: true } }, thread: true },
  });
  if (!offer || !offer.need) throw notFound();
  if (offer.need.posterId !== user.id) throw forbidden();
  return offer;
}

export async function acceptOffer(user, offerId) {
  const offer = await offerForPoster(user, offerId);
  if (!['OPEN', 'COUNTERED'].includes(offer.status)) throw conflict('This offer is no longer open.', 'offer_closed');
  if (!['OPEN', 'PAUSED'].includes(offer.need.status)) throw conflict('You already accepted an offer on this need.', 'need_closed');

  return transaction(async (tx) => {
    const claimed = await tx.offer.updateMany({ where: { id: offer.id, status: { in: ['OPEN', 'COUNTERED'] } }, data: { status: 'ACCEPTED', respondedAt: new Date() } });
    if (!claimed.count) throw conflict('This offer is no longer open.', 'offer_closed');
    const needClaimed = await tx.need.updateMany({ where: { id: offer.need.id, status: { in: ['OPEN', 'PAUSED'] } }, data: { status: 'ACCEPTED' } });
    if (!needClaimed.count) throw conflict('You already accepted an offer on this need.', 'need_closed');

    const others = await tx.offer.findMany({
      where: { needId: offer.need.id, id: { not: offer.id }, status: { in: ['OPEN', 'COUNTERED'] } },
      include: { provider: { select: { ownerId: true } } },
    });
    await tx.offer.updateMany({ where: { id: { in: others.map((other) => other.id) } }, data: { status: 'DECLINED', respondedAt: new Date() } });
    for (const other of others) {
      await notify(tx, { userId: other.provider.ownerId, topic: 'OFFERS', title: `${offer.need.title}: another offer was chosen`, body: 'Thank you for offering. Keep an eye on your leads for the next one.', href: '/provider-dashboard' });
    }

    const booking = await tx.booking.create({
      data: {
        reference: await uniqueReference(tx, 'booking', 'BK'),
        offerId: offer.id,
        needId: offer.need.id,
        customerId: user.id,
        providerId: offer.provider.id,
        threadId: offer.threadId,
        title: offer.need.title,
        serviceStartsOn: offer.need.startsOn,
        serviceEndsOn: offer.need.endsOn,
        amountMinor: offer.priceMinor,
        currency: offer.currency,
        feeBps: FEES.bookingCommissionBps,
        feeMinor: percentOf(offer.priceMinor, FEES.bookingCommissionBps),
      },
    });

    const reveal = offer.need.revealContactsOnAccept;
    if (reveal) await tx.thread.update({ where: { id: offer.threadId }, data: { contactsRevealedAt: new Date() } });
    await appendMessage(tx, {
      threadId: offer.threadId,
      kind: 'NOTICE',
      body: `Offer ${offer.reference} accepted. Booking ${booking.reference} is waiting for payment into escrow.${reveal ? ` ${NOTICES.revealed}` : ''}`,
    });
    await notify(tx, {
      userId: offer.provider.ownerId,
      topic: 'OFFERS',
      title: `Offer accepted: ${offer.need.title}`,
      body: `${shortName(user.name)} accepted ${formatMoney(offer.priceMinor, offer.currency)}. You will be told when the money is in escrow.`,
      href: `/messages?thread=${offer.threadId}`,
    });
    await audit(tx, { actorId: user.id, action: 'offer.accepted', targetType: 'Offer', targetId: offer.id, meta: { bookingId: booking.id } });
    return { bookingId: booking.id, reference: booking.reference, amount: formatMoney(booking.amountMinor, booking.currency) };
  });
}

export async function counterOffer(user, offerId, text) {
  const offer = await offerForPoster(user, offerId);
  if (offer.status !== 'OPEN') throw conflict('You can only counter an open offer.', 'offer_closed');
  const note = String(text || '').trim().slice(0, 300);
  if (!note) throw invalid('Say what you would accept.');
  await transaction(async (tx) => {
    await tx.offer.update({ where: { id: offer.id }, data: { status: 'COUNTERED', counterNote: note, respondedAt: new Date() } });
    await appendMessage(tx, { threadId: offer.threadId, senderId: user.id, body: `Counter-offer: ${note}` });
    await notifyParticipants(tx, offer.thread, user.id, { title: `Counter-offer on ${offer.need.title}`, body: note });
  });
  return { status: 'COUNTERED' };
}

export async function declineOffer(user, offerId) {
  const offer = await offerForPoster(user, offerId);
  if (!['OPEN', 'COUNTERED'].includes(offer.status)) throw conflict('This offer is no longer open.', 'offer_closed');
  await transaction(async (tx) => {
    await tx.offer.update({ where: { id: offer.id }, data: { status: 'DECLINED', respondedAt: new Date() } });
    await appendMessage(tx, { threadId: offer.threadId, kind: 'NOTICE', body: `Offer ${offer.reference} was declined.` });
    await notify(tx, { userId: offer.provider.ownerId, topic: 'OFFERS', title: `Offer declined: ${offer.need.title}`, body: 'The poster declined this offer.', href: `/messages?thread=${offer.threadId}` });
  });
  return { status: 'DECLINED' };
}

// The provider answers a counter (or updates an open offer) with a new price.
export async function reviseOffer(user, offerId, { priceMinor, note }) {
  const offer = await prisma.offer.findUnique({ where: { id: offerId }, include: { provider: true, need: true, thread: true } });
  if (!offer || offer.provider.ownerId !== user.id) throw notFound();
  if (!['OPEN', 'COUNTERED'].includes(offer.status)) throw conflict('This offer is closed.', 'offer_closed');
  if (!Number.isInteger(priceMinor) || priceMinor <= 0) throw invalid('Enter your price.');
  await transaction(async (tx) => {
    await tx.offer.update({ where: { id: offer.id }, data: { priceMinor, note: note ? note.slice(0, 600) : offer.note, status: 'OPEN', counterNote: null } });
    await appendMessage(tx, { threadId: offer.threadId, senderId: user.id, kind: 'OFFER', offerId: offer.id, body: `Revised offer: ${formatMoney(priceMinor, offer.currency)} · ${offer.title}` });
    await notifyParticipants(tx, offer.thread, user.id, { title: `Revised offer on ${offer.need?.title || offer.title}`, body: `${offer.provider.name}: ${formatMoney(priceMinor, offer.currency)}` });
  });
  return { status: 'OPEN' };
}

export async function withdrawOffer(user, offerId) {
  const offer = await prisma.offer.findUnique({ where: { id: offerId }, include: { provider: true, need: true } });
  if (!offer || offer.provider.ownerId !== user.id) throw notFound();
  if (!['OPEN', 'COUNTERED'].includes(offer.status)) throw conflict('This offer is closed.', 'offer_closed');
  await transaction(async (tx) => {
    await tx.offer.update({ where: { id: offer.id }, data: { status: 'WITHDRAWN' } });
    await appendMessage(tx, { threadId: offer.threadId, kind: 'NOTICE', body: `${offer.provider.name} withdrew offer ${offer.reference}.` });
    if (offer.needId) await tx.need.update({ where: { id: offer.needId }, data: { offerCount: { decrement: 1 } } });
  });
  return { status: 'WITHDRAWN' };
}

// ── Bookings & escrow ─────────────────────────────────────────────────────

async function bookingForCustomer(user, bookingId) {
  const booking = await prisma.booking.findUnique({ where: { id: bookingId }, include: { provider: { select: { id: true, name: true, ownerId: true } } } });
  if (!booking) throw notFound();
  if (booking.customerId !== user.id) throw forbidden();
  return booking;
}

function releaseTime(booking) {
  const serviceEnd = booking.serviceEndsOn || booking.serviceStartsOn;
  const base = serviceEnd ? new Date(serviceEnd.getTime() + 24 * 3600 * 1000) : new Date();
  return new Date(Math.max(base.getTime(), Date.now()) + ESCROW.bookingReleaseDelayHours * 3600 * 1000);
}

async function markEscrowed(tx, booking, sourceLines, meta) {
  await post(tx, {
    kind: 'BOOKING_ESCROW',
    memo: `Escrow: ${booking.title} · ${booking.provider.name}`,
    reference: booking.id,
    idempotencyKey: `booking:${booking.id}:escrow`,
    actorId: booking.customerId,
    meta: { bookingReference: booking.reference, ...meta },
    lines: [...sourceLines, { account: accounts.bookingEscrow(booking.id, booking.currency), amount: booking.amountMinor }],
  });
  await tx.booking.update({ where: { id: booking.id }, data: { status: 'ESCROWED', escrowedAt: new Date(), releaseAfter: releaseTime(booking) } });
  if (booking.threadId) {
    await appendMessage(tx, { threadId: booking.threadId, kind: 'NOTICE', body: `${formatMoney(booking.amountMinor, booking.currency)} is held in escrow for booking ${booking.reference}. It is released to the provider after the job.` });
  }
  await notify(tx, {
    userId: booking.provider.ownerId,
    topic: 'MONEY',
    title: `Escrow funded: ${booking.title}`,
    body: `${formatMoney(booking.amountMinor, booking.currency)} is held for booking ${booking.reference}. You are paid after the job is done.`,
    href: '/provider-wallet',
  });
}

export async function payBooking(user, bookingId, { channel, code }) {
  const booking = await bookingForCustomer(user, bookingId);
  if (booking.status !== 'PENDING_PAYMENT') throw conflict('This booking is already paid.', 'already_paid');

  if (channel === 'POINTS') {
    await requireStepUp(user, code);
    const rates = await getRates();
    const points = pointsFor(booking.amountMinor, booking.currency, rates);
    await transaction(async (tx) => {
      await lockUnpaidBooking(tx, booking.id);
      await markEscrowed(tx, booking, [
        { account: accounts.wallet(user.id), amount: -points },
        { account: accounts.fx('PTS'), amount: points },
        { account: accounts.fx(booking.currency), amount: -booking.amountMinor },
      ], { points, channel: 'POINTS' });
    });
    return { status: 'ESCROWED', points };
  }

  if (channel !== 'CARD') throw badRequest('Pay with points or card.');
  const charge = await transaction((tx) =>
    createCharge(tx, {
      purpose: 'BOOKING',
      subjectId: booking.id,
      userId: user.id,
      email: user.email,
      amountMinor: booking.amountMinor,
      currency: booking.currency,
      description: `${booking.title} — ${booking.provider.name} (${booking.reference})`,
      returnPath: `/messages?thread=${booking.threadId}`,
    }),
  );
  if (charge.mode === 'test') {
    const { completePayment } = await import('../payments/fulfil.js');
    await completePayment(charge.paymentId, { processorRef: null, meta: { test: true } });
    return { status: 'ESCROWED', mode: 'test' };
  }
  return { status: 'PENDING_PAYMENT', mode: 'stripe', redirectUrl: await openCheckout(charge) };
}

// Row lock so two payments for the same booking serialise; the second one
// finds the booking already paid.
async function lockUnpaidBooking(tx, bookingId) {
  const rows = await tx.$queryRaw`SELECT "id" FROM "Booking" WHERE "id" = ${bookingId} AND "status" = 'PENDING_PAYMENT' FOR UPDATE`;
  if (!rows.length) throw conflict('This booking is already paid.', 'already_paid');
}

// Returns 'fulfilled', or 'duplicate' when the booking was already paid by
// another payment (the caller refunds this one).
export async function fundBookingFromPayment(tx, payment) {
  const booking = await tx.booking.findUnique({ where: { id: payment.subjectId }, include: { provider: { select: { id: true, name: true, ownerId: true } } } });
  if (!booking) throw new Error(`Booking ${payment.subjectId} missing for payment ${payment.id}`);
  const locked = await tx.$queryRaw`SELECT "id" FROM "Booking" WHERE "id" = ${booking.id} AND "status" = 'PENDING_PAYMENT' FOR UPDATE`;
  if (!locked.length) return 'duplicate';
  await markEscrowed(tx, booking, [{ account: accounts.paymentClearing(booking.currency), amount: -booking.amountMinor }], { paymentId: payment.id, channel: 'CARD' });
  return 'fulfilled';
}

// Pays the provider: escrow → provider earnings, less the commission.
export async function releaseBooking(tx, bookingId, actorId, why) {
  const booking = await tx.booking.findUnique({ where: { id: bookingId }, include: { provider: { select: { id: true, name: true, ownerId: true } } } });
  if (!booking || booking.status !== 'ESCROWED') return false;
  const liveDispute = await tx.dispute.findFirst({ where: { bookingId, status: { in: ['OPEN', 'ESCALATED'] } }, select: { id: true } });
  if (liveDispute) return false;

  // Pay out what is actually in escrow: normally the full booking amount,
  // less after a partial refund.
  const gross = await balanceOf(tx, accounts.bookingEscrow(booking.id, booking.currency));
  const fee = percentOf(gross, booking.feeBps);
  if (gross > 0) {
    await post(tx, {
      kind: 'ESCROW_RELEASE',
      memo: `Job payout: ${booking.title} (${booking.reference})`,
      reference: booking.id,
      idempotencyKey: `booking:${booking.id}:release`,
      actorId,
      meta: { bookingReference: booking.reference, gross, fee, why },
      lines: [
        { account: accounts.bookingEscrow(booking.id, booking.currency), amount: -gross },
        { account: accounts.earnings(booking.provider.ownerId, booking.currency), amount: gross - fee },
        { account: accounts.revenue(booking.currency), amount: fee },
      ],
    });
  }
  await tx.booking.update({ where: { id: booking.id }, data: { status: 'RELEASED', releasedAt: new Date() } });
  await tx.provider.update({ where: { id: booking.providerId }, data: { jobsCompleted: { increment: 1 } } });
  if (booking.needId) await tx.need.update({ where: { id: booking.needId }, data: { status: 'COMPLETED' } });
  await notify(tx, {
    userId: booking.provider.ownerId,
    topic: 'MONEY',
    title: `Payout released: ${booking.title}`,
    body: `${formatMoney(gross - fee, booking.currency)} is in your balance (gross ${formatMoney(gross, booking.currency)}, fee ${formatMoney(fee, booking.currency)}).`,
    href: '/provider-wallet',
  });
  await audit(tx, { actorId, action: 'booking.released', targetType: 'Booking', targetId: booking.id, meta: { why } });
  return true;
}

export async function confirmBookingDone(user, bookingId) {
  const booking = await bookingForCustomer(user, bookingId);
  if (booking.status !== 'ESCROWED') throw conflict('This booking is not waiting on you.', 'not_escrowed');
  const released = await transaction((tx) => releaseBooking(tx, booking.id, user.id, 'confirmed by customer'));
  if (!released) throw conflict('This booking has an open dispute. The resolution team will release or refund it.', 'disputed');
  return { status: 'RELEASED' };
}

export async function cancelUnpaidBooking(user, bookingId) {
  const booking = await prisma.booking.findUnique({ where: { id: bookingId }, include: { provider: true, offer: true } });
  if (!booking) throw notFound();
  if (booking.customerId !== user.id && booking.provider.ownerId !== user.id) throw forbidden();
  if (booking.status !== 'PENDING_PAYMENT') throw conflict('Paid bookings are cancelled through a dispute so the escrow is handled fairly.', 'paid');
  await transaction(async (tx) => {
    await tx.booking.update({ where: { id: booking.id }, data: { status: 'CANCELLED', cancelledAt: new Date() } });
    if (booking.needId) await tx.need.update({ where: { id: booking.needId }, data: { status: 'OPEN' } });
    if (booking.offerId) await tx.offer.update({ where: { id: booking.offerId }, data: { status: 'WITHDRAWN' } });
    if (booking.threadId) await appendMessage(tx, { threadId: booking.threadId, kind: 'NOTICE', body: `Booking ${booking.reference} was cancelled before payment.` });
  });
  return { status: 'CANCELLED' };
}

export async function releaseDueBookings() {
  const due = await prisma.booking.findMany({ where: { status: 'ESCROWED', releaseAfter: { lt: new Date() } }, select: { id: true }, take: 100 });
  let released = 0;
  for (const { id } of due) {
    if (await transaction((tx) => releaseBooking(tx, id, null, 'automatic release after the job'))) released += 1;
  }
  return released;
}

