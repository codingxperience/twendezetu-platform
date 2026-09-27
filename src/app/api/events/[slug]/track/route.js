import { route, withStatus } from '@/server/http';
import { prisma } from '@/server/db';
import { schemas } from '@/server/schemas';
import { normalizeSource, recordAction, recordView } from '@/server/services/events';

// Page views, CTA clicks and shares for organizer analytics. Views are
// counted once per visitor per half hour; nothing here identifies a person.
export const POST = route({ auth: 'none', body: schemas.track, limit: false }, async ({ body, params, ip, req }) => {
  const event = await prisma.event.findUnique({ where: { slug: params.slug }, select: { id: true } });
  if (!event) return withStatus(202, { tracked: false });
  const source = normalizeSource(body.source, req.headers.get('referer'));
  if (body.kind === 'view') await recordView(event.id, { ip, source });
  else await recordAction(event.id, { source, kind: body.kind });
  return withStatus(202, { tracked: true });
});
