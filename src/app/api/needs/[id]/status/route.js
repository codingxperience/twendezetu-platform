import { route, withStatus } from '@/server/http';
import { schemas } from '@/server/schemas';
import { setNeedStatus } from '@/server/services/marketplace';

export const POST = route({ auth: 'required', body: schemas.needStatus }, async ({ body, viewer, params }) => withStatus(200, await setNeedStatus(viewer, params.id, body.action, body.reason)));
