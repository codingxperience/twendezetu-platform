import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { ok, created, authError, notFound, zodError } from '@/lib/api';

const Body = z.object({ body: z.string().min(1).max(2000) });

export async function GET(_req, { params }) {
  const user = await getCurrentUser();
  if (!user) return authError();
  const { id } = await params;
  const booking = await prisma.booking.findUnique({ where: { id }, select: { customerId: true, vendorId: true } });
  if (!booking) return notFound();
  const allowed = booking.customerId === user.id || (user.vendor && booking.vendorId === user.vendor.id);
  if (!allowed) return notFound();

  const messages = await prisma.message.findMany({
    where: { bookingId: id },
    include: { sender: { select: { name: true } } },
    orderBy: { createdAt: 'asc' },
  });
  return ok({ messages: messages.map((m) => ({ id: m.id, fromRole: m.fromRole, body: m.body, senderName: m.sender?.name, createdAt: m.createdAt.toISOString() })) });
}

export async function POST(req, { params }) {
  const user = await getCurrentUser();
  if (!user) return authError();
  const { id } = await params;
  let payload;
  try { payload = Body.parse(await req.json()); } catch (e) { return zodError(e); }

  const booking = await prisma.booking.findUnique({ where: { id }, select: { customerId: true, vendorId: true, vendor: { select: { ownerId: true } } } });
  if (!booking) return notFound();
  const isCustomer = booking.customerId === user.id;
  const isVendor = user.vendor && booking.vendorId === user.vendor.id;
  if (!isCustomer && !isVendor) return notFound();

  const msg = await prisma.message.create({
    data: {
      bookingId: id,
      senderId: user.id,
      fromRole: isVendor ? 'vendor' : 'customer',
      body: payload.body,
    },
    include: { sender: { select: { name: true } } },
  });
  return created({ message: { id: msg.id, fromRole: msg.fromRole, body: msg.body, senderName: msg.sender?.name, createdAt: msg.createdAt.toISOString() } });
}
