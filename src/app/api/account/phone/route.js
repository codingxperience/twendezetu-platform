import { route, withStatus } from '@/server/http';
import { schemas } from '@/server/schemas';
import { confirmPhoneVerification, startPhoneVerification } from '@/server/services/identity';

// POST sends a code to the number; PUT confirms it.
export const POST = route({ auth: 'required', body: schemas.phone, limit: [{ policy: 'otp.send', by: 'user' }] }, async ({ body, viewer }) =>
  withStatus(200, await startPhoneVerification(viewer, body.phone)));

export const PUT = route({ auth: 'required', body: schemas.phoneVerify, limit: [{ policy: 'otp.verify', by: 'user' }] }, async ({ body, viewer }) =>
  confirmPhoneVerification(viewer, body.phone, body.code));
