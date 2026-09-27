// Request body shapes. Unknown keys are stripped, strings are trimmed and
// bounded, so nothing the browser sends reaches a service unchecked.

import { z } from 'zod';
import { PASSWORD_MAX } from './security/passwords.js';

const text = (max, min = 1) => z.string().trim().min(min, min > 1 ? `Use at least ${min} characters.` : 'This is required.').max(max, `Use at most ${max} characters.`);
const optionalText = (max) => z.string().trim().max(max).optional().or(z.literal('').transform(() => undefined));
const email = z.string().trim().toLowerCase().max(254).email('Enter a valid email address.');
const id = z.string().trim().min(1).max(64);
const code = z.string().trim().regex(/^\d{6}$/, 'Enter the 6-digit code.').optional();
const country = z.enum(['KE', 'UG', 'TZ', 'RW', 'US']);
const currency = z.enum(['USD', 'KES', 'UGX', 'TZS', 'RWF']);
const eventCategory = z.enum(['NYAMA_CHOMA', 'MUSIC', 'COMMUNITY', 'WEDDINGS', 'FAITH', 'SPORTS']);
const providerCategory = z.enum(['MUSIC_DJS', 'CATERING', 'TENTS_EQUIPMENT', 'TRANSPORT', 'PHOTOGRAPHY', 'DECOR_MC']);
const minor = z.number().int().nonnegative().max(1_000_000_000_000);
const handle = z.string().trim().toLowerCase().regex(/^[a-z0-9][a-z0-9-]{2,31}$/).optional();
const source = z.string().trim().toLowerCase().max(20).optional();
const isoDate = z.string().trim().refine((value) => !Number.isNaN(Date.parse(value)), 'Enter a valid date.');

export const schemas = {
  signUp: z.object({
    name: text(80, 2),
    email,
    password: z.string().min(1).max(PASSWORD_MAX),
    city: optionalText(80),
    country: country.optional(),
    intent: z.enum(['user', 'advertiser', 'provider']).default('user'),
    ref: handle,
  }),
  signIn: z.object({ email, password: z.string().min(1).max(PASSWORD_MAX) }),
  code: z.object({ code: z.string().trim().regex(/^\d{6}$/, 'Enter the 6-digit code.') }),
  forgot: z.object({ email }),
  reset: z.object({ token: z.string().min(20).max(200), password: z.string().min(1).max(PASSWORD_MAX) }),

  profile: z.object({
    name: text(80, 2).optional(),
    city: optionalText(80),
    country: country.optional(),
    locale: z.enum(['EN', 'SW']).optional(),
    currency: currency.optional(),
    businessName: optionalText(80),
  }),
  changeEmail: z.object({ email, password: z.string().min(1).max(PASSWORD_MAX) }),
  changePassword: z.object({ currentPassword: z.string().min(1).max(PASSWORD_MAX), newPassword: z.string().min(1).max(PASSWORD_MAX) }),
  phone: z.object({ phone: text(24, 7) }),
  phoneVerify: z.object({ phone: text(24, 7), code: z.string().trim().regex(/^\d{6}$/, 'Enter the 6-digit code.') }),
  twoFactor: z.object({ enabled: z.boolean(), password: z.string().min(1).max(PASSWORD_MAX) }),
  password: z.object({ password: z.string().min(1).max(PASSWORD_MAX) }),
  notificationPref: z.object({
    topic: z.enum(['REMINDERS', 'OFFERS', 'LEADS', 'MONEY', 'SOCIAL', 'NEWS']),
    channel: z.enum(['inApp', 'email', 'sms', 'whatsapp']),
    enabled: z.boolean(),
  }),
  notificationSwitches: z.object({ quietHours: z.boolean().optional(), weeklyDigest: z.boolean().optional(), muteNonEssential: z.boolean().optional() }),
  paymentMethod: z.object({ kind: z.enum(['MPESA', 'MTN_MOMO', 'AIRTEL_MONEY', 'BANK']), account: text(40, 6), bankName: optionalText(30) }),
  markRead: z.object({ ids: z.array(id).max(100).optional() }),

  createEvent: z.object({
    title: text(120, 3),
    category: eventCategory,
    blurb: text(240, 10),
    description: text(4000, 20),
    coverUrl: z.string().trim().max(500).refine((value) => value.startsWith('/') || value.startsWith('https://'), 'Use an uploaded image or an https link.'),
    venue: text(200, 3),
    city: text(80, 2),
    country,
    currency: currency.optional(),
    timezone: z.string().max(64).optional(),
    startsAt: isoDate,
    endsAt: isoDate.optional(),
    isFree: z.boolean(),
    capacity: z.number().int().positive().max(1_000_000).optional(),
    organizerName: optionalText(80),
    allowComments: z.boolean().optional(),
    allowGuestRsvp: z.boolean().optional(),
    publish: z.boolean().default(true),
    tiers: z.array(z.object({ name: text(60), description: optionalText(200), priceMinor: minor, capacity: z.number().int().positive().max(1_000_000).optional() })).max(8).optional(),
    schedule: z.array(z.object({ timeLabel: text(20), title: text(80), description: text(200), tag: text(20) })).max(20).optional(),
  }),
  eventStatus: z.object({ action: z.enum(['publish', 'pause', 'archive', 'cancel']), reason: optionalText(300) }),
  rsvp: z.object({
    name: optionalText(80),
    email: email.optional(),
    partySize: z.number().int().min(1).max(20).default(1),
    status: z.enum(['GOING', 'INTERESTED']).default('GOING'),
    ref: handle,
    source,
  }),
  rsvpUpdate: z.object({ reminderPlan: z.enum(['7d,1d,2h', '1d,2h', '1d', 'off']).optional(), calendarAdded: z.boolean().optional() }),
  track: z.object({ kind: z.enum(['view', 'cta', 'share']), source }),
  cart: z.object({
    items: z.array(z.object({ tierId: id, quantity: z.number().int().min(0).max(10) })).min(1).max(8),
    promoCode: z.string().trim().toUpperCase().max(24).optional().or(z.literal('').transform(() => undefined)),
    channel: z.enum(['CARD', 'POINTS', 'DOOR']),
  }),
  order: z.object({
    items: z.array(z.object({ tierId: id, quantity: z.number().int().min(0).max(10) })).min(1).max(8),
    promoCode: z.string().trim().toUpperCase().max(24).optional().or(z.literal('').transform(() => undefined)),
    channel: z.enum(['CARD', 'POINTS', 'DOOR']),
    buyerName: optionalText(80),
    buyerEmail: email.optional(),
    guestNames: z.array(z.string().trim().max(80)).max(10).optional(),
    ref: handle,
    source,
    code,
  }),
  waitlist: z.object({ tierId: id, email: email.optional(), name: optionalText(80) }),
  scan: z.object({ code: text(120) }),

  createNeed: z.object({
    title: text(120, 3),
    description: text(2000, 10),
    category: providerCategory,
    city: text(80, 2),
    country,
    currency: currency.optional(),
    startsOn: isoDate.optional(),
    endsOn: isoDate.optional(),
    budget: z.string().trim().max(40).optional(),
    relatedEventSlug: z.string().trim().max(80).optional(),
    closesAt: isoDate.optional(),
    revealContactsOnAccept: z.boolean().optional(),
    notifyOnOffers: z.boolean().optional(),
    weeklyDigest: z.boolean().optional(),
    allowComments: z.boolean().optional(),
  }),
  needStatus: z.object({ action: z.enum(['pause', 'resume', 'close']), reason: optionalText(200) }),
  offer: z.object({ price: text(40), title: optionalText(120), note: optionalText(600) }),
  question: z.object({ question: text(1000, 2) }),
  offerAction: z.object({ action: z.enum(['accept', 'counter', 'decline', 'revise', 'withdraw']), note: optionalText(600), price: optionalText(40) }),
  pay: z.object({ channel: z.enum(['CARD', 'POINTS']), code }),

  message: z.object({ text: z.string().trim().max(2000).optional().default(''), fileId: id.optional() }),
  report: z.object({
    targetType: z.enum(['USER', 'THREAD', 'MESSAGE', 'EVENT', 'NEED', 'PROVIDER', 'REVIEW']),
    targetId: id,
    reason: z.enum(['SCAM', 'OFF_PLATFORM_PAYMENT', 'HARASSMENT', 'IMPERSONATION', 'SPAM', 'OTHER']),
    detail: optionalText(1000),
  }),

  listing: z.object({
    name: text(80, 2).optional(),
    category: providerCategory.optional(),
    city: text(80, 2).optional(),
    country: country.optional(),
    headline: optionalText(160),
    description: optionalText(3000),
    coverUrl: z.string().trim().max(500).optional(),
    rate: optionalText(40),
    rateUnit: optionalText(20),
    serviceAreas: z.array(text(80)).max(12).optional(),
    services: z.array(z.object({ title: text(80), description: optionalText(300), rate: optionalText(40), rateUnit: optionalText(20) })).max(12).optional(),
  }),
  serviceRequest: z.object({ name: optionalText(80), email: email.optional(), message: text(2000, 5) }),
  review: z.object({ rating: z.number().int().min(1).max(5), body: text(1200, 10), bookingId: id.optional() }),
  reply: z.object({ text: text(600, 2) }),
  membership: z.object({ channel: z.enum(['CARD', 'POINTS']), code }),

  verificationSection: z.object({
    section: z.enum(['business', 'identity', 'proof', 'payout']),
    fields: z.record(z.string().max(40), z.union([z.string().max(3000), z.number(), z.boolean()])),
  }),
  verificationDocument: z.object({ kind: z.enum(['id', 'proof', 'portfolio']), fileId: id }),

  topUp: z.object({ usd: z.number().int().min(1).max(500) }),
  transfer: z.object({ recipient: text(254), points: z.number().int().positive().max(500_000), note: optionalText(140), code }),
  cashOut: z.object({ points: z.number().int().positive().max(10_000_000), methodId: id, code }),
  createPool: z.object({ title: text(80, 3), purpose: optionalText(160), goalPoints: z.number().int().min(100).max(100_000_000), eventSlug: z.string().max(80).optional(), closesAt: isoDate.optional() }),
  contribute: z.object({ points: z.number().int().positive().max(500_000), note: optionalText(140) }),
  withdrawal: z.object({ currency: currency, amount: text(40), methodId: id, code }),

  createSplit: z.object({ eventSlug: text(80), tierId: id, guests: z.array(z.object({ name: text(80), email: email.optional() })).min(1).max(9) }),
  payShare: z.object({ channel: z.enum(['CARD', 'POINTS']), name: optionalText(80), email: email.optional(), code }),
  stepUp: z.object({ code }),

  openDispute: z.object({
    orderId: id.optional(),
    bookingId: id.optional(),
    reason: z.enum(['EVENT_CANCELLED', 'NO_SHOW', 'NOT_AS_DESCRIBED', 'CHARGED_INCORRECTLY']),
    detail: text(2000, 10),
    evidenceFileIds: z.array(id).max(10).optional(),
  }),
  disputeAction: z.object({ action: z.enum(['refund', 'partial', 'contest', 'withdraw']), amount: optionalText(40), note: optionalText(1000) }),

  adminReport: z.object({ action: z.enum(['dismiss', 'warn', 'suspend']) }),
  adminUser: z.object({ action: z.enum(['suspend', 'reinstate']), reason: optionalText(200) }),
  adminVerification: z.object({ decision: z.enum(['approve', 'info', 'reject']), note: optionalText(500) }),
  adminContent: z.object({ kind: z.enum(['event', 'need']), id, action: z.enum(['feature', 'unfeature', 'hide', 'unhide']), reason: optionalText(200) }),
  adminSetting: z.object({ key: z.enum(['providerSignups', 'autoScamDetection', 'guestRsvp', 'poolReleaseReview']), value: z.boolean() }),
  adminDispute: z.object({ outcome: z.enum(['refund', 'partial', 'deny']), amount: optionalText(40), note: optionalText(1000) }),
  payoutAction: z.object({ action: z.enum(['paid', 'failed']), externalRef: optionalText(80), reason: optionalText(200) }),
};

// Editing reuses the posting rules. Tiers carry their id so existing ones
// are updated rather than replaced.
schemas.updateEvent = schemas.createEvent.omit({ publish: true, organizerName: true }).extend({
  tiers: z.array(z.object({ id: id.optional(), name: text(60), description: optionalText(200), priceMinor: minor, capacity: z.number().int().positive().max(1_000_000).optional() })).max(8).optional(),
});
schemas.updateNeed = schemas.createNeed.omit({ relatedEventSlug: true });

export const querySchemas = {
  events: z.object({ category: eventCategory.optional(), city: z.string().max(80).optional(), q: z.string().max(80).optional(), limit: z.coerce.number().int().min(1).max(100).optional() }),
  providers: z.object({ category: providerCategory.optional(), city: z.string().max(80).optional(), q: z.string().max(80).optional(), limit: z.coerce.number().int().min(1).max(100).optional() }),
  needs: z.object({ category: providerCategory.optional(), city: z.string().max(80).optional(), limit: z.coerce.number().int().min(1).max(50).optional() }),
  finance: z.object({ range: z.enum(['7d', '30d', '90d']).default('30d'), filter: z.enum(['ALL', 'TICKETS', 'BOOKINGS', 'MEMBERSHIPS', 'POINTS', 'PAYOUTS', 'REFUNDS']).default('ALL') }),
  users: z.object({ q: z.string().max(80).optional() }),
  cursor: z.object({ cursor: z.string().regex(/^\d+$/).optional() }),
};
