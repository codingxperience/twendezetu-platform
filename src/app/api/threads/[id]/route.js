import { route } from '@/server/http';
import { threadDetail } from '@/server/services/threads';

export const GET = route({ auth: 'required' }, async ({ viewer, params }) => ({ thread: await threadDetail(viewer, params.id) }));
