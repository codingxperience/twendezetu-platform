import { route, withStatus } from '@/server/http';
import { schemas } from '@/server/schemas';
import { removePaymentMethod, setDefaultPaymentMethod } from '@/server/services/account';

export const PATCH = route({ auth: 'required' }, async ({ viewer, params }) => setDefaultPaymentMethod(viewer.id, params.id));

export const DELETE = route({ auth: 'required', body: schemas.password, limit: [{ policy: 'auth.password', by: 'user' }] }, async ({ body, viewer, params }) =>
  withStatus(200, await removePaymentMethod(viewer, params.id, body.password)));
