import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { serializeBooking } from '@/lib/api';
import { ConfirmClient } from './confirm-client';

export const dynamic = 'force-dynamic';

export default async function ConfirmPage({ params }) {
  const user = await getCurrentUser();
  if (!user) redirect('/sign-in');
  const { id } = await params;
  const booking = await prisma.booking.findUnique({
    where: { id },
    include: {
      vendor: true,
      package: true,
      messages: { include: { sender: { select: { name: true } } }, orderBy: { createdAt: 'asc' } },
    },
  });
  if (!booking || booking.customerId !== user.id) notFound();
  return <ConfirmClient booking={serializeBooking(booking)} />;
}
