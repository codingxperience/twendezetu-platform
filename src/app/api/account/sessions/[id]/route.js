import { route, withStatus } from '@/server/http';
import { notFound } from '@/server/errors';
import { revokeSession } from '@/server/security/sessions';

export const DELETE = route({ auth: 'required' }, async ({ viewer, params }) => {
  if (!(await revokeSession(viewer.id, params.id))) throw notFound();
  return withStatus(200, { revoked: true });
});
