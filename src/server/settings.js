// Operator switches, editable from the admin console. Read through a short
// in-memory cache; writes clear it.

import { prisma } from './db.js';

export const SETTING_DEFAULTS = Object.freeze({
  providerSignups: true,
  autoScamDetection: true,
  guestRsvp: true,
  poolReleaseReview: false,
});

export const SETTING_COPY = Object.freeze({
  providerSignups: ['New vendor sign-ups', 'Pause during fraud waves; existing vendors unaffected.'],
  autoScamDetection: ['Automated scam detection', 'Scan masked threads for payment-redirect language.'],
  guestRsvp: ['Guest RSVP without account', 'Growth loop; only disable under attack.'],
  poolReleaseReview: ['Manual review of pool releases > $1,000', 'Adds finance review before large harambee payouts.'],
});

const CACHE_MS = 30_000;
let cache = null;

export async function getSettings() {
  if (cache && Date.now() - cache.at < CACHE_MS) return cache.values;
  const rows = await prisma.platformSetting.findMany();
  const values = { ...SETTING_DEFAULTS };
  for (const row of rows) if (row.key in values) values[row.key] = Boolean(row.value);
  cache = { at: Date.now(), values };
  return values;
}

export async function setSetting(db, key, value, actorId) {
  if (!(key in SETTING_DEFAULTS)) throw new Error(`Unknown setting ${key}`);
  await db.platformSetting.upsert({
    where: { key },
    create: { key, value: Boolean(value), updatedById: actorId },
    update: { value: Boolean(value), updatedById: actorId },
  });
  cache = null;
}
