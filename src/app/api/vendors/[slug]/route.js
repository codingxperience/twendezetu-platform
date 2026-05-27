import { prisma } from '@/lib/prisma';
import { ok, notFound, serializeVendor } from '@/lib/api';

export async function GET(_req, { params }) {
  const { slug } = await params;
  const vendor = await prisma.vendor.findUnique({
    where: { slug },
    include: { packages: { orderBy: { sortOrder: 'asc' } } },
  });
  if (!vendor) return notFound('Vendor not found');
  return ok({ vendor: serializeVendor(vendor) });
}
