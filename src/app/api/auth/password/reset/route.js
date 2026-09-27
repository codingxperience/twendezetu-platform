import { route, setSessionCookie, withStatus } from '@/server/http';
import { schemas } from '@/server/schemas';
import { resetPassword } from '@/server/services/identity';

export const POST = route({ auth: 'none', body: schemas.reset, limit: [{ policy: 'auth.reset', by: 'ip' }] }, async ({ body, ip, req }) => {
  const result = await resetPassword({ token: body.token, newPassword: body.password, ipAddress: ip, userAgent: req.headers.get('user-agent') });
  if (result.session) await setSessionCookie(result.session.token, result.session.expiresAt);
  return withStatus(200, { reset: true, signedIn: result.signedIn, email: result.email });
});
