// Demo data for development and previews.
//
// Base content (people, organizers, events, providers) is inserted directly.
// Everything that moves money or changes state — top-ups, sends, ticket
// purchases, offers, escrow, pools, split pay, referrals, disputes — goes
// through the real services, so the seed doubles as an end-to-end run of the
// backend and every balance is backed by ledger entries.
//
// It wipes the database first. It refuses to run against a database that
// holds real accounts unless SEED_CONFIRM_RESET=yes is set.

import zlib from 'node:zlib';

try {
  process.loadEnvFile();
} catch {
  // Environment supplied by the host.
}
// Card payments in the seed complete in test mode (no processor involved).
process.env.ALLOW_MOCK_PAYMENTS = 'true';
delete process.env.STRIPE_SECRET_KEY;

const { prisma, transaction } = await import('../src/server/db.js');
const { hashPassword } = await import('../src/server/security/passwords.js');
const { encrypt, lastDigits } = await import('../src/server/security/crypto.js');
const { getRates } = await import('../src/server/fx.js');
const { convert, toMinor } = await import('../src/shared/money.js');
const { eventCategoryFromLabel, providerCategoryFromLabel, slugify } = await import('../src/shared/format.js');
const { awardReferral } = await import('../src/server/services/referrals.js');
const { rsvpToEvent } = await import('../src/server/services/rsvps.js');
const { placeOrder } = await import('../src/server/services/checkout.js');
const { startTopUp, sendPoints } = await import('../src/server/services/wallet.js');
const { createPool, contribute } = await import('../src/server/services/pools.js');
const marketplace = await import('../src/server/services/marketplace.js');
const { findOrCreateThread, sendMessage } = await import('../src/server/services/threads.js');
const { saveListing, renewMembership } = await import('../src/server/services/providers.js');
const { createSplit, payShare } = await import('../src/server/services/splits.js');
const { openDispute, escalateOverdueDisputes } = await import('../src/server/services/disputes.js');
const { requestWithdrawal } = await import('../src/server/services/payouts.js');
const { fileReport } = await import('../src/server/services/moderation.js');
const { storeFile } = await import('../src/server/storage.js');
const { EVENT_CATALOG } = await import('./seed/events-content.mjs');
const { PROVIDER_CATALOG } = await import('./seed/providers-content.mjs');

export const DEMO_PASSWORD = 'karibu-twende-2026';
const DAY = 86_400_000;
const now = new Date();

// ── Safety ────────────────────────────────────────────────────────────────

async function guard() {
  const real = await prisma.user.count({
    where: { NOT: [{ email: { endsWith: '@example.com' } }, { email: { endsWith: '@demo.tz' } }, { email: { endsWith: '.invalid' } }] },
  });
  if (real > 0 && process.env.SEED_CONFIRM_RESET !== 'yes') {
    console.error(`Refusing to seed: this database has ${real} real account(s) and seeding erases everything.`);
    console.error('If you really mean to wipe it, run again with SEED_CONFIRM_RESET=yes.');
    process.exit(1);
  }
}

async function wipe() {
  const tables = await prisma.$queryRaw`
    SELECT tablename FROM pg_tables
     WHERE schemaname = 'public' AND tablename NOT IN ('_prisma_migrations', 'FxRate')`;
  const list = tables.map(({ tablename }) => `"public"."${tablename}"`).join(', ');
  await prisma.$executeRawUnsafe(`TRUNCATE ${list} RESTART IDENTITY CASCADE`);
}

// ── Dates ─────────────────────────────────────────────────────────────────

// The UTC instant of a wall-clock time in an IANA time zone.
function zoned(year, month, day, hour, minute, timeZone) {
  const guess = Date.UTC(year, month - 1, day, hour, minute);
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat('en-US', { timeZone, hourCycle: 'h23', year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric' })
      .formatToParts(new Date(guess))
      .map((part) => [part.type, part.value]),
  );
  const asLocal = Date.UTC(Number(parts.year), Number(parts.month) - 1, Number(parts.day), Number(parts.hour), Number(parts.minute));
  return new Date(guess - (asLocal - guess));
}

const WEEKDAYS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

// The first date on or after `from` that falls on `weekday` (e.g. "FRI").
function nextWeekday(from, weekday) {
  const target = WEEKDAYS.indexOf(weekday);
  const date = new Date(from);
  while (date.getUTCDay() !== target) date.setUTCDate(date.getUTCDate() + 1);
  return date;
}

function parseClock(label) {
  const match = /(\d{1,2}):(\d{2})\s*(AM|PM)/i.exec(label || '');
  if (!match) return { hour: 18, minute: 0 };
  let hour = Number(match[1]) % 12;
  if (match[3].toUpperCase() === 'PM') hour += 12;
  return { hour, minute: Number(match[2]) };
}

function dayOnly(date) {
  return new Date(date.toISOString().slice(0, 10));
}

// ── Places & prices ───────────────────────────────────────────────────────

const PLACES = {
  KE: { tz: 'Africa/Nairobi', currency: 'KES' },
  UG: { tz: 'Africa/Kampala', currency: 'UGX' },
  TZ: { tz: 'Africa/Dar_es_Salaam', currency: 'TZS' },
  RW: { tz: 'Africa/Kigali', currency: 'RWF' },
  US: { tz: 'America/New_York', currency: 'USD' },
};
const US_STATES = new Set(['NY', 'NJ', 'CT', 'MA', 'TX', 'PA']);
const CITY_COUNTRY = {
  NAIROBI: 'KE', MOMBASA: 'KE', KAMPALA: 'UG', JINJA: 'UG', ENTEBBE: 'UG', 'DAR ES SALAAM': 'TZ', ARUSHA: 'TZ',
  KIGALI: 'RW', 'JERSEY CITY': 'US', 'NEWARK, NJ': 'US', 'BROOKLYN, NY': 'US',
};

function placeFor(cityLabel) {
  const match = /,\s*([A-Z]{2})$/.exec(cityLabel);
  const code = match?.[1];
  if (code && PLACES[code]) return { country: code, ...PLACES[code], city: cityLabel.replace(/,\s*[A-Z]{2}$/, '').split('·').pop().trim() };
  if (code && US_STATES.has(code)) {
    return { country: 'US', currency: 'USD', tz: code === 'TX' ? 'America/Chicago' : 'America/New_York', city: cityLabel.split('·').pop().replace(/,\s*[A-Z]{2}$/, '').trim() };
  }
  const country = CITY_COUNTRY[cityLabel.toUpperCase()] || 'US';
  return { country, ...PLACES[country], city: titleCase(cityLabel.replace(/,\s*[A-Z]{2}$/, '')) };
}

function titleCase(value) {
  return value.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
}

// Entry prices per currency, in minor units: [standard, premium].
const LOCAL_PRICES = { USD: [1500, 2500], KES: [50_000, 150_000], UGX: [20_000, 35_000], TZS: [1_000_000, 2_500_000], RWF: [5_000, 10_000] };

function niceRound(minor, currency) {
  const major = minor / (currency === 'UGX' || currency === 'RWF' ? 1 : 100);
  const magnitude = 10 ** Math.max(0, Math.floor(Math.log10(major)) - 1);
  const rounded = Math.max(magnitude, Math.round(major / magnitude) * magnitude);
  return toMinor(rounded, currency);
}

// "UGX 350K/set" → { minor, currency, unit } in the provider's own currency.
function parseRate(label, currency, rates) {
  const match = /(FROM\s+)?(\$|[A-Z]{3})\s*([\d.,]+)\s*([KM])?(?:\/(\w+))?/i.exec(label);
  if (!match) return { minor: null, unit: null };
  const labelCurrency = match[2] === '$' ? 'USD' : match[2].toUpperCase();
  let amount = Number(match[3].replace(/,/g, ''));
  if (match[4]?.toUpperCase() === 'K') amount *= 1_000;
  if (match[4]?.toUpperCase() === 'M') amount *= 1_000_000;
  const inLabelCurrency = toMinor(amount, labelCurrency);
  const minor = labelCurrency === currency ? inLabelCurrency : niceRound(convert(inLabelCurrency, labelCurrency, currency, rates), currency);
  return { minor, unit: match[1] ? null : match[5] || null };
}

// ── People ────────────────────────────────────────────────────────────────

const PEOPLE = [
  { key: 'amina', name: 'Amina Mushi', email: 'amina@example.com', city: 'Jersey City', country: 'US', phone: '+12015550112' },
  { key: 'kato', name: 'Ssemakula Kato', email: 'kato@example.com', city: 'Kampala', country: 'UG', phone: '+256772000214' },
  { key: 'desk', name: 'Twendezetu Events Desk', email: 'events@example.com', city: 'Jersey City', country: 'US' },
  { key: 'joel', name: 'Joel Mwangi', email: 'joel@example.com', city: 'Hartford', country: 'US', referrer: 'amina', phone: '+18605550147' },
  { key: 'faridah', name: 'Faridah Kamau', email: 'faridah@example.com', city: 'Hartford', country: 'US', referrer: 'amina', phone: '+18605550163' },
  { key: 'deo', name: 'Deo Okello', email: 'deo@example.com', city: 'Kampala', country: 'UG', referrer: 'amina', phone: '+256772000388' },
  { key: 'neema', name: 'Neema Wanjiru', email: 'neema@example.com', city: 'Nairobi', country: 'KE', referrer: 'amina', phone: '+254712000451' },
  { key: 'samuel', name: 'Samuel Kiprono', email: 'samuel@example.com', city: 'Nairobi', country: 'KE', referrer: 'amina', phone: '+254712000519' },
  { key: 'admin', name: 'Twendezetu Admin', email: 'admin@example.com', city: 'Nairobi', country: 'KE', role: 'ADMIN' },
  { key: 'finance', name: 'Finance Desk', email: 'finance@example.com', city: 'Kampala', country: 'UG', role: 'FINANCE' },
  { key: 'moderator', name: 'Trust & Safety', email: 'trust@example.com', city: 'Nairobi', country: 'KE', role: 'MODERATOR' },
];

async function createPeople(passwordHash) {
  const people = {};
  for (const person of PEOPLE) {
    people[person.key] = await prisma.user.create({
      data: {
        email: person.email,
        passwordHash,
        passwordChangedAt: now,
        name: person.name,
        handle: person.key,
        city: person.city,
        country: person.country,
        currency: PLACES[person.country].currency,
        role: person.role || 'MEMBER',
        referredById: person.referrer ? people[person.referrer].id : null,
        phone: person.phone || null,
        createdAt: new Date(now - (90 + PEOPLE.indexOf(person) * 3) * DAY),
      },
    });
  }
  return people;
}

// Loads what the services expect as the signed-in person.
async function viewer(user) {
  return prisma.user.findUnique({
    where: { id: user.id },
    select: {
      id: true, email: true, name: true, handle: true, phone: true, phoneVerifiedAt: true, city: true, country: true,
      locale: true, currency: true, avatarUrl: true, role: true, status: true, twoFactorEnabled: true, createdAt: true,
      provider: { select: { id: true, slug: true, name: true, status: true, verifiedAt: true } },
    },
  });
}

// Phone verification without the SMS round trip, including the referral
// reward the real flow grants.
async function verifyPhone(user) {
  await transaction(async (tx) => {
    await tx.user.update({ where: { id: user.id }, data: { phoneVerifiedAt: new Date(now - 30 * DAY) } });
    await awardReferral(tx, user.id, 'JOINED');
  });
}

// ── Events ────────────────────────────────────────────────────────────────

const FLAGSHIP_DATES = {
  // Real events keep their real dates.
  'nyama-choma-festival-2026': { year: 2026, month: 8, day: 8 },
  'swahili-heritage-festival-2026': { year: 2026, month: 7, day: 26 },
  // Showcase events are placed in the coming weeks.
  'afrogroove-night': { weeksAhead: 3 },
  'diaspora-connect-mixer': { weeksAhead: 4 },
};

const NYTC_SCHEDULE = [
  { timeLabel: '2:00 PM', title: 'Gates + karibu', description: 'Saa nane mchana — find NYTC on the Communipaw Ave side', tag: 'ALL' },
  { timeLabel: '2:30 PM', title: 'Uchomaji wa nyama', description: 'The grill masters begin — nyama choma, mishkaki, kuku', tag: 'FOOD' },
  { timeLabel: '3:30 PM', title: 'Michezo ya kila rika', description: 'Games for every age — kids races, tug of war, bao', tag: 'GAMES' },
  { timeLabel: '5:00 PM', title: 'Burudani + DJ', description: 'Live entertainment, bongo flava & amapiano sets', tag: 'MUSIC' },
  { timeLabel: '7:00 PM', title: 'Connection hour', description: 'Community services, vendors, meet the leadership', tag: 'COMMUNITY' },
];

async function createOrganizer(ownerId, name, city) {
  return prisma.organizer.create({ data: { ownerId, name, slug: slugify(name), city } });
}

async function createEvents(people) {
  const organizerOwners = {
    'UONGOZI · NYTC': people.desk,
    'Tanzania Embassy, Washington D.C.': people.desk,
    'Afrogroove Collective': people.desk,
    'Diaspora Connect': people.desk,
  };
  const organizers = {};
  const events = {};

  for (const [index, item] of EVENT_CATALOG.entries()) {
    const place = placeFor(item.city);
    const organizerName = item.organizer;
    if (!organizers[organizerName]) {
      organizers[organizerName] = await createOrganizer((organizerOwners[organizerName] || people.desk).id, organizerName, place.city);
    }

    const { hour, minute } = parseClock(item.time);
    const plan = FLAGSHIP_DATES[item.slug];
    let startsAt;
    if (plan?.year) {
      startsAt = zoned(plan.year, plan.month, plan.day, hour, minute, place.tz);
    } else {
      const weekday = item.date.split('·')[0].trim();
      const from = new Date(now.getTime() + (plan ? plan.weeksAhead * 7 : 5 + ((index * 5) % 63)) * DAY);
      const day = nextWeekday(from, weekday);
      startsAt = zoned(day.getUTCFullYear(), day.getUTCMonth() + 1, day.getUTCDate(), hour, minute, place.tz);
    }

    const isFree = item.price === 'FREE';
    const currency = place.currency;
    const premium = /\$25|35,000|25,000/.test(item.price) ? 1 : 0;
    const base = LOCAL_PRICES[currency][premium];
    const tiers = isFree
      ? []
      : item.slug === 'afrogroove-night'
        ? [
            { name: 'Early bird', description: 'Pay online before the week of the show · limited allocation', tag: 'SAVE 20%', priceMinor: 2000, compareAtMinor: 2500, capacity: 120 },
            { name: 'General admission', description: 'Entry 9 PM – 3 AM · all areas', priceMinor: 2500, capacity: 200 },
            { name: 'VIP lounge', description: 'Lounge + bar access · free welcome drink', priceMinor: 4500, capacity: 40 },
            { name: 'Door price', description: 'Sold at the door on the night, while space lasts', priceMinor: 2500, capacity: 60, kind: 'DOOR' },
          ]
        : item.price.startsWith('FROM')
          ? [
              { name: 'Early bird', description: 'Limited allocation', priceMinor: base, capacity: 80 },
              { name: 'General admission', description: 'All-areas entry', priceMinor: niceRound(Math.round(base * 1.4), currency), capacity: 250 },
            ]
          : [{ name: 'General admission', description: 'All-areas entry', priceMinor: base, capacity: 300 }];

    const category = eventCategoryFromLabel(item.cat);
    const when = new Intl.DateTimeFormat('en-US', { timeZone: place.tz, weekday: 'long', day: 'numeric', month: 'long' }).format(startsAt);
    const description = item.generated
      ? `${item.title} — a ${item.cat.toLowerCase()} gathering hosted by ${organizerName} in ${place.city} on ${when}. ${isFree ? 'Free entry — RSVP to save your spot.' : 'Tickets are sold online with a QR code for the gate.'} Reminders land in My Twende and your email.`
      : item.description;

    const event = await prisma.event.create({
      data: {
        slug: item.slug,
        organizerId: organizers[organizerName].id,
        createdById: organizers[organizerName].ownerId,
        title: item.title,
        category,
        blurb: item.generated ? `${organizerName} brings ${item.title} to ${place.city}.` : item.blurb,
        description,
        coverUrl: item.img.replace(/w=\d+/, 'w=1100'),
        venue: item.venue,
        city: item.city,
        country: place.country,
        timezone: place.tz,
        startsAt,
        endsAt: new Date(startsAt.getTime() + (item.slug === 'afrogroove-night' ? 6 : 5) * 3600 * 1000),
        currency,
        isFree,
        priceFromMinor: isFree ? null : Math.min(...tiers.filter((tier) => tier.kind !== 'DOOR').map((tier) => tier.priceMinor)),
        status: 'PUBLISHED',
        publishedAt: new Date(startsAt.getTime() - 30 * DAY),
        badge: item.badge || null,
        featuredRank: item.generated ? null : ['afrogroove-night', 'diaspora-connect-mixer', 'nyama-choma-festival-2026', 'swahili-heritage-festival-2026'].indexOf(item.slug) + 1,
        allowGuestRsvp: true,
        tiers: {
          create: tiers.map((tier, sortOrder) => ({
            name: tier.name,
            description: tier.description,
            tag: tier.tag || null,
            kind: tier.kind || 'ONLINE',
            priceMinor: tier.priceMinor,
            compareAtMinor: tier.compareAtMinor || null,
            currency,
            capacity: tier.capacity,
            sortOrder,
          })),
        },
        schedule: item.slug === 'nyama-choma-festival-2026' ? { create: NYTC_SCHEDULE.map((row, sortOrder) => ({ ...row, sortOrder })) } : undefined,
      },
      include: { tiers: true },
    });
    events[item.slug] = { ...event, going: item.going };
  }

  const afrogroove = events['afrogroove-night'];
  await prisma.promoCode.create({
    data: { eventId: afrogroove.id, code: 'NANE20', kind: 'FIXED', value: 2000, minSubtotalMinor: 5000, maxRedemptions: 200 },
  });
  return { events, organizers };
}

// Attendance backed by real RSVP rows (demo guests at example.com).
async function seedAttendance(events) {
  let guest = 0;
  for (const event of Object.values(events)) {
    const rows = Array.from({ length: event.going }, () => {
      guest += 1;
      return {
        eventId: event.id,
        name: `Guest ${guest}`,
        email: `guest${guest}@example.com`,
        partySize: 1,
        status: 'GOING',
        reminderPlan: 'off',
        source: ['whatsapp', 'whatsapp', 'facebook', 'direct', 'feed', 'email'][guest % 6],
        createdAt: new Date(event.startsAt.getTime() - (5 + (guest % 25)) * DAY),
      };
    });
    for (let start = 0; start < rows.length; start += 1000) {
      await prisma.rsvp.createMany({ data: rows.slice(start, start + 1000) });
    }
    await prisma.event.update({ where: { id: event.id }, data: { goingCount: rows.length } });
  }
}

// Traffic for the organizer analytics page: daily views by source.
async function seedTraffic(event, totalViews) {
  const sources = { whatsapp: 0.44, facebook: 0.21, direct: 0.18, feed: 0.12, email: 0.05 };
  const days = 21;
  const rows = [];
  for (let d = 0; d < days; d += 1) {
    const day = dayOnly(new Date(event.startsAt.getTime() - (days - d) * DAY));
    const weight = (d + 1) / ((days * (days + 1)) / 2);
    for (const [source, share] of Object.entries(sources)) {
      const views = Math.round(totalViews * share * weight);
      rows.push({ eventId: event.id, day, source, views, ctaClicks: Math.round(views * 0.145), shares: Math.round(views * 0.02) });
    }
  }
  await prisma.eventStat.createMany({ data: rows });
  await prisma.event.update({ where: { id: event.id }, data: { viewCount: rows.reduce((sum, row) => sum + row.views, 0), shareCount: rows.reduce((sum, row) => sum + row.shares, 0) } });
}

// ── Providers ─────────────────────────────────────────────────────────────

const KATO_SERVICES = [
  { title: 'Up-country 4x4 + driver', description: 'Land Cruiser, village-road ready, fuel itemised', rate: 'UGX 400K/day' },
  { title: 'Airport transfers', description: 'Entebbe to Kampala, flight tracked, any hour', rate: 'UGX 150K/trip' },
  { title: 'Wedding convoys', description: 'Decorated lead car plus guest cars, coordinated', rate: 'UGX 300K/car' },
  { title: 'Event shuttles', description: 'Cookouts, harambees and church events', rate: null },
];

const KATO_GALLERY = [
  ['https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=1400&q=80', 'Land Cruiser on the open road'],
  ['https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=1400&q=80', 'Driver at the wheel'],
  ['https://images.unsplash.com/photo-1502877338535-766e1452684a?w=1400&q=80', 'Vehicle detail'],
  ['https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1400&q=80', 'Up-country route'],
];

// Neighbouring cities a provider also serves.
const SERVICE_AREAS = {
  KAMPALA: ['Jinja', 'Entebbe', 'Mukono'],
  JINJA: ['Kampala'],
  NAIROBI: ['Mombasa', 'Nakuru'],
  MOMBASA: ['Nairobi'],
  'DAR ES SALAAM': ['Arusha', 'Zanzibar'],
  ARUSHA: ['Dar es Salaam'],
  KIGALI: [],
  'JERSEY CITY': ['Newark', 'Hartford', 'Brooklyn'],
  'NEWARK, NJ': ['Jersey City', 'Hartford', 'Brooklyn'],
  'BROOKLYN, NY': ['Jersey City', 'Newark'],
};

async function createProviders(people, passwordHash, rates) {
  const providers = {};
  const all = [
    { name: 'Kato 4x4 & Tours', cat: 'TRANSPORT & DRIVERS', rating: '4.9', jobs: 61, city: 'KAMPALA', desc: 'Village-road specialist. Airport runs at any hour, convoys, up-country trips.', rate: 'UGX 400K/day', img: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=1100&q=80', verified: true, slug: 'kato-4x4', owner: people.kato },
    ...PROVIDER_CATALOG,
    { name: 'QuickCars UG', cat: 'TRANSPORT & DRIVERS', rating: '4.5', jobs: 3, city: 'KAMPALA', desc: 'Cars for hire across Kampala.', rate: 'UGX 250K/day', img: 'https://images.unsplash.com/photo-1502877338535-766e1452684a?w=1100&q=80', verified: false, slug: 'quickcars-ug' },
  ];

  for (const [index, item] of all.entries()) {
    const country = CITY_COUNTRY[item.city] || 'US';
    const currency = PLACES[country].currency;
    const owner = item.owner || (await prisma.user.create({
      data: {
        email: `${item.slug}@example.com`,
        passwordHash,
        name: item.name,
        handle: slugify(item.slug).slice(0, 30),
        city: titleCase(item.city.replace(/,\s*[A-Z]{2}$/, '')),
        country,
        currency,
        createdAt: new Date(now - (200 - index) * DAY),
      },
    }));
    const rate = parseRate(item.rate, currency, rates);
    const city = titleCase(item.city.replace(/,\s*[A-Z]{2}$/, ''));
    const provider = await prisma.provider.create({
      data: {
        slug: item.slug,
        ownerId: owner.id,
        name: item.name,
        category: providerCategoryFromLabel(item.cat),
        city,
        country,
        headline: item.desc,
        description: `${item.name} offers ${item.cat.toLowerCase()} in ${city}. ${item.desc}`,
        coverUrl: item.img.replace(/w=\d+/, 'w=1100'),
        rateMinor: rate.minor,
        rateCurrency: currency,
        rateUnit: rate.unit,
        serviceAreas: SERVICE_AREAS[item.city] || [],
        yearsActive: 2 + (index % 9),
        status: 'ACTIVE',
        verifiedAt: item.verified ? new Date(now - 60 * DAY) : null,
        jobsCompleted: item.jobs,
        membershipEndsAt: new Date(now.getTime() + (60 + ((index * 37) % 300)) * DAY),
        createdAt: new Date(now - (200 - index) * DAY),
      },
    });
    providers[item.slug] = { ...provider, targetRating: Number(item.rating) };
  }

  const kato = providers['kato-4x4'];
  await prisma.providerService.createMany({
    data: KATO_SERVICES.map((service, sortOrder) => {
      const rate = service.rate ? parseRate(service.rate, 'UGX', rates) : { minor: null, unit: null };
      return { providerId: kato.id, title: service.title, description: service.description, rateMinor: rate.minor, currency: 'UGX', rateUnit: rate.unit, sortOrder };
    }),
  });
  await prisma.providerMedia.createMany({ data: KATO_GALLERY.map(([url, alt], sortOrder) => ({ providerId: kato.id, url, alt, sortOrder })) });
  return providers;
}

const REVIEW_LINES = [
  'On time, professional, and everything went through the platform — no surprises.',
  'Great communication and fair pricing. Would book again.',
  'Solid, reliable service. Recommended for diaspora events.',
  'They understood exactly what the family wanted. Asante sana.',
  'Arrived early, set up quietly, left the place spotless.',
];

async function seedReviews(people, providers) {
  const authors = [people.joel, people.faridah, people.deo, people.samuel, people.neema];
  const katoReviews = [
    { author: people.faridah, rating: 5, jobLabel: 'Airport pickup', body: 'Picked us up at Entebbe at 3am. Tracked the delayed flight, cold water waiting, kids asleep in ten minutes. Legend.', reply: 'Asante Faridah! Karibu tena any time — those late flights are our specialty.', ago: 50 },
    { author: people.joel, rating: 5, jobLabel: 'Up-country, 2 days', body: 'Took us to the village past Mbale where the road is only mud. Never complained, helped carry gifts, negotiated the boda crossing.', ago: 80 },
    { author: people.deo, rating: 4, jobLabel: 'Wedding convoy', body: 'Three spotless cars, on time, and he knew the photographer’s route better than the photographer.', reply: 'Congratulations again to the happy couple!', ago: 110 },
  ];

  for (const provider of Object.values(providers)) {
    const reviews = provider.slug === 'kato-4x4'
      ? katoReviews
      : authors.slice(0, 2 + (provider.jobsCompleted % 3)).filter((author) => author.id !== provider.ownerId).map((author, i) => ({
          author,
          rating: provider.targetRating >= 4.95 ? 5 : i === 0 && provider.targetRating < 4.8 ? 4 : 5,
          jobLabel: null,
          body: REVIEW_LINES[(provider.name.length + i) % REVIEW_LINES.length],
          ago: 20 + i * 17,
        }));
    for (const review of reviews) {
      await prisma.review.create({
        data: {
          providerId: provider.id,
          authorId: review.author.id,
          rating: review.rating,
          jobLabel: review.jobLabel,
          body: review.body,
          reply: review.reply || null,
          repliedAt: review.reply ? new Date(now - (review.ago - 1) * DAY) : null,
          createdAt: new Date(now - review.ago * DAY),
        },
      });
    }
    await prisma.provider.update({
      where: { id: provider.id },
      data: { ratingCount: reviews.length, ratingSum: reviews.reduce((sum, review) => sum + review.rating, 0) },
    });
  }
}

// A small, clearly labelled PDF used as the uploaded document in demo
// verification applications.
function demoPdf(title) {
  const text = `Twendezetu demo document: ${title}. Seeded for development; not a real record.`;
  const stream = `BT /F1 12 Tf 48 760 Td (${text.replace(/[()\\]/g, '')}) Tj ET`;
  const objects = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>',
    `<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`,
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
  ];
  let body = '%PDF-1.4\n';
  const offsets = [];
  objects.forEach((object, index) => {
    offsets.push(body.length);
    body += `${index + 1} 0 obj\n${object}\nendobj\n`;
  });
  const xref = body.length;
  body += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n${offsets.map((offset) => `${String(offset).padStart(10, '0')} 00000 n \n`).join('')}`;
  body += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`;
  return Buffer.from(body, 'latin1');
}

// A plain 96×64 PNG in the brand clay colour, standing in for portfolio photos.
function demoPng(shade) {
  const width = 96;
  const height = 64;
  const crcTable = Array.from({ length: 256 }, (_v, n) => {
    let c = n;
    for (let k = 0; k < 8; k += 1) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    return c >>> 0;
  });
  const crc = (buffer) => {
    let c = 0xffffffff;
    for (const byte of buffer) c = crcTable[(c ^ byte) & 0xff] ^ (c >>> 8);
    return (c ^ 0xffffffff) >>> 0;
  };
  const chunk = (type, data) => {
    const length = Buffer.alloc(4);
    length.writeUInt32BE(data.length);
    const body = Buffer.concat([Buffer.from(type, 'ascii'), data]);
    const sum = Buffer.alloc(4);
    sum.writeUInt32BE(crc(body));
    return Buffer.concat([length, body, sum]);
  };
  const header = Buffer.alloc(13);
  header.writeUInt32BE(width, 0);
  header.writeUInt32BE(height, 4);
  header.set([8, 2, 0, 0, 0], 8);
  const row = Buffer.concat([Buffer.from([0]), Buffer.from(Array.from({ length: width }, () => [217 - shade, 122, 59 + shade]).flat())]);
  const pixels = zlib.deflateSync(Buffer.concat(Array.from({ length: height }, () => row)));
  return Buffer.concat([Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]), chunk('IHDR', header), chunk('IDAT', pixels), chunk('IEND', Buffer.alloc(0))]);
}

async function seedVerificationQueue(providers) {
  const applicants = [
    { slug: 'chef-halima', complete: true, route: 'FORMAL' },
    { slug: 'simba-sounds', complete: false, route: 'FORMAL' },
    { slug: 'lensa-ya-kigali', complete: true, route: 'PORTFOLIO' },
  ];
  for (const [index, applicant] of applicants.entries()) {
    const provider = providers[applicant.slug];
    if (!provider) continue;
    const idFile = await storeFile({ ownerId: provider.ownerId, purpose: 'KYC_ID', name: 'national-id.pdf', bytes: demoPdf(`${provider.name} identity`) });
    const proofFile = applicant.complete && applicant.route === 'FORMAL'
      ? await storeFile({ ownerId: provider.ownerId, purpose: 'KYC_PROOF', name: 'trading-licence.pdf', bytes: demoPdf(`${provider.name} trading licence`) })
      : null;
    const portfolio = [];
    if (applicant.route === 'PORTFOLIO') {
      for (let n = 0; n < 5; n += 1) {
        portfolio.push((await storeFile({ ownerId: provider.ownerId, purpose: 'KYC_PORTFOLIO', name: `work-${n + 1}.png`, bytes: demoPng(n * 20) })).id);
      }
    }
    const phone = `+2567720010${index}${index}`;
    await prisma.user.update({ where: { id: provider.ownerId }, data: { phone, phoneVerifiedAt: new Date(now - 10 * DAY) } });
    await prisma.verificationApplication.create({
      data: {
        providerId: provider.id,
        status: 'SUBMITTED',
        businessName: provider.name,
        category: provider.category,
        cities: [provider.city, ...provider.serviceAreas].join(', '),
        yearsActive: provider.yearsActive,
        description: provider.description,
        idName: provider.name,
        idNumberEnc: encrypt(`CM${900000 + index * 1234}X`),
        idFileId: idFile.id,
        proofRoute: applicant.route,
        proofNumber: applicant.route === 'FORMAL' ? `TIN-${100200300 + index}` : null,
        proofFileId: proofFile?.id || null,
        portfolioFileIds: portfolio,
        referenceOne: applicant.route === 'PORTFOLIO' ? 'Kigali Wedding Fair 2025 — organiser' : null,
        referenceTwo: applicant.route === 'PORTFOLIO' ? 'St. Michael’s Parish — events office' : null,
        phone,
        phoneVerifiedAt: new Date(now - 10 * DAY),
        payoutKind: 'MTN_MOMO',
        payoutAccountEnc: encrypt(phone),
        payoutLast4: lastDigits(phone),
        submittedAt: new Date(now - (2 + index * 2) * DAY),
      },
    });
  }
}

// ── Flows through the services ────────────────────────────────────────────

async function topUp(user, usd) {
  await startTopUp(await viewer(user), usd);
}

async function setBackdated(model, where, date) {
  await prisma[model].updateMany({ where, data: { createdAt: date } });
}

async function main() {
  await guard();
  console.log('— Clearing demo database');
  await wipe();

  const rates = await getRates();
  const passwordHash = await hashPassword(DEMO_PASSWORD);

  console.log('— People');
  const people = await createPeople(passwordHash);
  await prisma.user.update({ where: { id: people.amina.id }, data: { phoneVerifiedAt: new Date(now - 60 * DAY) } });
  await prisma.user.update({ where: { id: people.kato.id }, data: { phoneVerifiedAt: new Date(now - 60 * DAY) } });

  console.log('— Events');
  const { events } = await createEvents(people);
  await seedAttendance(events);
  await seedTraffic(events['nyama-choma-festival-2026'], 4210);
  await seedTraffic(events['afrogroove-night'], 1850);

  console.log('— Providers & reviews');
  const providers = await createProviders(people, passwordHash, rates);
  await seedReviews(people, providers);
  await seedVerificationQueue(providers);

  console.log('— Referrals & wallets');
  for (const key of ['joel', 'faridah', 'deo', 'neema', 'samuel']) await verifyPhone(people[key]);
  await topUp(people.amina, 100);
  for (const key of ['joel', 'faridah', 'deo', 'neema', 'samuel']) await topUp(people[key], 150);
  await topUp(people.desk, 50);
  await sendPoints(await viewer(people.joel), { recipient: 'amina', points: 500, note: 'kwa mafuta ya safari' });

  console.log('— RSVPs, tickets and saved events');
  const amina = await viewer(people.amina);
  await rsvpToEvent({ slug: 'diaspora-connect-mixer', viewer: amina, partySize: 2, status: 'GOING' });
  await rsvpToEvent({ slug: 'umoja-cultural-day', viewer: amina, status: 'INTERESTED' }).catch(() => {});
  const afro = events['afrogroove-night'];
  const early = afro.tiers.find((tier) => tier.name === 'Early bird');
  const general = afro.tiers.find((tier) => tier.name === 'General admission');
  await placeOrder({ viewer: amina, slug: 'afrogroove-night', items: [{ tierId: early.id, quantity: 2 }], channel: 'POINTS', guestNames: ['Amina Mushi', 'Deo Okello'] });
  await placeOrder({ viewer: await viewer(people.joel), slug: 'afrogroove-night', items: [{ tierId: general.id, quantity: 1 }], channel: 'POINTS' });
  await placeOrder({ viewer: null, slug: 'afrogroove-night', items: [{ tierId: general.id, quantity: 2 }], channel: 'CARD', buyerName: 'Grace Nyambura', buyerEmail: 'grace@example.com' });
  for (const slug of ['afrogroove-night', 'bongo-flava-live', 'mishkaki-night-market', 'swahili-language-meetup']) {
    if (events[slug]) await prisma.savedEvent.create({ data: { userId: people.amina.id, eventId: events[slug].id } });
  }

  console.log('— Split pay');
  const split = await createSplit(amina, {
    eventSlug: 'afrogroove-night',
    tierId: general.id,
    guests: [{ name: 'Joel Mwangi', email: 'joel@example.com' }, { name: 'Faridah Kamau' }, { name: 'Deo Okello' }, { name: 'Neema Wanjiru' }],
  });
  await payShare({ slug: split.slug, position: 0, viewer: amina, channel: 'POINTS' });
  await payShare({ slug: split.slug, position: 1, viewer: await viewer(people.joel), channel: 'POINTS' });

  console.log('— Follows');
  const follows = [['kato-4x4'], ['chef-halima'], ['dj-zawadi']];
  for (const [slug] of follows) {
    if (providers[slug]) await prisma.follow.create({ data: { followerId: people.amina.id, providerId: providers[slug].id } });
  }
  for (const organizer of await prisma.organizer.findMany({ where: { name: { in: ['UONGOZI · NYTC', 'Tanzania Embassy, Washington D.C.', 'Afrogroove Collective'] } } })) {
    await prisma.follow.create({ data: { followerId: people.amina.id, organizerId: organizer.id } });
    await prisma.organizer.update({ where: { id: organizer.id }, data: { followersCount: { increment: 1 } } });
  }

  console.log('— Needs, offers and bookings');
  const inDays = (days) => new Date(now.getTime() + days * DAY).toISOString().slice(0, 10);
  const post_ = (user, input) => marketplace.createNeed(user, input);

  // A finished airport run, so Amina has a completed booking she can review.
  const airport = await post_(amina, { title: 'Airport pickup, Entebbe to Kampala', description: 'Two adults, three suitcases, arriving on the late KQ flight. Need flight tracking.', category: 'TRANSPORT', city: 'Entebbe', country: 'UG', currency: 'UGX', budgetMinor: 180_000, startsOn: inDays(-20), endsOn: inDays(-20) });
  const katoViewer = await viewer(people.kato);
  const airportOffer = await marketplace.submitOffer(katoViewer, airport.id, { priceMinor: 170_000, title: 'Airport pickup + flight tracking', note: 'Clean 7-seater, cold water, I track the flight.' });
  const airportBooking = await marketplace.acceptOffer(amina, airportOffer.offerId);
  await marketplace.payBooking(amina, airportBooking.bookingId, { channel: 'CARD' });
  await marketplace.confirmBookingDone(amina, airportBooking.bookingId);

  const driver = await post_(amina, {
    title: 'Driver + 4x4, Kampala to Jinja',
    description: 'Visiting from the US to surprise family. Reliable driver with a 4x4 for village roads, two days plus the return leg.',
    category: 'TRANSPORT', city: 'Kampala', country: 'UG', currency: 'UGX', budgetMinor: 800_000, startsOn: inDays(16), endsOn: inDays(18),
  });
  const katoThread = await transaction((tx) => findOrCreateThread(tx, {
    kind: 'NEED', subject: 'RE: Driver + 4x4, Kampala to Jinja', needId: driver.id, providerId: providers['kato-4x4'].id,
    participants: [{ userId: people.amina.id, role: 'POSTER' }, { userId: people.kato.id, role: 'PROVIDER' }],
  }));
  await sendMessage(katoViewer, katoThread.id, { text: 'Habari! I do the Jinja route weekly. Land Cruiser, village-road ready. Both days I can be with you by 6am.' });
  const driverOffer = await marketplace.submitOffer(katoViewer, driver.id, { priceMinor: 760_000, title: '2 days · 4x4 + driver', note: 'Fuel included · Kampala pickup · village roads OK · flight tracking free' });
  await sendMessage(amina, katoThread.id, { text: 'Yes, return on the 14th around 6pm from Jinja town. Please keep it quiet — it is a surprise.' });

  const quickcars = await prisma.user.findFirst({ where: { provider: { slug: 'quickcars-ug' } } });
  await marketplace.submitOffer(await viewer(quickcars), driver.id, { priceMinor: 600_000, title: '2 days · saloon car', note: 'Cheapest in Kampala.' });
  const quickThread = await prisma.thread.findFirst({ where: { needId: driver.id, providerId: providers['quickcars-ug'].id } });
  await sendMessage(await viewer(quickcars), quickThread.id, { text: 'To confirm the booking send the deposit to my own MTN momo number 0772 555 019 before Friday.' });

  const bookingAccept = await marketplace.acceptOffer(amina, driverOffer.offerId);
  await marketplace.payBooking(amina, bookingAccept.bookingId, { channel: 'CARD' });

  const tents = await post_(amina, {
    title: '3 canopy tents + chairs',
    description: 'Three 20ft canopies and 60 chairs for our Sunday family picnic. Delivery and setup by noon.',
    category: 'TENTS_EQUIPMENT', city: 'Hartford', country: 'US', currency: 'USD', budgetMinor: 60_000, startsOn: inDays(24), endsOn: inDays(24), closesAt: inDays(14),
  });
  for (const [slug, price, title, note] of [
    ['jersey-party-rentals', 54_000, 'Tents + 60 chairs', 'Delivery, setup and teardown included · insured · park-permit compliant'],
    ['mama-t-events-co', 49_000, 'Tents, chairs + 2 serving tables', 'Member discount included · delivery by noon'],
  ]) {
    if (!providers[slug]) continue;
    await marketplace.submitOffer(await viewer({ id: providers[slug].ownerId }), tents.id, { priceMinor: price, title, note });
  }

  const dj = await post_(amina, {
    title: 'DJ for a cookout',
    description: 'Afrobeat + amapiano for a cookout ya washikaji. Four hours, needs own decks and PA.',
    category: 'MUSIC_DJS', city: 'Jinja', country: 'UG', currency: 'UGX', budgetMinor: 400_000, startsOn: inDays(30), endsOn: inDays(30),
  });
  if (providers['dj-zawadi']) {
    await marketplace.submitOffer(await viewer({ id: providers['dj-zawadi'].ownerId }), dj.id, { priceMinor: 350_000, title: '4-hour set + gear', note: 'Decks + PA included · transport from Kampala is the only extra' });
  }

  await post_(await viewer(people.joel), { title: 'Photographer for gospel picnic', description: 'Two hours of candid photos at our church picnic, same-week delivery.', category: 'PHOTOGRAPHY', city: 'Hartford', country: 'US', currency: 'USD', budgetMinor: 25_000, startsOn: inDays(34) });
  await post_(await viewer(people.samuel), { title: 'Airport pickup, late night', description: 'Family of four with luggage arriving on KQ412 at 2:40 AM. Clean 7-seater and flight tracking, please.', category: 'TRANSPORT', city: 'Entebbe', country: 'UG', currency: 'UGX', budgetMinor: 180_000, startsOn: inDays(9) });
  await post_(await viewer(people.deo), { title: 'Wedding convoy · 3 cars', description: 'Harusi convoy: one decorated lead car plus two guest cars. White or silver preferred.', category: 'TRANSPORT', city: 'Kampala', country: 'UG', currency: 'UGX', budgetMinor: 900_000, startsOn: inDays(40) });

  console.log('— Organizer thread');
  const desk = await viewer(people.desk);
  const nytc = events['nyama-choma-festival-2026'];
  const deskThread = await transaction((tx) => findOrCreateThread(tx, {
    kind: 'EVENT', subject: 'NYAMA CHOMA FESTIVAL · UPDATES', eventId: nytc.id,
    participants: [{ userId: people.amina.id, role: 'MEMBER' }, { userId: people.desk.id, role: 'ORGANIZER' }],
  }));
  await sendMessage(desk, deskThread.id, { text: 'Karibu! Parking details for Lincoln Park are on the event page. Enter from Communipaw Ave.' });
  await sendMessage(amina, deskThread.id, { text: 'Asante! Nakuja na familia yote. Is there a spot for the tents we are bringing?' });

  console.log('— Pools');
  const escort = await createPool(await viewer(people.deo), { title: 'Fuel for the police escort', purpose: 'Harusi ya Amina & Deo · Kampala', goalPoints: 12_100, closesAt: inDays(6) });
  const escortSlug = escort.slug;
  for (const [key, points] of [['joel', 3000], ['faridah', 2500], ['samuel', 2000], ['neema', 2400], ['amina', 250]]) {
    await contribute(await viewer(people[key]), escortSlug, { points });
  }
  const djPool = await createPool(amina, { title: 'DJ from Kampala to Jinja', purpose: 'Cookout ya washikaji · Jinja', goalPoints: 16_100, closesAt: inDays(25) });
  await contribute(await viewer(people.deo), djPool.slug, { points: 3000 });
  await contribute(await viewer(people.samuel), djPool.slug, { points: 1600 });

  console.log('— Provider membership & payouts');
  const neema = await viewer(people.neema);
  await saveListing(neema, { name: 'Neema Petals & Drapes', category: 'DECOR_MC', city: 'Nairobi', country: 'KE', headline: 'Wedding and harusi décor, drapes and fresh flowers.', description: 'Neema Petals & Drapes dresses venues for weddings, ruracios and send-offs across Nairobi.', coverUrl: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=1100&q=80', rateMinor: 2_500_000, rateCurrency: 'KES', rateUnit: 'event', serviceAreas: ['Nakuru'] });
  await renewMembership(neema, { channel: 'POINTS' });

  const katoMomo = await prisma.paymentMethod.create({ data: { userId: people.kato.id, kind: 'MTN_MOMO', label: 'MTN MoMo ••0214', last4: '0214', accountEnc: encrypt('+256772000214'), usableForPayouts: true, isDefault: true } });
  await requestWithdrawal(katoViewer, { currency: 'UGX', amountMinor: 100_000, methodId: katoMomo.id });
  await prisma.paymentMethod.create({ data: { userId: people.amina.id, kind: 'MPESA', label: 'M-Pesa ••2210', last4: '2210', accountEnc: encrypt('+254712002210'), usableForPayouts: true, isDefault: true } });

  console.log('— Trust & safety');
  const joelOrder = await prisma.order.findFirst({ where: { buyerId: people.joel.id, status: 'PAID' } });
  const dispute = await openDispute(await viewer(people.joel), { orderId: joelOrder.id, reason: 'CHARGED_INCORRECTLY', detail: 'My card statement shows this ticket twice. I only bought one.' });
  await prisma.dispute.update({ where: { id: dispute.id }, data: { respondBy: new Date(now - DAY) } });
  await escalateOverdueDisputes();
  await fileReport(katoViewer, { targetType: 'PROVIDER', targetId: providers['quickcars-ug'].id, reason: 'IMPERSONATION', detail: 'Their photos are copied from my listing.' });

  console.log('— Finishing touches');
  // History reads naturally: move creation times of the seeded activity back.
  await setBackdated('need', { id: airport.id }, new Date(now - 27 * DAY));
  await setBackdated('need', { id: driver.id }, new Date(now - 3 * DAY));
  await setBackdated('need', { id: tents.id }, new Date(now - 3 * DAY));
  // Nothing seeded should be emailed or texted.
  await prisma.outboundMessage.updateMany({ where: { status: 'PENDING' }, data: { status: 'CANCELLED' } });

  const [users, eventCount, providerCount, entries] = await Promise.all([prisma.user.count(), prisma.event.count(), prisma.provider.count(), prisma.journalEntry.count()]);
  console.log(`✓ Seeded ${users} people, ${eventCount} events, ${providerCount} providers, ${entries} ledger entries.`);
  console.log(`  Sign in as amina@example.com, kato@example.com, events@example.com, admin@example.com or finance@example.com with "${DEMO_PASSWORD}".`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
