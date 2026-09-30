// One PrismaClient per process. In development Next.js reloads modules on
// every edit, so the client is parked on globalThis to avoid opening a new
// connection pool each time.

import { PrismaClient, Prisma } from '@prisma/client';
import { fromDatabaseError } from './errors.js';
import { databaseUrl } from './db-url.js';

const globalForPrisma = globalThis;

export const prisma =
  globalForPrisma.__twendezetuPrisma ??
  new PrismaClient({
    // Adds pgbouncer=true when DATABASE_URL is a transaction pooler.
    datasources: process.env.DATABASE_URL ? { db: { url: databaseUrl() } } : undefined,
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.__twendezetuPrisma = prisma;

export { Prisma };

const RETRYABLE = new Set(['40001', '40P01']);

function isRetryable(error) {
  const text = String(error?.message || '');
  return error?.code === 'P2034' || [...RETRYABLE].some((code) => text.includes(code));
}

// Runs `work` in an interactive transaction. Serialisation failures and
// deadlocks are retried with jitter; constraint and ledger errors become
// AppErrors the caller can show.
export async function transaction(work, { isolationLevel = Prisma.TransactionIsolationLevel.ReadCommitted, attempts = 3 } = {}) {
  let lastError;
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      return await prisma.$transaction(work, { isolationLevel, maxWait: 5000, timeout: 20000 });
    } catch (error) {
      lastError = error;
      if (isRetryable(error) && attempt < attempts) {
        await new Promise((resolve) => setTimeout(resolve, 20 * attempt + Math.random() * 40));
        continue;
      }
      throw fromDatabaseError(error) || error;
    }
  }
  throw lastError;
}

// Prisma returns BigInt for ledger columns. JSON cannot carry BigInt, and
// every amount we store fits comfortably in a double, so convert on the way
// out and refuse anything that would lose precision.
export function toNumber(value) {
  if (typeof value !== 'bigint') return value;
  if (value > BigInt(Number.MAX_SAFE_INTEGER) || value < BigInt(Number.MIN_SAFE_INTEGER)) {
    throw new Error('Ledger amount exceeds the safe integer range.');
  }
  return Number(value);
}
