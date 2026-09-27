// Posting an event or a need, and editing one already posted. The form gets
// the choices it offers (categories, countries) and, when editing, the
// current values in the shape the inputs use.

import { notFound, unauthorized } from '../errors.js';
import { ESCROW, FEES } from '../fees.js';
import { eventForEditing } from '../services/events.js';
import { needForEditing } from '../services/marketplace.js';
import { COUNTRIES, EVENT_CATEGORIES, EVENT_CATEGORY_ORDER, PROVIDER_CATEGORIES } from '../../shared/format.js';
import { toMajor } from '../../shared/money.js';
import { toZonedInput } from '../../shared/time.js';
import { appUrl, me } from './common.js';

const day = (date) => (date ? date.toISOString().slice(0, 10) : '');
const major = (minor, currency) => (minor == null ? '' : String(toMajor(minor, currency)));

function eventValues(event) {
  return {
    kind: 'event',
    id: event.id,
    slug: event.slug,
    status: event.status,
    title: event.title,
    category: event.category,
    blurb: event.blurb,
    description: event.description,
    coverUrl: event.coverUrl,
    venue: event.venue,
    city: event.city,
    country: event.country,
    currency: event.currency,
    startsAt: toZonedInput(event.startsAt, event.timezone),
    endsAt: toZonedInput(event.endsAt, event.timezone),
    isFree: event.isFree,
    capacity: event.capacity == null ? '' : String(event.capacity),
    allowGuestRsvp: event.allowGuestRsvp,
    tiers: event.tiers.map((tier) => ({ id: tier.id, name: tier.name, price: major(tier.priceMinor, event.currency), qty: tier.capacity == null ? '' : String(tier.capacity), sold: tier.sold })),
    goingCount: event.goingCount,
  };
}

function needValues(need) {
  return {
    kind: 'need',
    id: need.id,
    slug: need.slug,
    status: need.status,
    title: need.title,
    category: need.category,
    description: need.description,
    city: need.city,
    country: need.country,
    currency: need.currency,
    startsOn: day(need.startsOn),
    endsOn: day(need.endsOn),
    budget: major(need.budgetMinor, need.currency),
    closesAt: day(need.closesAt),
    revealContactsOnAccept: need.revealContactsOnAccept,
    notifyOnOffers: need.notifyOnOffers,
    weeklyDigest: need.weeklyDigest,
    offerCount: need.offerCount,
  };
}

export async function createView(viewer, { kind, edit } = {}) {
  if (!viewer) throw unauthorized();
  let editing = null;
  if (edit) {
    editing = kind === 'need' ? await needForEditing(viewer, String(edit)) : await eventForEditing(viewer, String(edit));
    if (!editing) throw notFound('That post does not exist, or it is not yours to edit.');
    editing = kind === 'need' ? needValues(editing) : eventValues(editing);
  }
  return {
    me: await me(viewer),
    appUrl: appUrl(),
    editing,
    fees: { ticketServiceBps: FEES.ticketServiceBps, eventReleaseHours: ESCROW.eventReleaseDelayHours },
    defaults: { country: COUNTRIES[viewer.country] ? viewer.country : 'KE', city: viewer.city || '', organizerName: viewer.name },
    countries: Object.entries(COUNTRIES).map(([code, country]) => ({ code, name: country.name, currency: country.currency, timezone: country.timezone })),
    eventCategories: EVENT_CATEGORY_ORDER.map((code) => ({ code, label: EVENT_CATEGORIES[code] })),
    needCategories: Object.entries(PROVIDER_CATEGORIES).map(([code, category]) => ({ code, label: category.label })),
  };
}
