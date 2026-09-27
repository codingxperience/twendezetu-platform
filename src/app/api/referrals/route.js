import { route } from '@/server/http';
import { prisma } from '@/server/db';
import { referralSummary } from '@/server/services/referrals';

export const GET = route({ auth: 'required' }, async ({ viewer }) => referralSummary(prisma, viewer.id));
