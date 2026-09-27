import { route, withStatus } from '@/server/http';
import { financeReleaseBooking } from '@/server/services/finance';

export const POST = route({ auth: 'required', roles: ['ADMIN', 'FINANCE'], idempotent: true }, async ({ viewer, params }) => withStatus(200, await financeReleaseBooking(viewer, params.id)));
