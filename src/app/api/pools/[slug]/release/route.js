import { route, withStatus } from '@/server/http';
import { releasePool } from '@/server/services/pools';

export const POST = route({ auth: 'required', idempotent: true, limit: [{ policy: 'money.move', by: 'user' }] }, async ({ viewer, params }) => withStatus(200, await releasePool(viewer, params.slug)));
