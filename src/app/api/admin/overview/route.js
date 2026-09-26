import { route } from '@/server/http';
import { adminOverview } from '@/server/services/moderation';

export const GET = route({ auth: 'required', roles: ['ADMIN', 'MODERATOR'] }, async () => adminOverview());
