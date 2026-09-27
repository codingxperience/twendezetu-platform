import { route, withStatus } from '@/server/http';
import { markThreadRead } from '@/server/services/threads';

export const POST = route({ auth: 'required' }, async ({ viewer, params }) => {
  await markThreadRead(viewer, params.id);
  return withStatus(200, { read: true });
});
