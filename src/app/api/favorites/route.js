import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { ok, authError, badRequest, zodError, serializeVendor } from '@/lib/api';

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return authError();
  const favs = await prisma.favorite.findMany({
    where: { userId: user.id },
    include: { vendor: { include: { packages: { orderBy: { sortOrder: 'asc' } } } } },
    orderBy: { createdAt: 'desc' },
  });
  return ok({ favorites: favs.map((f) => serializeVendor(f.vendor)) });
}

const Body = z.object({ vendorId: z.string().min(1) });

export async function POST(req) {
  const user = await getCurrentUser();
  if (!user) return authError();
  let body;
  try { body = Body.parse(await req.json()); } catch (e) { return zodError(e); }

  const vendor = await prisma.vendor.findUnique({ where: { id: body.vendorId } });
  if (!vendor) return badRequest('Vendor not found.');

  const existing = await prisma.favorite.findUnique({
    where: { userId_vendorId: { userId: user.id, vendorId: body.vendorId } },
  });
  if (existing) {
    await prisma.favorite.delete({ where: { userId_vendorId: { userId: user.id, vendorId: body.vendorId } } });
    return ok({ saved: false });
  }
  await prisma.favorite.create({ data: { userId: user.id, vendorId: body.vendorId } });
  return ok({ saved: true });
}
