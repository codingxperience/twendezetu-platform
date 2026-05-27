import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { ok, created, authError, badRequest, zodError, serializeBooking } from '@/lib/api';

// GET /api/bookings  → bookings the current user is involved in
export async function GET() {
  const user = await getCurrentUser();
  if (!user) return authError();

  const where = user.role === 'vendor' && user.vendor
    ? { vendorId: user.vendor.id }
    : { customerId: user.id };

  const bookings = await prisma.booking.findMany({
    where,
    include: {
      vendor: { select: { id: true, slug: true, name: true, city: true, country: true, type: true, coverImage: true } },
      package: { select: { id: true, name: true } },
      customer: { select: { id: true, name: true, email: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
  return ok({ bookings: bookings.map(serializeBooking) });
}

const Body = z.object({
  vendorId: z.string().min(1),
  packageId: z.string().min(1),
  eventDate: z.string().min(8),
  guests: z.number().int().positive().max(5000),
  contactName: z.string().min(2),
  contactPhone: z.string().min(6),
  notes: z.string().optional(),
  addOns: z.array(z.string()).optional(),
  currency: z.enum(['KES', 'UGX', 'TZS', 'RWF']).optional(),
});

export async function POST(req) {
  const user = await getCurrentUser();
  if (!user) return authError();
  let body;
  try { body = Body.parse(await req.json()); } catch (e) { return zodError(e); }

  const pkg = await prisma.package.findUnique({ where: { id: body.packageId }, include: { vendor: true } });
  if (!pkg || pkg.vendorId !== body.vendorId) return badRequest('Invalid package for this vendor.');

  const subtotal = pkg.price;
  const serviceFee = Math.round(subtotal * 0.05);
  const vat = Math.round((subtotal + serviceFee) * 0.16);
  const total = subtotal + serviceFee + vat;
  const depositAmount = Math.round(total * 0.30);

  const booking = await prisma.booking.create({
    data: {
      customerId: user.id,
      vendorId: body.vendorId,
      packageId: body.packageId,
      eventDate: new Date(body.eventDate),
      guests: body.guests,
      contactName: body.contactName,
      contactPhone: body.contactPhone,
      notes: body.notes || null,
      addOns: (body.addOns || []).join(','),
      subtotal, serviceFee, vat, total, depositAmount,
      currency: body.currency || 'KES',
      status: 'confirmed',
      paymentStatus: 'deposit_paid',
    },
    include: {
      vendor: { select: { id: true, slug: true, name: true, city: true, country: true, type: true, coverImage: true } },
      package: { select: { id: true, name: true } },
    },
  });

  // Seed an initial vendor reply for a lifelike conversation
  await prisma.message.create({
    data: {
      bookingId: booking.id,
      senderId: pkg.vendor.ownerId || user.id, // fallback if vendor has no owner
      fromRole: 'vendor',
      body: `Karibu! Asante kwa kuchagua ${pkg.vendor.name}. I'll be in touch within 24 hours with timeline details for your ${body.guests}-guest event.`,
    },
  });

  return created({ booking: serializeBooking(booking) });
}
