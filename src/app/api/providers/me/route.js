import { route, withStatus } from '@/server/http';
import { invalid } from '@/server/errors';
import { prisma } from '@/server/db';
import { schemas } from '@/server/schemas';
import { providerDashboard, saveListing } from '@/server/services/providers';
import { parseMoneyInput } from '@/shared/money';
import { COUNTRIES } from '@/shared/format';

export const GET = route({ auth: 'required' }, async ({ viewer }) => ({ dashboard: await providerDashboard(viewer) }));

export const PUT = route({ auth: 'required', body: schemas.listing }, async ({ body, viewer }) => {
  const existing = await prisma.provider.findUnique({ where: { ownerId: viewer.id }, select: { rateCurrency: true } });
  const currency = existing?.rateCurrency || COUNTRIES[body.country || viewer.country]?.currency || 'USD';
  const price = (value) => {
    if (value === undefined) return undefined;
    if (!value || /quote/i.test(value)) return null;
    const minor = parseMoneyInput(value, currency);
    if (minor == null) throw invalid('Rates: write them like 350K or 350,000.');
    return minor;
  };
  return withStatus(200, {
    provider: await saveListing(viewer, {
      ...body,
      rateMinor: price(body.rate),
      // A rate sent without a unit is a starting price: clear any old unit.
      rateUnit: body.rate === undefined ? undefined : body.rateUnit || null,
      rateCurrency: currency,
      services: body.services?.map((service) => ({ ...service, rateMinor: price(service.rate), rateUnit: service.rateUnit || null })),
    }),
  });
});
