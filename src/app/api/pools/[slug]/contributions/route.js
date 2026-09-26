import { route } from '@/server/http';
import { schemas } from '@/server/schemas';
import { contribute } from '@/server/services/pools';

export const POST = route({ auth: 'required', body: schemas.contribute, idempotent: true, limit: [{ policy: 'money.move', by: 'user' }] }, async ({ body, viewer, params }) => contribute(viewer, params.slug, body));
