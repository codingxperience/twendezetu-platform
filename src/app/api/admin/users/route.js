import { route } from '@/server/http';
import { querySchemas } from '@/server/schemas';
import { listUsers } from '@/server/services/moderation';

export const GET = route({ auth: 'required', roles: ['ADMIN', 'MODERATOR'], query: querySchemas.users }, async ({ query }) => ({ users: await listUsers(query) }));
