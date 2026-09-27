import { route } from '@/server/http';

export const GET = route({ auth: 'optional' }, async ({ viewer }) => ({ user: viewer || null }));
