// The private link in emails to guests who asked a provider something
// without an account. It is derived from the request id with a server key,
// so it cannot be guessed, needs no storage and never expires; opening it
// while signed in joins the conversation to that account.

import { hmac } from '../security/crypto.js';

export function requestClaimKey(requestId) {
  return hmac('request-claim', requestId).toString('base64url').slice(0, 32);
}

export function requestClaimPath(requestId) {
  return `/requests/${requestId}/claim?key=${requestClaimKey(requestId)}`;
}
