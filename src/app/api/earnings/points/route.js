import { route } from '@/server/http';
import { invalid } from '@/server/errors';
import { schemas } from '@/server/schemas';
import { earningsToPoints } from '@/server/services/payouts';
import { parseMoneyInput } from '@/shared/money';

export const POST = route({ auth: 'required', body: schemas.earningsToPoints, idempotent: true, limit: [{ policy: 'money.move', by: 'user' }] }, async ({ body, viewer }) => {
  const amountMinor = parseMoneyInput(body.amount, body.currency);
  if (amountMinor == null) throw invalid('Enter the amount to move.');
  return earningsToPoints(viewer, { currency: body.currency, amountMinor, code: body.code });
});
