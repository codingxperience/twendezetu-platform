import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { ok, authError, badRequest } from '@/lib/api';

// Vendor-only: list inquiries plus booking-derived "new leads" for the
// authenticated vendor's listing.
export async function GET() {
  const user = await getCurrentUser();
  if (!user) return authError();
  if (user.role !== 'vendor' || !user.vendor) return badRequest('Vendor account required.');

  const [inquiries, bookings] = await Promise.all([
    prisma.inquiry.findMany({ where: { vendorId: user.vendor.id }, orderBy: { createdAt: 'desc' } }),
    prisma.booking.findMany({
      where: { vendorId: user.vendor.id, status: { in: ['confirmed', 'pending_payment'] } },
      include: { customer: { select: { name: true } } },
      orderBy: { createdAt: 'desc' },
    }),
  ]);

  const leads = [
    ...bookings.map((b) => ({
      id: 'b-' + b.id,
      bookingId: b.id,
      kind: 'booking',
      customerName: b.customer?.name || b.contactName,
      event: `Booking · ${b.guests} guests`,
      eventDate: b.eventDate.toISOString(),
      status: b.status,
      isNew: true,
      createdAt: b.createdAt.toISOString(),
    })),
    ...inquiries.map((i) => ({
      id: i.id,
      kind: 'inquiry',
      customerName: i.customerName,
      event: i.event,
      eventDate: i.eventDate.toISOString(),
      status: i.status,
      isNew: i.status === 'new',
      createdAt: i.createdAt.toISOString(),
    })),
  ].sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  return ok({ inquiries: leads });
}
