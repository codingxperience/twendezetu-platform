import { route, withStatus } from '@/server/http';
import { cancelUnpaidBooking } from '@/server/services/marketplace';

export const POST = route({ auth: 'required' }, async ({ viewer, params }) => withStatus(200, await cancelUnpaidBooking(viewer, params.id)));
