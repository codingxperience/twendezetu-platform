import { route, withStatus } from '@/server/http';
import { invalid } from '@/server/errors';
import { schemas } from '@/server/schemas';
import { messageUser, sendPasswordResetFor, setUserRole, setUserSuspended } from '@/server/services/moderation';

export const POST = route({ auth: 'required', roles: ['ADMIN', 'MODERATOR'], body: schemas.adminUser }, async ({ body, viewer, params }) => {
  switch (body.action) {
    case 'role':
      if (!body.role) throw invalid('Choose a role.');
      return withStatus(200, await setUserRole(viewer, params.id, body.role));
    case 'message':
      return withStatus(200, await messageUser(viewer, params.id, body.text));
    case 'reset':
      return withStatus(200, await sendPasswordResetFor(viewer, params.id));
    default:
      return withStatus(200, await setUserSuspended(viewer, params.id, body.action === 'suspend', body.reason));
  }
});
