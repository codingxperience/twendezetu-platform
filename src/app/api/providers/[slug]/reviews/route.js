import { route } from '@/server/http';
import { schemas } from '@/server/schemas';
import { submitReview } from '@/server/services/providers';

export const POST = route({ auth: 'required', body: schemas.review }, async ({ body, viewer, params }) => ({ review: await submitReview(viewer, params.slug, body) }));
