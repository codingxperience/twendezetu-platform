import { route } from '@/server/http';
import { verificationQueue } from '@/server/services/verification';

export const GET = route({ auth: 'required', roles: ['ADMIN', 'MODERATOR'] }, async () => ({ applications: await verificationQueue() }));
