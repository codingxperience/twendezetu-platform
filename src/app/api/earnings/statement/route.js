import { route } from '@/server/http';
import { badRequest } from '@/server/errors';
import { prisma } from '@/server/db';
import { earningsStatementCsv } from '@/server/services/payouts';
import { isCurrency } from '@/shared/money';

export const GET = route({ auth: 'required' }, async ({ viewer, url }) => {
  const provider = await prisma.provider.findUnique({ where: { ownerId: viewer.id }, select: { rateCurrency: true } });
  const currency = url.searchParams.get('currency') || provider?.rateCurrency || viewer.currency || 'USD';
  if (!isCurrency(currency) || currency === 'PTS') throw badRequest('Unknown currency.');
  return new Response(await earningsStatementCsv(viewer.id, currency), {
    headers: {
      'content-type': 'text/csv; charset=utf-8',
      'content-disposition': `attachment; filename="twendezetu-earnings-${currency.toLowerCase()}-${new Date().toISOString().slice(0, 10)}.csv"`,
      'cache-control': 'no-store',
    },
  });
});
