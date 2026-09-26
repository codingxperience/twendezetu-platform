import { route } from '@/server/http';
import { schemas } from '@/server/schemas';
import { joinWaitlist } from '@/server/services/checkout';

export const POST = route({ auth: 'optional', body: schemas.waitlist }, async ({ body, viewer, params }) => joinWaitlist({ slug: params.slug, tierId: body.tierId, viewer, email: body.email, name: body.name }));
