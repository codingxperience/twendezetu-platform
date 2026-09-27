import { route, withStatus } from '@/server/http';
import { schemas } from '@/server/schemas';
import { markNotificationsRead, notificationFeed } from '@/server/services/account';

export const GET = route({ auth: 'required' }, async ({ viewer }) => notificationFeed(viewer.id));

export const POST = route({ auth: 'required', body: schemas.markRead }, async ({ body, viewer }) => withStatus(200, await markNotificationsRead(viewer.id, body.ids)));
