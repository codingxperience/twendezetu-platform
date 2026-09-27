// Staff accounts can move money and read private documents, so in
// production their tools stay closed until two-step verification is on.

import { config } from '../config.js';

export const STAFF_ROLES = Object.freeze(['ADMIN', 'MODERATOR', 'FINANCE']);

export function isStaff(user) {
  return Boolean(user && STAFF_ROLES.includes(user.role));
}

export function staffTwoFactorMissing(user) {
  return config().production && isStaff(user) && !user.twoFactorEnabled;
}
