import { route } from '@/server/http';
import { eventAnalytics } from '@/server/services/analytics';

export const GET = route({ auth: 'required' }, async ({ viewer, params }) => eventAnalytics(viewer, params.slug));
