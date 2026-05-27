import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { serializeVendor } from '@/lib/api';
import { BookingFlowClient } from './booking-flow-client';

export const dynamic = 'force-dynamic';

export default async function BookPage({ params }) {
  const { id } = await params;
  const vendor = await prisma.vendor.findUnique({
    where: { slug: id },
    include: { packages: { orderBy: { sortOrder: 'asc' } } },
  });
  if (!vendor) notFound();
  return <BookingFlowClient vendor={serializeVendor(vendor)} />;
}
