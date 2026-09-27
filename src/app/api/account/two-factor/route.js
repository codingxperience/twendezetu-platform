import { route } from '@/server/http';
import { schemas } from '@/server/schemas';
import { setTwoFactor } from '@/server/services/identity';

export const PUT = route({ auth: 'required', body: schemas.twoFactor, limit: [{ policy: 'auth.password', by: 'user' }] }, async ({ body, viewer }) => setTwoFactor(viewer, body));
