import { prisma } from '@/lib/prisma';
import { ok, serializeVendor } from '@/lib/api';

export async function GET(req) {
  const url = new URL(req.url);
  const category = url.searchParams.get('category') || undefined;
  const city = url.searchParams.get('city') || undefined;
  const country = url.searchParams.get('country') || undefined;
  const q = url.searchParams.get('q')?.trim() || '';
  const sort = url.searchParams.get('sort') || 'recommended';
  const requestedLimit = Number.parseInt(url.searchParams.get('limit') || '50', 10);
  const limit = Number.isFinite(requestedLimit) ? Math.min(Math.max(requestedLimit, 1), 100) : 50;

  const where = { published: true };
  if (category) where.category = category;
  if (city) where.city = city;
  if (country) where.country = country;
  if (q) {
    const contains = { contains: q, mode: 'insensitive' };
    where.OR = [
      { name: contains },
      { type: contains },
      { city: contains },
      { country: contains },
      { tags: contains },
      { description: contains },
    ];
  }

  const orderBy =
    sort === 'rating'   ? { rating: 'desc' } :
    sort === 'priceAsc' ? { basePrice: 'asc' } :
    sort === 'priceDesc'? { basePrice: 'desc' } :
    [{ superhost: 'desc' }, { rating: 'desc' }];

  const vendors = await prisma.vendor.findMany({
    where, orderBy, take: limit,
    include: { packages: { orderBy: { sortOrder: 'asc' } } },
  });
  return ok({ vendors: vendors.map(serializeVendor) });
}
