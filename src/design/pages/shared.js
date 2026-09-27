// Small helpers shared by the page logic modules.

import { convert, formatMoney, DISPLAY_CURRENCIES } from '@/shared/money';

export const COLORS = Object.freeze({
  ink: '#14201F',
  forest: '#1F3A38',
  cream: '#F7F1E6',
  paper: '#FFFDF8',
  sand: '#EFE7D6',
  clay: '#D97A3B',
  clayLight: '#E8A472',
  rust: '#A85A23',
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
