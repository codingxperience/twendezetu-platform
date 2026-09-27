import { route, setSessionCookie, withStatus } from '@/server/http';
import { schemas } from '@/server/schemas';
import { signIn } from '@/server/services/identity';

// Per-IP and per-account limits are applied inside signIn, keyed on the email.
export const POST = route({ auth: 'none', body: schemas.signIn, limit: false }, async ({ body, ip, req }) => {
  const result = await signIn({ email: body.email, password: body.password, ipAddress: ip, userAgent: req.headers.get('user-agent') });
  await setSessionCookie(result.session.token, result.session.expiresAt);
  return withStatus(200, { twoFactorRequired: result.mfaRequired, phoneHint: result.phoneHint });
});
