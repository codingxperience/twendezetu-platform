import { route, withStatus } from '@/server/http';
import { approvePayoutBatch } from '@/server/services/payouts';
import { payoutQueue } from '@/server/services/finance';

export const GET = route({ auth: 'required', roles: ['ADMIN', 'FINANCE'] }, async () => ({ payouts: await payoutQueue() }));

// Approves every requested withdrawal as one batch.
export const POST = route({ auth: 'required', roles: ['ADMIN', 'FINANCE'], idempotent: true }, async ({ viewer }) => withStatus(200, await approvePayoutBatch(viewer)));
