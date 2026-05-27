import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { hashPassword, createSession } from '@/lib/auth';
import { created, badRequest, zodError, serverError } from '@/lib/api';

const Body = z.object({
  name: z.string().min(2, 'Name is required').max(100),
  email: z.string().email('Enter a valid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  city: z.string().optional(),
  role: z.enum(['customer', 'vendor']).optional(),
  phone: z.string().optional(),
});

export async function POST(req) {
  let body;
  try { body = Body.parse(await req.json()); } catch (e) { return zodError(e); }

  const existing = await prisma.user.findUnique({ where: { email: body.email.toLowerCase() } });
  if (existing) return badRequest('An account with that email already exists.');

  try {
    const passwordHash = await hashPassword(body.password);
    const user = await prisma.user.create({
      data: {
        email: body.email.toLowerCase(),
        name: body.name,
        passwordHash,
        city: body.city || 'Nairobi',
        role: body.role || 'customer',
        phone: body.phone,
      },
      select: { id: true, email: true, name: true, role: true, city: true },
    });
    await createSession(user.id, req);
    return created({ user });
  } catch (e) {
    console.error(e);
    return serverError('Could not create account.');
  }
}
