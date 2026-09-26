import { route } from '@/server/http';
import { walletStatementCsv } from '@/server/services/wallet';

export const GET = route({ auth: 'required' }, async ({ viewer }) =>
  new Response(await walletStatementCsv(viewer.id), {
    headers: {
      'content-type': 'text/csv; charset=utf-8',
      'content-disposition': `attachment; filename="twende-points-${new Date().toISOString().slice(0, 10)}.csv"`,
      'cache-control': 'no-store',
    },
  }));
