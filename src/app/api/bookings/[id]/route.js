import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { ok, notFound, authError, serializeBooking } from '@/lib/api';

export async function GET(_req, { params }) {
  const user = await getCurrentUser();
  if (!user) return authError();
  const { id } = await params;
  const booking = await prisma.booking.findUnique({
    where: { id },
    include: {
      vendor: true,
      package: true,
      customer: { select: { id: true, name: true, email: true } },
      messages: { include: { sender: { select: { name: true } } }, orderBy: { createdAt: 'asc' } },
    },
  });
  if (!booking) return notFound();
  const allowed = booking.customerId === user.id || (user.vendor && booking.vendorId === user.vendor.id);
  if (!allowed) return notFound();
  return ok({ booking: serializeBooking(booking) });
}

export async function PATCH(req, { params }) {
  const user = await getCurrentUser();
  if (!user) return authError();
  const { id } = await params;
  const booking = await prisma.booking.findUnique({ where: { id } });
  if (!booking) return notFound();
  const allowed = booking.customerId === user.id || (user.vendor && booking.vendorId === user.vendor.id);
  if (!allowed) return notFound();

  const body = await req.json();
  const updates = {};
  if (body.status && ['cancelled', 'completed'].includes(body.status)) updates.status = body.status;

  const updated = await prisma.booking.update({ where: { id }, data: updates, include: { vendor: true, package: true } });
  return ok({ booking: serializeBooking(updated) });
}
