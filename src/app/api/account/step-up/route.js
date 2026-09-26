import { route } from '@/server/http';
import { sendStepUpCode } from '@/server/services/identity';

// Texts a code that confirms a send, cash-out or withdrawal when two-step
// verification is on.
export const POST = route({ auth: 'required', limit: [{ policy: 'otp.send', by: 'user' }] }, async ({ viewer }) => sendStepUpCode(viewer));
