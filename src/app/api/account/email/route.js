import { route } from '@/server/http';
import { schemas } from '@/server/schemas';
import { changeEmail } from '@/server/services/identity';

export const PATCH = route({ auth: 'required', body: schemas.changeEmail, limit: [{ policy: 'auth.password', by: 'user' }] }, async ({ body, viewer }) => changeEmail(viewer, body));
