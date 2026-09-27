// Notification preferences. A row exists only once someone changes a default,
// so most people never cost a write.

export const TOPICS = Object.freeze([
  { topic: 'REMINDERS', title: 'Reminders (7d · 1d · 2h)', member: "Events you RSVP'd or booked", provider: "Events you RSVP'd or booked" },
  { topic: 'OFFERS', title: 'Offers & replies', member: 'On your needs and threads', provider: 'On your offers and threads' },
  { topic: 'LEADS', title: 'Matched leads', member: 'Providers matching your posts', provider: 'New needs in your categories and cities' },
  { topic: 'MONEY', title: 'Money movement', member: 'Top-ups, sends, escrow, payouts', provider: 'Top-ups, sends, escrow, payouts' },
  { topic: 'SOCIAL', title: 'Comments & referrals', member: 'Activity on your posts and links', provider: 'Activity on your posts and links' },
  { topic: 'NEWS', title: 'Twendezetu news', member: 'Product updates, city launches', provider: 'Product updates, city launches' },
]);

export const DEFAULT_PREFERENCES = Object.freeze({
  REMINDERS: { inApp: true, email: true, sms: false, whatsapp: true },
  OFFERS: { inApp: true, email: true, sms: true, whatsapp: true },
  LEADS: { inApp: true, email: true, sms: false, whatsapp: false },
  MONEY: { inApp: true, email: true, sms: true, whatsapp: false },
  SOCIAL: { inApp: true, email: false, sms: false, whatsapp: false },
  NEWS: { inApp: false, email: true, sms: false, whatsapp: false },
});

export async function preferencesFor(db, userId) {
  const rows = await db.notificationPreference.findMany({ where: { userId } });
  const prefs = structuredClone(DEFAULT_PREFERENCES);
  for (const row of rows) {
    prefs[row.topic] = { inApp: row.inApp, email: row.email, sms: row.sms, whatsapp: row.whatsapp };
  }
  return prefs;
}

// Security and money notices cannot be switched off entirely: if every
// channel for MONEY is off, email is kept so account activity is never silent.
export function enforceFloor(topic, channels) {
  if (topic === 'MONEY' && !channels.inApp && !channels.email && !channels.sms && !channels.whatsapp) {
    return { ...channels, email: true };
  }
  return channels;
}

const TIMEZONE_BY_COUNTRY = { KE: 'Africa/Nairobi', UG: 'Africa/Kampala', TZ: 'Africa/Dar_es_Salaam', RW: 'Africa/Kigali', US: 'America/New_York' };

export function timezoneFor(country) {
  return TIMEZONE_BY_COUNTRY[country] || 'Africa/Nairobi';
}

// Quiet hours run 21:00–07:00 in the person's local time. Returns the moment
// a text message may go out: now, or 07:00 the next morning.
export function afterQuietHours(now, timezone) {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat('en-GB', { timeZone: timezone, hour: '2-digit', minute: '2-digit', hourCycle: 'h23' })
      .formatToParts(now)
      .map((part) => [part.type, part.value]),
  );
  const hour = Number(parts.hour);
  const minute = Number(parts.minute);
  if (hour >= 7 && hour < 21) return now;
  const minutesUntilSeven = hour >= 21 ? (24 - hour + 7) * 60 - minute : (7 - hour) * 60 - minute;
  return new Date(now.getTime() + minutesUntilSeven * 60 * 1000);
}
