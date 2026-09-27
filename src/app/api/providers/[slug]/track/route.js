import { route, withStatus } from '@/server/http';
import { prisma } from '@/server/db';
import { recordProfileView } from '@/server/services/providers';

export const POST = route({ auth: 'none', limit: false }, async ({ params, ip }) => {
  const provider = await prisma.provider.findUnique({ where: { slug: params.slug }, select: { id: true, status: true } });
  if (provider?.status === 'ACTIVE') await recordProfileView(provider.id, ip);
  return withStatus(202, { tracked: Boolean(provider) });
});
