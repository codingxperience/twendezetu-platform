import { route } from '@/server/http';
import { reportQueue } from '@/server/services/moderation';

export const GET = route({ auth: 'required', roles: ['ADMIN', 'MODERATOR'] }, async () => reportQueue());
