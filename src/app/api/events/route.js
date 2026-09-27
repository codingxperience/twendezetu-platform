import { revalidateTag } from 'next/cache';
import { route } from '@/server/http';
import { querySchemas, schemas } from '@/server/schemas';
import { createEvent, listGuideEvents } from '@/server/services/events';

export const GET = route({ auth: 'none', query: querySchemas.events }, async ({ query }) => ({ events: await listGuideEvents(query) }));

export const POST = route({ auth: 'required', body: schemas.createEvent, limit: [{ policy: 'post.create', by: 'user' }] }, async ({ body, viewer }) => {
  const event = await createEvent(viewer, body);
  if (event.status === 'PUBLISHED') revalidateTag('guide');
  return { event };
});
