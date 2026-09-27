import { route } from '@/server/http';
import { invalid } from '@/server/errors';
import { schemas } from '@/server/schemas';
import { requestWithdrawal } from '@/server/services/payouts';
import { parseMoneyInput } from '@/shared/money';

export const POST = route({ auth: 'required', body: schemas.withdrawal, idempotent: true, limit: [{ policy: 'money.move', by: 'user' }] }, async ({ body, viewer }) => {
  const amountMinor = parseMoneyInput(body.amount, body.currency);
  if (amountMinor == null) throw invalid('Enter the amount to withdraw.');
  return requestWithdrawal(viewer, { currency: body.currency, amountMinor, methodId: body.methodId, code: body.code });
});
