// Display helpers shared by the page loaders, so every screen shows dates,
// categories and prices the same way.

import { formatCompact, formatMoney } from './money.js';

export const EVENT_CATEGORIES = Object.freeze({
  NYAMA_CHOMA: 'Nyama choma',
  MUSIC: 'Music + DJs',
  COMMUNITY: 'Community',
  WEDDINGS: 'Weddings',
  FAITH: 'Faith',
  SPORTS: 'Sports',
});

export const EVENT_CATEGORY_ORDER = ['NYAMA_CHOMA', 'MUSIC', 'COMMUNITY', 'WEDDINGS', 'FAITH', 'SPORTS'];

export function eventCategoryFromLabel(label) {
  return Object.entries(EVENT_CATEGORIES).find(([, value]) => value === label)?.[0] || null;
}

export const PROVIDER_CATEGORIES = Object.freeze({
  MUSIC_DJS: { upper: 'MUSIC & DJS', label: 'Music & DJs' },
  CATERING: { upper: 'CATERING & CHEFS', label: 'Catering & chefs' },
  TENTS_EQUIPMENT: { upper: 'TENTS & EQUIPMENT', label: 'Tents & equipment' },
  TRANSPORT: { upper: 'TRANSPORT & DRIVERS', label: 'Transport & drivers' },
  PHOTOGRAPHY: { upper: 'PHOTOGRAPHY', label: 'Photography' },
  DECOR_MC: { upper: 'DECOR & MC', label: 'Décor & MC' },
});

export function providerCategoryFromLabel(label) {
  const needle = String(label || '').trim().toLowerCase();
  return (
    Object.entries(PROVIDER_CATEGORIES).find(
      ([key, value]) => key.toLowerCase() === needle || value.label.toLowerCase() === needle || value.upper.toLowerCase() === needle,
    )?.[0] || null
  );
}

export const COUNTRIES = Object.freeze({
  KE: { name: 'Kenya', currency: 'KES', timezone: 'Africa/Nairobi' },
  UG: { name: 'Uganda', currency: 'UGX', timezone: 'Africa/Kampala' },
  TZ: { name: 'Tanzania', currency: 'TZS', timezone: 'Africa/Dar_es_Salaam' },
  RW: { name: 'Rwanda', currency: 'RWF', timezone: 'Africa/Kigali' },
  US: { name: 'United States', currency: 'USD', timezone: 'America/New_York' },
});

const AFRICAN_ZONE_NAMES = {
  'Africa/Nairobi': 'EAT',
  'Africa/Kampala': 'EAT',
  'Africa/Dar_es_Salaam': 'EAT',
  'Africa/Kigali': 'CAT',
};

function parts(date, timeZone, options) {
  return Object.fromEntries(
    new Intl.DateTimeFormat('en-US', { timeZone, ...options }).formatToParts(date).map((part) => [part.type, part.value]),
  );
}

// "SAT · 8 AUG"
export function dayLabel(date, timeZone = 'UTC') {
  const p = parts(date, timeZone, { weekday: 'short', day: 'numeric', month: 'short' });
  return `${p.weekday} · ${p.day} ${p.month}`.toUpperCase();
}

// "2:00 PM EDT", "3:00 PM EAT"
export function timeLabel(date, timeZone = 'UTC') {
  const p = parts(date, timeZone, { hour: 'numeric', minute: '2-digit', timeZoneName: 'short' });
  const zone = AFRICAN_ZONE_NAMES[timeZone] || p.timeZoneName;
  return `${p.hour}:${p.minute} ${p.dayPeriod} ${zone}`;
}

// "26 JUL", "3 OCT"
export function shortDate(date, timeZone = 'UTC') {
  const p = parts(date, timeZone, { day: 'numeric', month: 'short' });
  return `${p.day} ${p.month}`.toUpperCase();
}

// "AUG 2026"
export function monthYear(date, timeZone = 'UTC') {
  const p = parts(date, timeZone, { month: 'short', year: 'numeric' });
  return `${p.month} ${p.year}`.toUpperCase();
}

// "12 MIN AGO", "1 HR AGO", "YESTERDAY", "3 DAYS AGO", then a date.
export function relativeTime(date, now = new Date()) {
  const seconds = Math.max(0, Math.round((now - date) / 1000));
  if (seconds < 60) return 'JUST NOW';
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes} MIN AGO`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} ${hours === 1 ? 'HR' : 'HRS'} AGO`;
  const days = Math.round(hours / 24);
  if (days === 1) return 'YESTERDAY';
  if (days < 7) return `${days} DAYS AGO`;
  return shortDate(date);
}

// "TUE", "10:14" style stamps for message threads.
// Conversation list stamps in the reader's time zone: "14:05" today,
// "TUE" this week, "3 OCT" before that.
export function threadStamp(date, timeZone = 'UTC', now = new Date()) {
  const day = (value) => new Intl.DateTimeFormat('en-CA', { timeZone, year: 'numeric', month: '2-digit', day: '2-digit' }).format(value);
  if (day(date) === day(now)) return new Intl.DateTimeFormat('en-GB', { timeZone, hour: '2-digit', minute: '2-digit' }).format(date);
  if (now - date < 6 * 24 * 3600 * 1000) return new Intl.DateTimeFormat('en-US', { timeZone, weekday: 'short' }).format(date).toUpperCase();
  return shortDate(date, timeZone);
}

// "TUE 14:05" in the given time zone.
export function messageStamp(date, timeZone = 'UTC') {
  const weekday = new Intl.DateTimeFormat('en-US', { timeZone, weekday: 'short' }).format(date).toUpperCase();
  const time = new Intl.DateTimeFormat('en-GB', { timeZone, hour: '2-digit', minute: '2-digit' }).format(date);
  return `${weekday} ${time}`;
}

export function initials(name) {
  const words = String(name || '').replace(/[^\p{L}\p{N}\s&]/gu, ' ').split(/\s+/).filter(Boolean);
  if (!words.length) return '··';
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
}

// "Amina M."
export function shortName(name) {
  const words = String(name || '').trim().split(/\s+/);
  if (words.length < 2) return words[0] || 'Member';
  return `${words[0]} ${words[words.length - 1][0]}.`;
}

export function maskEmail(email) {
  const [local, domain] = String(email).split('@');
  if (!domain) return '***';
  return `${local.slice(0, 2)}***@${domain}`;
}

// "FREE", "FROM $20", "UGX 20,000". `tierCount` is the number of paid tiers
// on sale; "FROM" only appears when there is more than one price.
export function priceLabel({ isFree, priceFromMinor, currency, tierCount = 1 }) {
  if (isFree || priceFromMinor == null) return 'FREE';
  const amount = formatMoney(priceFromMinor, currency, { cents: false });
  return tierCount > 1 ? `FROM ${amount}` : amount;
}

// "UGX 350K/set", "FROM $490", "TZS 15K/plate", "QUOTE"
export function rateLabel(minor, currency, unit) {
  if (minor == null) return 'QUOTE';
  const amount = formatCompact(minor, currency);
  return unit ? `${amount}/${unit}` : `FROM ${amount}`;
}

export function ratingLabel(provider) {
  if (!provider.ratingCount) return 'NEW';
  return (provider.ratingSum / provider.ratingCount).toFixed(1);
}

export function stars(rating) {
  const full = Math.max(0, Math.min(5, Math.round(rating)));
  return '★★★★★'.slice(0, full) + '☆☆☆☆☆'.slice(0, 5 - full);
}

export function slugify(value) {
  return String(value)
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 64) || 'post';
}
