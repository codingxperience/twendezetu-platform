import { route, withStatus } from '@/server/http';
import { toggleSavedEvent } from '@/server/services/rsvps';

export const POST = route({ auth: 'required' }, async ({ viewer, params }) => withStatus(200, await toggleSavedEvent(viewer, params.slug)));
