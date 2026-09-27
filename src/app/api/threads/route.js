import { route } from '@/server/http';
import { listThreads } from '@/server/services/threads';
import { timezoneFor } from '@/server/notify/preferences';

export const GET = route({ auth: 'required' }, async ({ viewer }) => ({ threads: await listThreads(viewer.id, timezoneFor(viewer.country)) }));
