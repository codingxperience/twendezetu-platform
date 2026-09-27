// Events: the public guide, event pages, posting and managing events,
// traffic attribution and calendar files.

import { prisma, transaction } from '../db.js';
import { audit } from '../audit.js';
import { badRequest, forbidden, invalid, notFound } from '../errors.js';
import { checkRateLimit } from '../security/rate-limit.js';
import { config } from '../config.js';
import { notify, notifyGuest } from '../notify/index.js';
import { awardReferral } from './referrals.js';
import { rescheduleEventReminders } from './rsvps.js';
import { COUNTRIES, EVENT_CATEGORIES, dayLabel, priceLabel, slugify, timeLabel } from '../../shared/format.js';
import { isCurrency } from '../../shared/money.js';

const PUBLIC_EVENT = { status: 'PUBLISHED', hiddenAt: null };

// Events stay on the guide until six hours after they start (or until they
// end, when an end time is known).
function stillOn(now = new Date()) {
  const cutoff = new Date(now.getTime() - 6 * 3600 * 1000);
  return { OR: [{ endsAt: { gte: now } }, { endsAt: null, startsAt: { gte: cutoff } }] };
}

const CARD_INCLUDE = {
  organizer: { select: { id: true, name: true, slug: true } },
  tiers: { where: { active: true, kind: 'ONLINE' }, select: { priceMinor: true } },
};

export function toEventCard(event) {
  const paidTiers = (event.tiers || []).filter((tier) => tier.priceMinor > 0);
  return {
    id: event.id,
    slug: event.slug,
    href: `/events/${event.slug}`,
    cat: EVENT_CATEGORIES[event.category],
    category: event.category,
    img: event.coverUrl,
    title: event.title,
    city: event.city,
    venue: event.venue,
    date: dayLabel(event.startsAt, event.timezone),
    time: timeLabel(event.startsAt, event.timezone),
    startsAt: event.startsAt.toISOString(),
    price: priceLabel({ isFree: event.isFree, priceFromMinor: event.priceFromMinor, currency: event.currency, tierCount: paidTiers.length }),
    going: event.goingCount,
    badge: event.badge || false,
    organizer: event.organizer?.name || '',
    organizerSlug: event.organizer?.slug || null,
    blurb: event.blurb,
    description: event.description,
    isFree: event.isFree,
    priceFromMinor: event.priceFromMinor,
    currency: event.currency,
    tierCount: paidTiers.length,
    featured: event.featuredRank != null,
    status: event.status,
  };
}

export async function listGuideEvents({ category, city, q, limit = 60 } = {}) {
  const where = { ...PUBLIC_EVENT, ...stillOn(), ...(category ? { category } : {}), ...(city ? { city: { contains: city, mode: 'insensitive' } } : {}) };

  if (q) {
    const ids = await searchEventIds(q, 200);
    where.id = { in: ids };
  }

  const events = await prisma.event.findMany({
    where,
    include: CARD_INCLUDE,
    orderBy: [{ featuredRank: { sort: 'asc', nulls: 'last' } }, { startsAt: 'asc' }],
    take: Math.min(Math.max(limit, 1), 200),
  });
  return events.map(toEventCard);
}

// Prefix-matching full-text search over title, blurb, city and venue, using
// the GIN index from the platform migration.
async function searchEventIds(q, take) {
  const terms = String(q)
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 6);
  if (!terms.length) return [];
  const tsquery = terms.map((term) => `${term}:*`).join(' & ');
  const rows = await prisma.$queryRaw`
    SELECT "id" FROM "Event"
     WHERE app_private.search_document("title", "blurb", "city", "venue") @@ to_tsquery('simple', ${tsquery})
       AND "status" = 'PUBLISHED' AND "hiddenAt" IS NULL
     LIMIT ${take}`;
  return rows.map((row) => row.id);
}

export async function categoryCounts() {
  const rows = await prisma.event.groupBy({ by: ['category'], where: { ...PUBLIC_EVENT, ...stillOn() }, _count: { _all: true } });
  return Object.fromEntries(rows.map((row) => [row.category, row._count._all]));
}

export async function getEventPage(slug, viewer) {
  const event = await prisma.event.findUnique({
    where: { slug },
    include: {
      organizer: { select: { id: true, name: true, slug: true, ownerId: true, verifiedAt: true } },
      tiers: { where: { active: true }, orderBy: { sortOrder: 'asc' } },
      schedule: { orderBy: { sortOrder: 'asc' } },
    },
  });
  if (!event) return null;
  const isOwner = viewer && (viewer.id === event.createdById || viewer.id === event.organizer.ownerId);
  const isStaff = viewer && ['ADMIN', 'MODERATOR'].includes(viewer.role);
  const visible = (event.status === 'PUBLISHED' || event.status === 'CANCELLED') && !event.hiddenAt;
  if (!visible && !isOwner && !isStaff) return null;
  return { event, isOwner: Boolean(isOwner) };
}

export async function similarEvents(event, take = 8) {
  const events = await prisma.event.findMany({
    where: { ...PUBLIC_EVENT, ...stillOn(), category: event.category, id: { not: event.id } },
    include: CARD_INCLUDE,
    orderBy: { startsAt: 'asc' },
    take,
  });
  return events.map(toEventCard);
}

// ── Posting and managing ──────────────────────────────────────────────────

export async function uniqueSlug(db, model, title) {
  const base = slugify(title);
  for (let attempt = 0; attempt < 8; attempt += 1) {
    const candidate = attempt === 0 ? base : `${base}-${attempt + 1}`;
    const taken = await db[model].findUnique({ where: { slug: candidate }, select: { id: true } });
    if (!taken) return candidate;
  }
  return `${base}-${Date.now().toString(36)}`;
}

async function organizerFor(tx, user, organizerName) {
  const name = (organizerName || user.name).trim();
  const existing = await tx.organizer.findFirst({ where: { ownerId: user.id, name } });
  if (existing) return existing;
  return tx.organizer.create({
    data: { ownerId: user.id, name, slug: await uniqueSlug(tx, 'organizer', name), city: user.city },
  });
}

export async function createEvent(user, input) {
  const country = COUNTRIES[input.country];
  if (!country) throw invalid('Choose a supported country.');
  const currency = input.currency || country.currency;
  if (!isCurrency(currency) || currency === 'PTS') throw invalid('Choose a supported currency.');
  const startsAt = new Date(input.startsAt);
  if (Number.isNaN(startsAt.getTime()) || startsAt < new Date()) throw invalid('Pick a start time in the future.');
  const endsAt = input.endsAt ? new Date(input.endsAt) : null;
  if (endsAt && endsAt <= startsAt) throw invalid('The end time must be after the start.');

  const tiers = input.isFree ? [] : input.tiers || [];
  if (!input.isFree && !tiers.length) throw invalid('Add at least one ticket tier, or make the event free.');

  return transaction(async (tx) => {
    const organizer = await organizerFor(tx, user, input.organizerName);
    const firstPost = !(await tx.event.findFirst({ where: { createdById: user.id }, select: { id: true } }))
      && !(await tx.need.findFirst({ where: { posterId: user.id }, select: { id: true } }));

    const paidPrices = tiers.map((tier) => tier.priceMinor).filter((price) => price > 0);
    const event = await tx.event.create({
      data: {
        slug: await uniqueSlug(tx, 'event', input.title),
        organizerId: organizer.id,
        createdById: user.id,
        title: input.title.trim(),
        category: input.category,
        blurb: input.blurb.trim(),
        description: input.description.trim(),
        coverUrl: input.coverUrl,
        venue: input.venue.trim(),
        city: input.city.trim(),
        country: input.country,
        timezone: input.timezone || country.timezone,
        startsAt,
        endsAt,
        currency,
        isFree: Boolean(input.isFree),
        priceFromMinor: paidPrices.length ? Math.min(...paidPrices) : null,
        capacity: input.capacity ?? null,
        allowComments: Boolean(input.allowComments),
        allowGuestRsvp: input.allowGuestRsvp !== false,
        status: input.publish ? 'PUBLISHED' : 'DRAFT',
        publishedAt: input.publish ? new Date() : null,
        badge: 'NEW',
        tiers: {
          create: tiers.map((tier, index) => ({
            name: tier.name.trim(),
            description: tier.description?.trim() || '',
            priceMinor: tier.priceMinor,
            currency,
            capacity: tier.capacity ?? null,
            sortOrder: index,
            kind: 'ONLINE',
          })),
        },
        schedule: {
          create: (input.schedule || []).map((item, index) => ({ ...item, sortOrder: index })),
        },
      },
      select: { id: true, slug: true, status: true },
    });

    if (firstPost) await awardReferral(tx, user.id, 'FIRST_POST');
    await audit(tx, { actorId: user.id, action: 'event.created', targetType: 'Event', targetId: event.id });
    return event;
  });
}

// Editing a posted event. The link (slug), country and currency stay fixed:
// orders, escrow and shared links depend on them. Once anyone holds a ticket
// the event cannot switch between free and ticketed, and no tier can shrink
// below what it has sold. When the time or place changes, everyone going is
// told and their reminders move with it.
export async function updateEvent(user, eventId, input) {
  const current = await prisma.event.findUnique({
    where: { id: eventId },
    include: { tiers: true, organizer: { select: { ownerId: true } }, _count: { select: { orders: { where: { status: { in: ['PENDING', 'PAID', 'RESERVED'] } } } } } },
  });
  if (!current) throw notFound();
  const staff = ['ADMIN', 'MODERATOR'].includes(user.role);
  if (current.createdById !== user.id && current.organizer.ownerId !== user.id && !staff) throw forbidden();
  if (['CANCELLED', 'ARCHIVED'].includes(current.status)) throw badRequest('This event was cancelled, so it can no longer be edited.');
  if ((current.endsAt || current.startsAt) < new Date()) throw badRequest('This event has already happened.');
  if (input.country !== current.country || (input.currency && input.currency !== current.currency)) {
    throw badRequest('The country and currency are fixed once an event is posted. Post a new event for a different country.');
  }

  const startsAt = new Date(input.startsAt);
  if (Number.isNaN(startsAt.getTime())) throw invalid('Pick a start time.');
  if (startsAt.getTime() !== current.startsAt.getTime() && startsAt < new Date()) throw invalid('Pick a start time in the future.');
  const endsAt = input.endsAt ? new Date(input.endsAt) : null;
  if (endsAt && endsAt <= startsAt) throw invalid('The end time must be after the start.');
  const hasOrders = current._count.orders > 0;
  if (Boolean(input.isFree) !== current.isFree && hasOrders) {
    throw badRequest('People already hold tickets, so the event cannot switch between free and ticketed.');
  }
  if (input.capacity != null && input.capacity < current.goingCount) throw invalid(`${current.goingCount} people are already going, so capacity cannot go below that.`);

  const online = current.tiers.filter((tier) => tier.kind === 'ONLINE');
  const byId = new Map(online.map((tier) => [tier.id, tier]));
  const incoming = input.isFree ? [] : input.tiers || [];
  for (const tier of incoming) {
    if (tier.id && !byId.has(tier.id)) throw badRequest('One of those ticket tiers does not belong to this event.');
    const existing = tier.id && byId.get(tier.id);
    if (existing && tier.capacity != null && tier.capacity < existing.sold) throw invalid(`${existing.name} has already sold ${existing.sold}, so its quantity cannot go below that.`);
  }
  if (!input.isFree && !incoming.length) throw invalid('Add at least one ticket tier, or make the event free.');

  const moved = startsAt.getTime() !== current.startsAt.getTime()
    || (endsAt?.getTime() ?? null) !== (current.endsAt?.getTime() ?? null)
    || input.venue.trim() !== current.venue
    || input.city.trim() !== current.city;

  return transaction(async (tx) => {
    // Tiers left out stop selling; tickets they already sold stay valid.
    const kept = new Set(incoming.filter((tier) => tier.id).map((tier) => tier.id));
    const dropped = online.filter((tier) => tier.active && !kept.has(tier.id)).map((tier) => tier.id);
    if (dropped.length) await tx.ticketTier.updateMany({ where: { id: { in: dropped } }, data: { active: false } });
    for (const [index, tier] of incoming.entries()) {
      const data = { name: tier.name.trim(), description: tier.description?.trim() || '', priceMinor: tier.priceMinor, capacity: tier.capacity ?? null, sortOrder: index, active: true };
      if (tier.id) await tx.ticketTier.update({ where: { id: tier.id }, data });
      else await tx.ticketTier.create({ data: { ...data, eventId: current.id, currency: current.currency, kind: 'ONLINE' } });
    }
    const paidPrices = incoming.map((tier) => tier.priceMinor).filter((price) => price > 0);

    const event = await tx.event.update({
      where: { id: current.id },
      data: {
        title: input.title.trim(),
        category: input.category,
        blurb: input.blurb.trim(),
        description: input.description.trim(),
        coverUrl: input.coverUrl,
        venue: input.venue.trim(),
        city: input.city.trim(),
        startsAt,
        endsAt,
        isFree: Boolean(input.isFree),
        priceFromMinor: paidPrices.length ? Math.min(...paidPrices) : null,
        capacity: input.capacity ?? null,
        allowGuestRsvp: input.allowGuestRsvp !== false,
      },
      select: { id: true, slug: true, status: true, title: true, startsAt: true, timezone: true, venue: true, city: true },
    });

    if (input.schedule) {
      await tx.eventScheduleItem.deleteMany({ where: { eventId: current.id } });
      await tx.eventScheduleItem.createMany({ data: input.schedule.map((item, index) => ({ ...item, eventId: current.id, sortOrder: index })) });
    }

    let told = 0;
    if (moved && event.status === 'PUBLISHED') {
      await rescheduleEventReminders(tx, event.id);
      const going = await tx.rsvp.findMany({ where: { eventId: event.id, status: 'GOING' }, select: { userId: true, email: true } });
      const title = `Change to ${event.title}`;
      const body = `It is now ${dayLabel(event.startsAt, event.timezone)} · ${timeLabel(event.startsAt, event.timezone)} at ${event.venue}, ${event.city}. Your reminders have moved with it.`;
      const href = `/events/${event.slug}`;
      const stamp = startsAt.getTime().toString(36);
      for (const person of going) {
        if (person.userId) await notify(tx, { userId: person.userId, topic: 'REMINDERS', title, body, href, urgent: true, dedupeKey: `moved:${event.id}:${stamp}:${person.userId}` });
        else await notifyGuest(tx, { email: person.email, topic: 'REMINDERS', subject: title, body, href, dedupeKey: `moved:${event.id}:${stamp}:${person.email}` });
      }
      told = going.length;
    }
    await audit(tx, { actorId: user.id, action: 'event.updated', targetType: 'Event', targetId: event.id, meta: { moved } });
    return { slug: event.slug, status: event.status, told };
  });
}

// The form's starting values when someone edits their event.
export async function eventForEditing(user, slug) {
  const event = await prisma.event.findUnique({
    where: { slug },
    include: { tiers: { where: { kind: 'ONLINE', active: true }, orderBy: { sortOrder: 'asc' } }, organizer: { select: { name: true, ownerId: true } } },
  });
  if (!event) return null;
  const staff = ['ADMIN', 'MODERATOR'].includes(user.role);
  if (event.createdById !== user.id && event.organizer.ownerId !== user.id && !staff) return null;
  return event;
}

async function ownedEvent(user, eventId) {
  const event = await prisma.event.findUnique({
    where: { id: eventId },
    select: { id: true, slug: true, title: true, status: true, createdById: true, startsAt: true, organizer: { select: { ownerId: true } } },
  });
  if (!event) throw notFound();
  const staff = ['ADMIN', 'MODERATOR'].includes(user.role);
  if (event.createdById !== user.id && event.organizer.ownerId !== user.id && !staff) throw forbidden();
  return event;
}

export async function setEventStatus(user, eventId, action) {
  const event = await ownedEvent(user, eventId);
  const transitions = {
    publish: { from: ['DRAFT', 'PAUSED'], to: 'PUBLISHED' },
    pause: { from: ['PUBLISHED'], to: 'PAUSED' },
    archive: { from: ['DRAFT', 'PAUSED', 'PUBLISHED'], to: 'ARCHIVED' },
  };
  const rule = transitions[action];
  if (!rule) throw badRequest('Unknown action.');
  if (!rule.from.includes(event.status)) throw badRequest(`This event is ${event.status.toLowerCase()} and cannot be changed that way.`);
  await transaction(async (tx) => {
    await tx.event.update({
      where: { id: event.id },
      data: { status: rule.to, ...(rule.to === 'PUBLISHED' ? { publishedAt: new Date() } : {}) },
    });
    await audit(tx, { actorId: user.id, action: `event.${action}`, targetType: 'Event', targetId: event.id });
  });
  return { status: rule.to };
}

// Cancelling refunds every paid order in full, fees included, and tells
// everyone who RSVP'd. See checkout.refundOrder.
export async function cancelEvent(user, eventId, reason, { refundOrder }) {
  const event = await ownedEvent(user, eventId);
  if (event.status === 'CANCELLED') return { refunded: 0 };
  await transaction(async (tx) => {
    await tx.event.update({ where: { id: event.id }, data: { status: 'CANCELLED', cancelledAt: new Date() } });
    await audit(tx, { actorId: user.id, action: 'event.cancelled', targetType: 'Event', targetId: event.id, meta: { reason } });
    const rsvps = await tx.rsvp.findMany({ where: { eventId: event.id, status: { not: 'CANCELLED' } }, select: { id: true, userId: true, email: true } });
    for (const rsvp of rsvps) {
      await tx.outboundMessage.updateMany({ where: { dedupeKey: { startsWith: `reminder:${rsvp.id}:` }, status: 'PENDING' }, data: { status: 'CANCELLED' } });
      const message = {
        topic: 'REMINDERS',
        title: `${event.title} has been cancelled`,
        body: `The organizer cancelled this event${reason ? `: ${reason}` : '.'} Any tickets you paid for are refunded in full, fees included.`,
        href: `/events/${event.slug}`,
      };
      if (rsvp.userId) await notify(tx, { userId: rsvp.userId, ...message });
      else await notifyGuest(tx, { email: rsvp.email, topic: message.topic, subject: message.title, body: message.body, href: message.href });
    }
  });

  const orders = await prisma.order.findMany({ where: { eventId: event.id, status: 'PAID' }, select: { id: true } });
  let refunded = 0;
  for (const order of orders) {
    await refundOrder(order.id, { actorId: user.id, reason: 'Event cancelled by organizer' });
    refunded += 1;
  }
  return { refunded };
}

// ── Traffic ───────────────────────────────────────────────────────────────

const SOURCES = new Set(['whatsapp', 'facebook', 'email', 'feed', 'direct', 'x', 'instagram']);

export function normalizeSource(value, referer) {
  const raw = String(value || '').toLowerCase();
  if (SOURCES.has(raw)) return raw;
  const ref = String(referer || '').toLowerCase();
  if (ref.includes('whatsapp') || ref.includes('wa.me')) return 'whatsapp';
  if (ref.includes('facebook') || ref.includes('fb.')) return 'facebook';
  if (ref.includes('t.co') || ref.includes('twitter') || ref.includes('x.com')) return 'x';
  if (ref.includes('instagram')) return 'instagram';
  if (ref && !ref.includes(new URL(config().appUrl).host)) return 'direct';
  if (ref) return 'feed';
  return 'direct';
}

// One view per visitor per event per half hour.
export async function recordView(eventId, { ip, source }) {
  const { allowed } = await checkRateLimit('track.view', `${eventId}:${ip}`);
  if (!allowed) return false;
  await incrementStat(eventId, source, 'views');
  await prisma.event.update({ where: { id: eventId }, data: { viewCount: { increment: 1 } } });
  return true;
}

export async function recordAction(eventId, { source, kind }) {
  const column = kind === 'share' ? 'shares' : 'ctaClicks';
  await incrementStat(eventId, source, column);
  if (kind === 'share') await prisma.event.update({ where: { id: eventId }, data: { shareCount: { increment: 1 } } });
}

async function incrementStat(eventId, source, column) {
  const day = new Date(new Date().toISOString().slice(0, 10));
  const views = column === 'views' ? 1 : 0;
  const ctaClicks = column === 'ctaClicks' ? 1 : 0;
  const shares = column === 'shares' ? 1 : 0;
  await prisma.$executeRaw`
    INSERT INTO "EventStat" ("eventId", "day", "source", "views", "ctaClicks", "shares")
    VALUES (${eventId}, ${day}, ${source}, ${views}, ${ctaClicks}, ${shares})
    ON CONFLICT ("eventId", "day", "source") DO UPDATE
       SET "views" = "EventStat"."views" + EXCLUDED."views",
           "ctaClicks" = "EventStat"."ctaClicks" + EXCLUDED."ctaClicks",
           "shares" = "EventStat"."shares" + EXCLUDED."shares"`;
}

// ── Calendar ──────────────────────────────────────────────────────────────

function icsEscape(value) {
  return String(value).replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\r?\n/g, '\\n');
}

function icsDate(date) {
  return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
}

// Folds lines at 75 octets as RFC 5545 requires.
function fold(line) {
  const out = [];
  let rest = line;
  while (Buffer.byteLength(rest) > 75) {
    let cut = 75;
    while (Buffer.byteLength(rest.slice(0, cut)) > 75) cut -= 1;
    out.push(rest.slice(0, cut));
    rest = ` ${rest.slice(cut)}`;
  }
  out.push(rest);
  return out.join('\r\n');
}

export function eventCalendar(event, reminderPlan = '7d,1d,2h') {
  const url = `${config().appUrl}/events/${event.slug}`;
  const ends = event.endsAt || new Date(event.startsAt.getTime() + 3 * 3600 * 1000);
  const alarms = reminderPlan
    .split(',')
    .filter(Boolean)
    .map((step) => {
      const match = /^(\d+)([dh])$/.exec(step.trim());
      if (!match) return null;
      const trigger = match[2] === 'd' ? `-P${match[1]}D` : `-PT${match[1]}H`;
      return ['BEGIN:VALARM', `TRIGGER:${trigger}`, 'ACTION:DISPLAY', `DESCRIPTION:${icsEscape(event.title)}`, 'END:VALARM'];
    })
    .filter(Boolean)
    .flat();

  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Twendezetu//Event Guide//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${event.id}@twendezetu`,
    `DTSTAMP:${icsDate(new Date())}`,
    `DTSTART:${icsDate(event.startsAt)}`,
    `DTEND:${icsDate(ends)}`,
    `SUMMARY:${icsEscape(event.title)}`,
    `LOCATION:${icsEscape(event.venue)}`,
    `DESCRIPTION:${icsEscape(`${event.blurb}\n\n${url}`)}`,
    `URL:${url}`,
    ...(event.status === 'CANCELLED' ? ['STATUS:CANCELLED'] : ['STATUS:CONFIRMED']),
    ...alarms,
    'END:VEVENT',
    'END:VCALENDAR',
  ];
  return `${lines.map(fold).join('\r\n')}\r\n`;
}
