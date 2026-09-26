import { route, withStatus } from '@/server/http';
import { sendRenewalReminders } from '@/server/services/finance';

export const POST = route({ auth: 'required', roles: ['ADMIN', 'FINANCE'] }, async ({ viewer }) => withStatus(200, await sendRenewalReminders(viewer)));
