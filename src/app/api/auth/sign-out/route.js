import { clearSessionCookie, readSessionCookie, route, withStatus } from '@/server/http';
import { revokeSessionByToken } from '@/server/security/sessions';

export const POST = route({ auth: 'none', limit: false }, async () => {
  await revokeSessionByToken(await readSessionCookie());
  await clearSessionCookie();
  return withStatus(200, { signedOut: true });
});
