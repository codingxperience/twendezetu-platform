import { route, withStatus } from '@/server/http';
import { leaveWaitlist } from '@/server/services/checkout';

export const DELETE = route({ auth: 'required' }, async ({ viewer, params }) => withStatus(200, await leaveWaitlist(viewer, params.id)));
