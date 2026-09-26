import { route } from '@/server/http';
import { schemas } from '@/server/schemas';
import { notificationSettings, updateNotificationPreference, updateNotificationSwitches } from '@/server/services/account';

export const GET = route({ auth: 'required' }, async ({ viewer }) => notificationSettings(viewer.id, { provider: Boolean(viewer.provider) }));

export const PATCH = route({ auth: 'required', body: schemas.notificationPref }, async ({ body, viewer }) => updateNotificationPreference(viewer.id, body));

export const PUT = route({ auth: 'required', body: schemas.notificationSwitches }, async ({ body, viewer }) => updateNotificationSwitches(viewer.id, body));
