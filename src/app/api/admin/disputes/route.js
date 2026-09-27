import { route } from '@/server/http';
import { escalatedCases } from '@/server/services/disputes';

export const GET = route({ auth: 'required', roles: ['ADMIN', 'MODERATOR'] }, async () => ({ cases: await escalatedCases() }));
