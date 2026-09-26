import { route } from '@/server/http';
import { querySchemas } from '@/server/schemas';
import { financeOverview } from '@/server/services/finance';

export const GET = route({ auth: 'required', roles: ['ADMIN', 'FINANCE'], query: querySchemas.finance }, async ({ query }) => financeOverview(query));
