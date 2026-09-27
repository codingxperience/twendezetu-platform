import { route } from '@/server/http';
import { schemas } from '@/server/schemas';
import { createSplit } from '@/server/services/splits';

export const POST = route({ auth: 'required', body: schemas.createSplit }, async ({ body, viewer }) => ({ split: await createSplit(viewer, body) }));
