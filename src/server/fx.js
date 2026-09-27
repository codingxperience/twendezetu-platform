// Exchange rates for display and for points conversion. Rates are read from
// the FxRate table (cached in memory for five minutes) and refreshed by the
// scheduled job from a public feed.

import { prisma } from './db.js';
import { config } from './config.js';
import { log } from './log.js';
import { DISPLAY_CURRENCIES } from '../shared/money.js';

const CACHE_MS = 5 * 60 * 1000;
let cache = null;

export async function getRates() {
  if (cache && Date.now() - cache.at < CACHE_MS) return cache.rates;
  const rows = await prisma.fxRate.findMany();
  const rates = Object.fromEntries(rows.map((row) => [row.currency, Number(row.perUsd)]));
  rates.USD = 1;
  cache = { at: Date.now(), rates };
  return rates;
}

export function clearRateCache() {
  cache = null;
}

// Pulls US-dollar based rates from the configured feed (open.er-api.com by
// default: free, no key). Rates that move more than 25% from the stored value
// in one step are rejected as likely bad data and left for a human to check.
export async function refreshRates() {
  const response = await fetch(config().fxRatesUrl, { signal: AbortSignal.timeout(8000) });
  if (!response.ok) throw new Error(`FX feed responded ${response.status}`);
  const body = await response.json();
  const feed = body?.rates;
  if (!feed || typeof feed !== 'object') throw new Error('FX feed returned no rates');

  const current = await getRates();
  const updated = [];
  const rejected = [];

  for (const currency of DISPLAY_CURRENCIES) {
    if (currency === 'USD') continue;
    const next = Number(feed[currency]);
    if (!Number.isFinite(next) || next <= 0) continue;
    const previous = current[currency];
    if (previous && Math.abs(next - previous) / previous > 0.25) {
      rejected.push({ currency, previous, next });
      continue;
    }
    await prisma.fxRate.upsert({
      where: { currency },
      create: { currency, perUsd: next, source: 'open.er-api.com' },
      update: { perUsd: next, source: 'open.er-api.com' },
    });
    updated.push(currency);
  }

  if (rejected.length) log.warn('fx rates rejected as outliers', { rejected });
  clearRateCache();
  return { updated, rejected };
}
