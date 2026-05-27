import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { serializeVendor } from '@/lib/api';
import { VendorDetailClient } from './vendor-detail-client';

export const dynamic = 'force-dynamic';

export default async function VendorPage({ params }) {
  const { id } = await params;
  const vendor = await prisma.vendor.findUnique({
    where: { slug: id },
    include: { packages: { orderBy: { sortOrder: 'asc' } } },
  });
  if (!vendor) notFound();
  return <VendorDetailClient vendor={serializeVendor(vendor)} />;
}
