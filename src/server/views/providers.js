// The provider directory: every listed provider, filtered by category, city
// or a search.

import { prisma } from '../db.js';
import { listProviders } from '../services/providers.js';
import { PROVIDER_CATEGORIES } from '../../shared/format.js';
import { me } from './common.js';

const clean = (value, max = 80) => (typeof value === 'string' && value.trim() ? value.trim().slice(0, max) : undefined);

export async function providersView(viewer, params = {}) {
  const category = PROVIDER_CATEGORIES[params.category] ? params.category : undefined;
  const city = clean(params.city);
  const q = clean(params.q);
  const [person, providers, counts, cities] = await Promise.all([
    me(viewer),
    listProviders({ category, city, q, limit: 120 }),
    prisma.provider.groupBy({ by: ['category'], where: { status: 'ACTIVE' }, _count: { _all: true } }),
    prisma.provider.groupBy({ by: ['city'], where: { status: 'ACTIVE' }, _count: { _all: true }, orderBy: { _count: { city: 'desc' } }, take: 8 }),
  ]);
  const total = counts.reduce((sum, row) => sum + row._count._all, 0);
  return {
    me: person,
    filters: { category: category || null, city: city || null, q: q || null },
    providers,
    categories: [
      { code: null, label: 'All', count: total },
      ...Object.entries(PROVIDER_CATEGORIES).map(([code, item]) => ({ code, label: item.label, count: counts.find((row) => row.category === code)?._count._all || 0 })),
    ],
    cities: cities.map((row) => ({ name: row.city, count: row._count._all })),
  };
}
