// Scheduled work, run by the cron endpoint (/api/cron/tick) every few
// minutes. Every job is idempotent and safe to overlap with another run.

import { prisma } from './db.js';
import { log } from './log.js';
import { dispatchDue } from './notify/dispatch.js';
import { purgeExpiredBuckets } from './security/rate-limit.js';
import { purgeDeadSessions } from './security/sessions.js';
import { refreshRates } from './fx.js';
import { expireStaleOrders } from './services/checkout.js';
import { expireSplits } from './services/splits.js';
import { releaseDueBookings } from './services/marketplace.js';
import { releaseEventEscrows } from './services/payouts.js';
import { escalateOverdueDisputes } from './services/disputes.js';

const EVERY_RUN = {
  expireStaleOrders,
  expireSplits,
  releaseDueBookings,
  releaseEventEscrows,
  escalateOverdueDisputes,
  dispatchNotifications: () => dispatchDue({ batchSize: 100 }),
};

const HOURLY = {
  purgeRateLimits: purgeExpiredBuckets,
  purgeSessions: purgeDeadSessions,
  purgeIdempotency: async () => (await prisma.idempotencyRecord.deleteMany({ where: { createdAt: { lt: new Date(Date.now() - 24 * 3600 * 1000) } } })).count,
  closeLapsedNeeds: async () => (await prisma.need.updateMany({ where: { status: { in: ['OPEN', 'PAUSED'] }, closesAt: { lt: new Date() } }, data: { status: 'CLOSED', closedReason: 'Offer window closed' } })).count,
  lapseMemberships: async () => (await prisma.provider.updateMany({ where: { status: 'ACTIVE', membershipEndsAt: { lt: new Date() } }, data: { status: 'DRAFT' } })).count,
};

const DAILY = {
  refreshFxRates: refreshRates,
};

async function runGroup(group) {
  const results = {};
  for (const [name, job] of Object.entries(group)) {
    const started = Date.now();
    try {
      results[name] = { ok: true, result: await job(), ms: Date.now() - started };
    } catch (error) {
      results[name] = { ok: false, error: error.message, ms: Date.now() - started };
      log.error('scheduled job failed', { job: name, error });
    }
  }
  return results;
}

export async function runScheduledJobs(now = new Date()) {
  const results = await runGroup(EVERY_RUN);
  // Hourly and daily groups run on the first tick of the hour / day. Ticks
  // are every five minutes, so the minute check has a five minute window.
  if (now.getUTCMinutes() < 5) Object.assign(results, await runGroup(HOURLY));
  if (now.getUTCHours() === 3 && now.getUTCMinutes() < 5) Object.assign(results, await runGroup(DAILY));
  return results;
}

export async function runAllJobs() {
  return { ...(await runGroup(EVERY_RUN)), ...(await runGroup(HOURLY)), ...(await runGroup(DAILY)) };
}
