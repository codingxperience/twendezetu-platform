import { route } from '@/server/http';
import { querySchemas } from '@/server/schemas';
import { equivalents, walletActivity, walletBalance } from '@/server/services/wallet';

export const GET = route({ auth: 'required', query: querySchemas.cursor }, async ({ viewer, query }) => {
  const balance = await walletBalance(viewer.id);
  return { balance, equivalents: await equivalents(balance), activity: await walletActivity(viewer.id, { cursor: query.cursor }) };
});
