// The database address Prisma should use.
//
// Supabase's transaction pooler (PgBouncer, port 6543) hands each query to
// whichever server connection is free, so a prepared statement made on one
// connection is missing on the next. Prisma needs `pgbouncer=true` on such
// an address to stop preparing statements; without it pages fail at random
// with `prepared statement "s1" does not exist` and work again on refresh.
// This adds the flag whenever the address is a transaction pooler, so a
// DATABASE_URL copied without it cannot take the site down.

export function isTransactionPooler(url) {
  return url.port === '6543' || (url.hostname.endsWith('.pooler.supabase.com') && url.port !== '5432');
}

export function databaseUrl(raw = process.env.DATABASE_URL) {
  if (!raw) return raw;
  let url;
  try {
    url = new URL(raw);
  } catch {
    return raw;
  }
  if (!isTransactionPooler(url) || url.searchParams.get('pgbouncer') === 'true') return raw;
  url.searchParams.set('pgbouncer', 'true');
  return url.toString();
}
