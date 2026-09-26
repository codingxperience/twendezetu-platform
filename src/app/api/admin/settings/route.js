import { route } from '@/server/http';
import { schemas } from '@/server/schemas';
import { adminSettings, updateSetting } from '@/server/services/moderation';

export const GET = route({ auth: 'required', roles: ['ADMIN', 'MODERATOR'] }, async () => ({ settings: await adminSettings() }));

export const PATCH = route({ auth: 'required', roles: ['ADMIN'], body: schemas.adminSetting }, async ({ body, viewer }) => updateSetting(viewer, body.key, body.value));
