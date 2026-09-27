import { route } from '@/server/http';
import { schemas } from '@/server/schemas';
import { updateProfile } from '@/server/services/identity';

export const PATCH = route({ auth: 'required', body: schemas.profile }, async ({ body, viewer }) => ({ profile: await updateProfile(viewer, body) }));
