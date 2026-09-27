// The points wallet: balance, what it is worth, recent movements, pending
// cash-outs and the harambee pools the person started or joined.

import { prisma } from '../db.js';
import { unauthorized } from '../errors.js';
import { getRates } from '../fx.js';
import { FEES, LIMITS } from '../fees.js';
import { walletActivity, walletBalance } from '../services/wallet.js';
import { payoutMethods } from '../services/payouts.js';
import { poolsForUser } from '../services/pools.js';
import { getSettings } from '../settings.js';
import { shortDate } from '../../shared/format.js';
import { appUrl, me } from './common.js';

export async function walletView(viewer, { pool } = {}) {
  if (!viewer) throw unauthorized();
  const [person, balance, activity, methods, pools, pending, rates, settings] = await Promise.all([
    me(viewer),
    walletBalance(viewer.id),
    walletActivity(viewer.id, { take: 15 }),
    payoutMethods(viewer.id),
    poolsForUser(viewer.id, { highlightSlug: typeof pool === 'string' ? pool : undefined }),
    prisma.payout.findMany({
      where: { userId: viewer.id, currency: 'PTS', status: { in: ['REQUESTED', 'APPROVED'] } },
      orderBy: { requestedAt: 'desc' },
      select: { reference: true, amountMinor: true, feeMinor: true, destinationLabel: true, requestedAt: true, status: true },
    }),
    getRates(),
    getSettings(),
  ]);

  return {
    me: person,
    balance,
    rates,
    activity: activity.items.map((item) => ({ ...item, createdAt: item.createdAt.toISOString() })),
    nextCursor: activity.nextCursor,
    methods: methods.map((method) => ({ id: method.id, label: method.label, isDefault: method.isDefault })),
    pools,
    highlight: typeof pool === 'string' ? pool : null,
    pendingCashOuts: pending.map((payout) => ({
      reference: payout.reference,
      points: payout.amountMinor - payout.feeMinor,
      to: payout.destinationLabel,
      since: shortDate(payout.requestedAt),
      status: payout.status === 'APPROVED' ? 'APPROVED · SENDING' : 'WAITING FOR THE NEXT BATCH',
    })),
    poolReview: Boolean(settings.poolReleaseReview),
    appUrl: appUrl(),
    limits: { topUpOptions: LIMITS.topUpUsdOptions, topUpMax: LIMITS.topUpUsdMax, transferMax: LIMITS.pointsTransferMax, cashOutFee: FEES.cashoutFeePoints },
  };
}
