import { revalidateTag } from 'next/cache';
import { route } from '@/server/http';
import { invalid } from '@/server/errors';
import { querySchemas, schemas } from '@/server/schemas';
import { createNeed, openNeeds } from '@/server/services/marketplace';
import { parseMoneyInput } from '@/shared/money';
import { COUNTRIES } from '@/shared/format';

export const GET = route({ auth: 'none', query: querySchemas.needs }, async ({ query }) => ({ needs: await openNeeds(query) }));

export const POST = route({ auth: 'required', body: schemas.createNeed, limit: [{ policy: 'post.create', by: 'user' }] }, async ({ body, viewer }) => {
  const currency = body.currency || COUNTRIES[body.country].currency;
  const budgetMinor = body.budget ? parseMoneyInput(body.budget, currency) : null;
  if (body.budget && budgetMinor == null) throw invalid('Budget: write it like 400K or 400,000.');
  const need = await createNeed(viewer, { ...body, currency, budgetMinor });
  revalidateTag('guide');
  return { need };
});
