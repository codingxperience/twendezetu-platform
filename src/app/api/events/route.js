import { route } from '@/server/http';
import { querySchemas, schemas } from '@/server/schemas';
import { createEvent, listGuideEvents } from '@/server/services/events';

export const GET = route({ auth: 'none', query: querySchemas.events }, async ({ query }) => ({ events: await listGuideEvents(query) }));

export const POST = route({ auth: 'required', body: schemas.createEvent }, async ({ body, viewer }) => ({ event: await createEvent(viewer, body) }));
