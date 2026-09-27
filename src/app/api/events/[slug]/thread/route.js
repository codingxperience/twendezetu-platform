import { route } from '@/server/http';
import { openOrganizerThread } from '@/server/services/threads';

export const POST = route({ auth: 'required' }, async ({ viewer, params }) => openOrganizerThread(viewer, params.slug));
