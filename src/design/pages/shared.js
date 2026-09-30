// Small helpers shared by the page logic modules.

import { convert, formatMoney, DISPLAY_CURRENCIES } from '@/shared/money';
import { LANGUAGES, words } from '../i18n';

export const COLORS = Object.freeze({
  ink: '#14201F',
  forest: '#1F3A38',
  cream: '#F7F1E6',
  paper: '#FFFDF8',
  sand: '#EFE7D6',
  // The brand accent: maroon from the logo. `clay` fills and marks on
  // light backgrounds (text on it is cream); `clayLight` is its light
  // partner for accents on the dark green panels.
  clay: '#820101',
  clayLight: '#E9B4AC',
  rust: '#820101',
  sage: '#7B8B6E',
  red: '#B8463A',
  muted: '#6E6155',
});

// Resolves true once the text is on the clipboard, false if the browser
// refused (no permission, or an insecure page).
export async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

export function scrollShelf(id, direction) {
  if (typeof document === 'undefined') return;
  const shelf = document.getElementById(id);
  if (shelf) shelf.scrollBy({ left: direction * Math.min(shelf.clientWidth * 0.9, 560), behavior: 'smooth' });
}

export function nextCurrency(current) {
  return DISPLAY_CURRENCIES[(DISPLAY_CURRENCIES.indexOf(current) + 1) % DISPLAY_CURRENCIES.length];
}

// An event's price label in the viewer's chosen currency. Converted amounts
// are marked with "≈" so nobody mistakes an estimate for the ticket price.
export function eventPrice(event, currency, rates) {
  if (event.isFree || event.priceFromMinor == null) return 'FREE';
  const from = event.tierCount > 1 ? 'FROM ' : '';
  if (!currency || currency === event.currency || !rates) return `${from}${formatMoney(event.priceFromMinor, event.currency, { cents: false })}`;
  const converted = convert(event.priceFromMinor, event.currency, currency, rates);
  return `${from}≈ ${formatMoney(converted, currency, { cents: false })}`;
}

export function readPreference(key, fallback) {
  try {
    return window.localStorage.getItem(`twendezetu:${key}`) ?? fallback;
  } catch {
    return fallback;
  }
}

export function writePreference(key, value) {
  try {
    window.localStorage.setItem(`twendezetu:${key}`, value);
  } catch {
    // Private browsing can refuse storage; the choice lasts for this visit.
  }
}

export function toggleStyle(on, { onBg = COLORS.clay, offBg = COLORS.sand, onKnob = '26px', offKnob = '2px' } = {}) {
  return { bg: on ? onBg : offBg, knobLeft: on ? onKnob : offKnob };
}

export function selected(active, { bg = COLORS.forest, fg = COLORS.cream, idleBg = COLORS.cream, idleFg = COLORS.ink } = {}) {
  return { bg: active ? bg : idleBg, fg: active ? fg : idleFg };
}

export function field(set, key) {
  return (event) => set((state) => ({ ...state, [key]: event.target.value, formError: null }));
}

export function patch(set, values) {
  set((state) => ({ ...state, ...values }));
}

// Ends a sentence without doubling a full stop after "Co." or "Amina M.".
export function sentence(text) {
  return /[.!?]$/.test(text) ? text : `${text}.`;
}

export const EMAIL_PATTERN = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

export function shareLinks(url, text, title) {
  return {
    waHref: `https://wa.me/?text=${encodeURIComponent(`${text} ${url}`)}`,
    fbHref: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
    emHref: `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(`${text}\n\n${url}`)}`,
    xHref: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
  };
}

// Runs a money action; if two-step verification asks for a code, texts one,
// asks for it and retries once. Returns undefined when the person cancels.
export async function withStepUp(ctx, call) {
  try {
    return await call(undefined);
  } catch (error) {
    if (error.status !== 403 || !/code we texted/i.test(error.message)) throw error;
    const code = await ctx.stepUp(error);
    if (!code) return undefined;
    return call(code);
  }
}

// ── The shared frame (src/design/templates/shell.js) ─────────────────────

// Vendor trades in each language: [key, EN, SW, FR, ES].
const VENDOR_MENU = [
  ['MUSIC_DJS', 'Music & DJs', 'Muziki na ma-DJ', 'Musique et DJ', 'Música y DJ'],
  ['CATERING', 'Catering & chefs', 'Wapishi', 'Traiteurs et chefs', 'Catering y chefs'],
  ['TENTS_EQUIPMENT', 'Tents & equipment', 'Mahema na vifaa', 'Tentes et matériel', 'Carpas y equipos'],
  ['TRANSPORT', 'Transport & drivers', 'Usafiri na madereva', 'Transport et chauffeurs', 'Transporte y conductores'],
  ['PHOTOGRAPHY', 'Photography', 'Picha', 'Photographie', 'Fotografía'],
  ['DECOR_MC', 'Décor & MC', 'Mapambo na MC', 'Décoration et MC', 'Decoración y MC'],
];

const LANG_COLUMN = { EN: 1, SW: 2, FR: 3, ES: 4 };

function vendorLabel(entry, locale) {
  return entry[LANG_COLUMN[locale] || 1];
}

const SECTIONS = ['home', 'now', 'week', 'events', 'trending', 'vendors', 'saved', 'tickets', 'organizers', 'post', 'me'];

const YEAR = 60 * 60 * 24 * 365;

function setCookie(name, value, maxAge = YEAR) {
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${maxAge}; samesite=lax`;
}

// Switches the site's language. The choice is kept on this device (a
// cookie, so the server draws the next page in it too) and saved to the
// account when signed in; then the page is drawn again in the new words.
async function switchLanguage(me, ctx, locale) {
  if (me.locale === locale) return;
  setCookie('tz_lang', locale);
  if (me.signedIn) {
    // The device choice already applies; the account copy is a convenience
    // for other devices, so a failure here does not stop the switch.
    await ctx.api.patch('/api/account/profile', { locale }).catch(() => {});
  }
  ctx.router.refresh();
}

// Folds the language picker down to a globe, or opens it again. The cookie
// lets the server draw it the same way on the next page.
function foldLanguages(closed) {
  setCookie('tz_langpill', closed ? 'closed' : 'open');
  document.querySelector('.tz-langpick')?.setAttribute('data-closed', closed ? 'true' : 'false');
}

function langPillClosed(me) {
  if (typeof document === 'undefined') return Boolean(me.langPillClosed);
  const match = document.cookie.match(/(?:^|; )tz_langpill=(\w+)/);
  return match ? match[1] === 'closed' : Boolean(me.langPillClosed);
}

// `active` names the section the page belongs to; `q` refills the search box.
// The home page also passes the city picker's `cities`, the picked `city`
// and the people someone follows (`faces`) for the rail.
// `lift` raises the language picker above a bar pinned to the bottom.
export function shellValues(me, ctx, { active = null, q = '', cities = null, city = null, faces = [], lift = false } = {}) {
  const t = words(me.locale);
  const current = Object.fromEntries(SECTIONS.map((key) => [key, key === active ? 'page' : 'false']));
  const unread = me.unread > 0 ? (me.unread > 9 ? '9+' : String(me.unread)) : '';
  const pickCity = (name) => () => {
    if (name) setCookie('tz_city', name);
    else setCookie('tz_city', '', 0);
    // Closes the menu the pick was made in before the page changes.
    document.querySelector('.tz-city[open]')?.removeAttribute('open');
    ctx.navigate(name ? `/?city=${encodeURIComponent(name)}` : '/?city=');
  };
  return {
    t,
    signedIn: me.signedIn,
    signedOut: !me.signedIn,
    name: me.name || '',
    homeCity: me.city || '',
    initials: me.initials || '',
    unread,
    bellLabel: unread ? `${t.notifications}, ${unread}` : t.notifications,
    isVendor: me.isProvider,
    isStaff: me.isStaff,
    isFinance: me.isFinance,
    meHref: me.signedIn ? '/my-twende' : '/sign-in',
    myEventsHref: me.signedIn ? '/my-twende?tab=upcoming' : '/sign-in?next=%2Fmy-twende',
    organizerHref: me.signedIn ? '/organizer-analytics' : '/create-event',
    current,
    q,
    hasCities: Boolean(cities?.length),
    cityName: city || t.everywhere,
    cities: cities
      ? [
          { label: t.everywhere, count: '', current: city ? 'false' : 'true', pick: pickCity(null) },
          ...cities.map((entry) => ({ label: entry.name, count: String(entry.count), current: entry.name === city ? 'true' : 'false', pick: pickCity(entry.name) })),
        ]
      : [],
    railFaces: faces.slice(0, 4),
    localeCode: me.locale || 'EN',
    languages: LANGUAGES.map(([code, name]) => ({
      code,
      name,
      lang: code.toLowerCase(),
      pressed: (me.locale || 'EN') === code ? 'true' : 'false',
      pick: () => switchLanguage(me, ctx, code),
    })),
    langPillClosed: langPillClosed(me) ? 'true' : 'false',
    langLift: lift ? 'true' : 'false',
    foldLanguages: () => foldLanguages(true),
    unfoldLanguages: () => foldLanguages(false),
    vendorLabels: Object.fromEntries(VENDOR_MENU.map((entry) => [entry[0], vendorLabel(entry, me.locale)])),
    search: (event) => {
      const value = event.target.querySelector('input[name="q"]')?.value.trim();
      window.location.assign(value ? `/events?q=${encodeURIComponent(value)}` : '/events');
    },
    signOut: async () => {
      try {
        await ctx.api.post('/api/auth/sign-out');
      } finally {
        window.location.assign('/');
      }
    },
  };
}

// ── Cards (eventCard, liveCard and vendorCard in templates/shell.js) ─────

const EVENT_CATEGORY_KEYS = { 'Nyama choma': 'NYAMA_CHOMA', 'Music + DJs': 'MUSIC', Community: 'COMMUNITY', Weddings: 'WEDDINGS', Faith: 'FAITH', Sports: 'SPORTS' };

// Shares a link: the phone's share sheet where there is one, else the
// clipboard.
export async function shareLink(ctx, t, path, title) {
  const url = new URL(path, window.location.origin).toString();
  if (navigator.share) {
    try {
      await navigator.share({ title, text: `${title} on Twendezetu`, url });
    } catch {
      // Closing the share sheet is not an error.
    }
    return;
  }
  if (await copyText(url)) ctx.toast(t.copied);
  else window.open(`https://wa.me/?text=${encodeURIComponent(`${title} ${url}`)}`, '_blank', 'noopener');
}

function cityOnly(city) {
  return String(city || '').split(' · ').pop().split(', ')[0];
}

// Saves or unsaves an event for the signed-in person. Taps are kept in the
// page's `saved` and `unsaved` sets of slugs, laid over what the server
// said (see savedSet), so the hearts answer at once and survive a reload
// of the page's data.
export function saveToggler(me, set, ctx, t) {
  return (event) => {
    if (!me.signedIn) return ctx.navigate(`/sign-in?next=${encodeURIComponent(window.location.pathname + window.location.search)}`);
    return ctx.run(`save:${event.slug}`, async () => {
      const result = await ctx.api.post(`/api/events/${event.slug}/save`);
      set((current) => {
        const saved = new Set(current.saved);
        const unsaved = new Set(current.unsaved);
        if (result.saved) {
          saved.add(event.slug);
          unsaved.delete(event.slug);
        } else {
          saved.delete(event.slug);
          unsaved.add(event.slug);
        }
        return { ...current, saved, unsaved };
      });
      return result;
    }, { reloadAfter: false, success: (result) => (result.saved ? t.saved : t.removed) });
  };
}

// The slugs to show as saved: the server's list plus taps since.
export function savedSet(state, fromServer = []) {
  const unsaved = state.unsaved || new Set();
  return new Set([...fromServer, ...(state.saved || [])].filter((slug) => !unsaved.has(slug)));
}

// The values one event card binds to. `saved` is the set of event slugs the
// person has saved; `onSave` toggles one (it sends guests to sign in).
export function eventCardValues(event, { t, currency = null, rates = null, saved, onSave, ctx }) {
  // dayLabel() gives "SAT · 8 AUG".
  const [dow = '', dayMonth = ''] = String(event.date || '').split(' · ');
  const [day = '', mon = ''] = dayMonth.split(' ');
  const onNow = event.when === 'ON NOW';
  const today = event.when === 'TODAY' || onNow;
  const categoryKey = event.category || EVENT_CATEGORY_KEYS[event.cat];
  const isSaved = saved?.has(event.slug) || false;
  const price = eventPrice(event, currency, rates);
  const city = cityOnly(event.city);
  return {
    href: event.href,
    img: event.img,
    title: event.title,
    price: price === 'FREE' ? t.free : price,
    rank: event.rank || '',
    organizer: event.organizer,
    organizerVerified: event.organizerVerified,
    dow: onNow ? t.onNow : today ? t.today : dow,
    day,
    mon,
    today: today ? 'true' : 'false',
    cta: event.isFree ? t.rsvp : t.tickets,
    ctaHref: event.isFree ? event.href : `/checkout?event=${encodeURIComponent(event.slug)}`,
    saveLabel: isSaved ? t.unsave : t.save,
    savedPressed: isSaved ? 'true' : 'false',
    toggleSave: () => onSave(event),
    shareLabel: t.share,
    share: () => shareLink(ctx, t, event.href, event.title),
    chips: [
      ...(city ? [{ label: city, href: `/events?city=${encodeURIComponent(event.city)}` }] : []),
      ...(categoryKey ? [{ label: t.catChip[categoryKey], href: `/events?category=${categoryKey}` }] : []),
    ],
  };
}

function titleCase(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/(^|[\s&/-])(\p{L})/gu, (match, space, letter) => space + letter.toUpperCase());
}

const VENDOR_CATEGORY_KEYS = { 'MUSIC & DJS': 'MUSIC_DJS', 'CATERING & CHEFS': 'CATERING', 'TENTS & EQUIPMENT': 'TENTS_EQUIPMENT', 'TRANSPORT & DRIVERS': 'TRANSPORT', PHOTOGRAPHY: 'PHOTOGRAPHY', 'DECOR & MC': 'DECOR_MC' };

// The values one vendor card binds to, from providerCard() on the server.
export function vendorCardValues(vendor, { t, locale }) {
  const key = vendor.category || VENDOR_CATEGORY_KEYS[vendor.cat];
  const menu = VENDOR_MENU.find(([k]) => k === key);
  const catLabel = menu ? vendorLabel(menu, locale) : titleCase(vendor.cat);
  const city = titleCase(vendor.city).split(', ')[0];
  return {
    href: vendor.href || `/vendors/${vendor.slug}`,
    img: vendor.img,
    name: vendor.name,
    verified: vendor.verified,
    catLabel,
    ratingLabel: vendor.rating === 'NEW' ? t.newVendor : `★ ${vendor.rating}`,
    sub: [vendor.jobs ? t.jobs(vendor.jobs) : null, vendor.rate || null].filter(Boolean).join(' · '),
    chips: [
      { label: city, href: `/vendors?city=${encodeURIComponent(titleCase(vendor.city))}` },
      ...(key ? [{ label: catLabel, href: `/vendors?category=${key}` }] : []),
    ],
  };
}
