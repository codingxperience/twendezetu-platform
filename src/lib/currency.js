// Multi-currency presentation. Prices in the DB are always KES. The display
// rate is a stable estimate — for a real production deploy you'd refresh
// these from a feed (e.g. https://open.er-api.com/) on a scheduled job.

export const CURRENCIES = {
  KES: { sym: 'KSh', rate: 1,  country: 'Kenya' },
  UGX: { sym: 'USh', rate: 32, country: 'Uganda' },
  TZS: { sym: 'TSh', rate: 18, country: 'Tanzania' },
  RWF: { sym: 'RWF', rate: 9,  country: 'Rwanda' },
};

export function fmtCurrency(kes, code = 'KES') {
  const c = CURRENCIES[code] || CURRENCIES.KES;
  return `${c.sym} ${Math.round(kes * c.rate).toLocaleString()}`;
}

export function currencyForCountry(country) {
  return { Kenya: 'KES', Uganda: 'UGX', Tanzania: 'TZS', Rwanda: 'RWF' }[country] || 'KES';
}
