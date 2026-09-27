import { route, withStatus } from '@/server/http';
import { releasePool } from '@/server/services/pools';

export const POST = route({ auth: 'required', roles: ['ADMIN', 'FINANCE'], idempotent: true }, async ({ viewer, params }) => withStatus(200, await releasePool(viewer, params.slug, { byFinance: true })));
