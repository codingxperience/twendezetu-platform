import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { verifyPassword, createSession } from '@/lib/auth';
import { ok, badRequest, zodError } from '@/lib/api';

const Body = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function POST(req) {
  let body;
  try { body = Body.parse(await req.json()); } catch (e) { return zodError(e); }

  const user = await prisma.user.findUnique({
    where: { email: body.email.toLowerCase().trim() },
    select: { id: true, email: true, name: true, role: true, city: true, passwordHash: true },
  });
  if (!user) return badRequest('Invalid email or password.');

  const okPw = await verifyPassword(body.password, user.passwordHash);
  if (!okPw) return badRequest('Invalid email or password.');

  await createSession(user.id, req);
  const { passwordHash, ...safe } = user;
  return ok({ user: safe });
}
