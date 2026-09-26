import { route } from '@/server/http';
import { schemas } from '@/server/schemas';
import { disputesForUser, eligiblePurchases, openDispute } from '@/server/services/disputes';

export const GET = route({ auth: 'required' }, async ({ viewer }) => ({ purchases: await eligiblePurchases(viewer.id), cases: await disputesForUser(viewer.id) }));

export const POST = route({ auth: 'required', body: schemas.openDispute, idempotent: true }, async ({ body, viewer }) => ({ dispute: await openDispute(viewer, body) }));
