import { route, withStatus } from '@/server/http';
import { toggleFollow } from '@/server/services/providers';

export const POST = route({ auth: 'required' }, async ({ viewer, params }) => withStatus(200, await toggleFollow(viewer, { providerSlug: params.slug })));
