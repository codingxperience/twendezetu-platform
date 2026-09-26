import { route } from '@/server/http';
import { organizerPayouts } from '@/server/services/payouts';

export const GET = route({ auth: 'required' }, async ({ viewer }) => organizerPayouts(viewer));
