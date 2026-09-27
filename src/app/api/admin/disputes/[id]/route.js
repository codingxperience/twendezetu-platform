import { route, withStatus } from '@/server/http';
import { invalid, notFound } from '@/server/errors';
import { prisma } from '@/server/db';
import { schemas } from '@/server/schemas';
import { resolveDispute } from '@/server/services/disputes';
import { parseMoneyInput } from '@/shared/money';

export const POST = route({ auth: 'required', roles: ['ADMIN', 'MODERATOR'], body: schemas.adminDispute, idempotent: true }, async ({ body, viewer, params }) => {
  const dispute = await prisma.dispute.findUnique({ where: { id: params.id }, select: { currency: true } });
  if (!dispute) throw notFound();
  const refundMinor = body.outcome === 'partial' ? parseMoneyInput(body.amount, dispute.currency) : undefined;
  if (body.outcome === 'partial' && refundMinor == null) throw invalid('Enter the refund amount.');
  return withStatus(200, await resolveDispute(viewer, params.id, { outcome: body.outcome, refundMinor, note: body.note }));
});
