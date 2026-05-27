import { prisma } from '@/lib/prisma';
import { ok, serializeVendor } from '@/lib/api';

export async function GET(req) {
  const url = new URL(req.url);
  const category = url.searchParams.get('category') || undefined;
  const city = url.searchParams.get('city') || undefined;
  const country = url.searchParams.get('country') || undefined;
  const q = url.searchParams.get('q')?.toLowerCase() || '';
  const sort = url.searchParams.get('sort') || 'recommended';
  const limit = Math.min(Number(url.searchParams.get('limit')) || 50, 100);

  const where = { published: true };
  if (category) where.category = category;
  if (city) where.city = city;
  if (country) where.country = country;
  if (q) {
    where.OR = [
      { name: { contains: q } },
      { type: { contains: q } },
      { city: { contains: q } },
      { country: { contains: q } },
      { tags: { contains: q } },
      { description: { contains: q } },
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
