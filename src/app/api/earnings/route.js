import { route } from '@/server/http';
import { providerWallet } from '@/server/services/payouts';

export const GET = route({ auth: 'required' }, async ({ viewer }) => providerWallet(viewer));
