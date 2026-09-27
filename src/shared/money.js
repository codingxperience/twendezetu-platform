// Currency arithmetic and formatting. Amounts are integers in the minor unit
// defined by ISO 4217 for each currency. Points are whole points with a fixed
// value of one US cent, so 100 points = US$1.

export const CURRENCIES = Object.freeze({
  USD: { exponent: 2, prefix: '$', name: 'US dollar' },
  KES: { exponent: 2, prefix: 'KES ', name: 'Kenyan shilling' },
  UGX: { exponent: 0, prefix: 'UGX ', name: 'Ugandan shilling' },
  TZS: { exponent: 2, prefix: 'TZS ', name: 'Tanzanian shilling' },
  RWF: { exponent: 0, prefix: 'RWF ', name: 'Rwandan franc' },
  PTS: { exponent: 0, prefix: '', suffix: ' pts', name: 'Twende points' },
});

export const DISPLAY_CURRENCIES = ['USD', 'KES', 'UGX', 'TZS', 'RWF'];

export function isCurrency(code) {
  return Object.hasOwn(CURRENCIES, code);
}

function spec(currency) {
  const found = CURRENCIES[currency];
  if (!found) throw new Error(`Unsupported currency: ${currency}`);
  return found;
}

export function toMinor(major, currency) {
  return Math.round(Number(major) * 10 ** spec(currency).exponent);
}

export function toMajor(minor, currency) {
  return Number(minor) / 10 ** spec(currency).exponent;
}

// Basis-point share of an integer amount, rounded half away from zero.
export function percentOf(amountMinor, basisPoints) {
  const raw = (Number(amountMinor) * basisPoints) / 10_000;
  return Math.sign(raw) * Math.round(Math.abs(raw));
}

// "$20.00", "KES 1,000", "UGX 760,000". Whole-unit currencies never show
// decimals; cents are dropped when they are zero unless `cents` is forced.
export function formatMoney(minor, currency, { cents } = {}) {
  const { exponent, prefix, suffix = '' } = spec(currency);
  const major = toMajor(minor, currency);
  const showCents = exponent > 0 && (cents === true || (cents !== false && currency === 'USD'));
  const text = Math.abs(major).toLocaleString('en-US', {
    minimumFractionDigits: showCents ? exponent : 0,
    maximumFractionDigits: showCents ? exponent : 0,
  });
  return `${major < 0 ? '−' : ''}${prefix}${text}${suffix}`;
}

// Compact labels used on cards and chips: "UGX 350K", "UGX 2.4M", "$490".
export function formatCompact(minor, currency) {
  const { prefix, suffix = '' } = spec(currency);
  const major = Math.abs(toMajor(minor, currency));
  const sign = minor < 0 ? '−' : '';
  let text;
  if (major >= 1_000_000) text = `${trim(major / 1_000_000)}M`;
  else if (major >= 10_000 && currency !== 'USD') text = `${trim(major / 1_000)}K`;
  else if (major >= 100_000) text = `${trim(major / 1_000)}K`;
  else text = major.toLocaleString('en-US', { maximumFractionDigits: currency === 'USD' && major < 100 ? 2 : 0 });
  return `${sign}${prefix}${text}${suffix}`;
}

function trim(value) {
  return value >= 100 ? String(Math.round(value)) : String(Math.round(value * 10) / 10);
}

export function formatPoints(points) {
  return `${Number(points).toLocaleString('en-US')} pts`;
}

// ── Conversion ────────────────────────────────────────────────────────────
// `rates` maps currency → units per US dollar (as stored in FxRate).

export function convert(minor, from, to, rates) {
  if (from === to) return Math.round(minor);
  const usd = from === 'PTS' ? minor / 100 : toMajor(minor, from) / rateOf(from, rates);
  if (to === 'PTS') return Math.round(usd * 100);
  return toMinor(usd * rateOf(to, rates), to);
}

// Points needed to cover an amount: always rounded up, so a conversion can
// never under-collect.
export function pointsFor(minor, currency, rates) {
  if (currency === 'PTS') return Math.ceil(minor);
  const usd = toMajor(minor, currency) / rateOf(currency, rates);
  return Math.ceil(Math.round(usd * 100 * 1e6) / 1e6);
}

function rateOf(currency, rates) {
  if (currency === 'USD') return 1;
  const rate = Number(rates?.[currency]);
  if (!Number.isFinite(rate) || rate <= 0) throw new Error(`No exchange rate for ${currency}`);
  return rate;
}

// Reads what people type into a price box: "760K", "UGX 760,000", "1.2M",
// "$540", "540.50". Returns minor units in `currency`, or null.
export function parseMoneyInput(text, currency) {
  const raw = String(text ?? '').trim().toUpperCase().replace(/^[A-Z$]{1,4}\s*/, '').replace(/\s+/g, '');
  const match = /^(\d{1,3}(?:,\d{3})+|\d+)(?:\.(\d+))?([KM])?/.exec(raw);
  if (!match) return null;
  let value = Number(`${match[1].replace(/,/g, '')}${match[2] ? `.${match[2]}` : ''}`);
  if (match[3] === 'K') value *= 1_000;
  if (match[3] === 'M') value *= 1_000_000;
  if (!Number.isFinite(value) || value <= 0) return null;
  return toMinor(value, currency);
}
