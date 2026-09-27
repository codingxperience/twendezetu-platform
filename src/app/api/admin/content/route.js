import { route, withStatus } from '@/server/http';
import { schemas } from '@/server/schemas';
import { contentList, setFeatured, setHidden } from '@/server/services/moderation';

export const GET = route({ auth: 'required', roles: ['ADMIN', 'MODERATOR'] }, async () => ({ items: await contentList() }));

export const POST = route({ auth: 'required', roles: ['ADMIN', 'MODERATOR'], body: schemas.adminContent }, async ({ body, viewer }) => {
  if (body.action === 'feature' || body.action === 'unfeature') return withStatus(200, await setFeatured(viewer, body.id, body.action === 'feature'));
  return withStatus(200, await setHidden(viewer, body.kind, body.id, body.action === 'hide', body.reason));
});
