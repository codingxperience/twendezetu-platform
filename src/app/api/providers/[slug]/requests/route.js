import { route } from '@/server/http';
import { schemas } from '@/server/schemas';
import { requestService } from '@/server/services/providers';

export const POST = route({ auth: 'optional', body: schemas.serviceRequest }, async ({ body, viewer, params }) =>
  requestService({ slug: params.slug, viewer, name: body.name, email: body.email, message: body.message }));
