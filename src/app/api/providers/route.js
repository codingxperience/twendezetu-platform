import { route } from '@/server/http';
import { querySchemas } from '@/server/schemas';
import { listProviders } from '@/server/services/providers';

export const GET = route({ auth: 'none', query: querySchemas.providers }, async ({ query }) => ({ providers: await listProviders(query) }));
