import { route } from '@/server/http';
import { querySchemas } from '@/server/schemas';
import { ledgerCsv } from '@/server/services/finance';
import { audit } from '@/server/audit';
import { prisma } from '@/server/db';

export const GET = route({ auth: 'required', roles: ['ADMIN', 'FINANCE'], query: querySchemas.finance }, async ({ query, viewer }) => {
  await audit(prisma, { actorId: viewer.id, action: 'finance.ledger_exported', meta: query });
  return new Response(await ledgerCsv(query), {
    headers: {
      'content-type': 'text/csv; charset=utf-8',
      'content-disposition': `attachment; filename="twendezetu-ledger-${query.range}-${query.filter.toLowerCase()}.csv"`,
      'cache-control': 'no-store',
    },
  });
});
