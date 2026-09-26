import { route } from '@/server/http';
import { schemas } from '@/server/schemas';
import { createPool } from '@/server/services/pools';

export const POST = route({ auth: 'required', body: schemas.createPool }, async ({ body, viewer }) => ({ pool: await createPool(viewer, body) }));
