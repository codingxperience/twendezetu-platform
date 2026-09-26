import { route } from '@/server/http';
import { listThreads } from '@/server/services/threads';

export const GET = route({ auth: 'required' }, async ({ viewer }) => ({ threads: await listThreads(viewer.id) }));
