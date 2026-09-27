import { route, withStatus } from '@/server/http';
import { schemas } from '@/server/schemas';
import { cancelRsvp, rsvpToEvent } from '@/server/services/rsvps';

export const POST = route({ auth: 'optional', body: schemas.rsvp }, async ({ body, viewer, params }) => ({
  rsvp: await rsvpToEvent({ slug: params.slug, viewer, name: body.name, email: body.email, partySize: body.partySize, status: body.status, referrerHandle: body.ref, source: body.source }),
}));

// Guests cancel with the private token from their confirmation email.
export const DELETE = route({ auth: 'optional' }, async ({ query, viewer }) => withStatus(200, await cancelRsvp({ token: query.token, viewer, rsvpId: query.id })));
