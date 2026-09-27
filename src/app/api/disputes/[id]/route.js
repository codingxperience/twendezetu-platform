import { route, withStatus } from '@/server/http';
import { invalid, notFound } from '@/server/errors';
import { prisma } from '@/server/db';
import { schemas } from '@/server/schemas';
import { respondToDispute, withdrawDispute } from '@/server/services/disputes';
import { parseMoneyInput } from '@/shared/money';

export const POST = route({ auth: 'required', body: schemas.disputeAction, idempotent: true }, async ({ body, viewer, params }) => {
  if (body.action === 'withdraw') return withStatus(200, await withdrawDispute(viewer, params.id));
  const dispute = await prisma.dispute.findUnique({ where: { id: params.id }, select: { currency: true } });
  if (!dispute) throw notFound();
  const refundMinor = body.action === 'partial' ? parseMoneyInput(body.amount, dispute.currency) : undefined;
  if (body.action === 'partial' && refundMinor == null) throw invalid('Enter the amount you will refund.');
  return withStatus(200, await respondToDispute(viewer, params.id, { action: body.action, refundMinor, note: body.note }));
});
