import { route, withStatus } from '@/server/http';
import { confirmBookingDone } from '@/server/services/marketplace';

export const POST = route({ auth: 'required', idempotent: true }, async ({ viewer, params }) => withStatus(200, await confirmBookingDone(viewer, params.id)));
