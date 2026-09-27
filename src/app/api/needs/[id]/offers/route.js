import { route } from '@/server/http';
import { invalid, notFound } from '@/server/errors';
import { prisma } from '@/server/db';
import { schemas } from '@/server/schemas';
import { submitOffer } from '@/server/services/marketplace';
import { parseMoneyInput } from '@/shared/money';

export const POST = route({ auth: 'required', body: schemas.offer }, async ({ body, viewer, params }) => {
  const need = await prisma.need.findUnique({ where: { id: params.id }, select: { currency: true } });
  if (!need) throw notFound();
  const priceMinor = parseMoneyInput(body.price, need.currency);
  if (priceMinor == null) throw invalid(`Price: write it like 760K or 760,000 (${need.currency}).`);
  return submitOffer(viewer, params.id, { priceMinor, title: body.title, note: body.note });
});
