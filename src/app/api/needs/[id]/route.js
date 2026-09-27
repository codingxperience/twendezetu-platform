import { revalidateTag } from 'next/cache';
import { route } from '@/server/http';
import { invalid, notFound } from '@/server/errors';
import { prisma } from '@/server/db';
import { schemas } from '@/server/schemas';
import { updateNeed } from '@/server/services/marketplace';
import { parseMoneyInput } from '@/shared/money';

export const PATCH = route({ auth: 'required', body: schemas.updateNeed }, async ({ params, viewer, body }) => {
  const need = await prisma.need.findUnique({ where: { id: params.id }, select: { currency: true } });
  if (!need) throw notFound();
  const budgetMinor = body.budget ? parseMoneyInput(body.budget, need.currency) : null;
  if (body.budget && budgetMinor == null) throw invalid('Budget: write it like 400K or 400,000.');
  const result = await updateNeed(viewer, params.id, { ...body, budgetMinor });
  revalidateTag('guide');
  return { need: result };
});
