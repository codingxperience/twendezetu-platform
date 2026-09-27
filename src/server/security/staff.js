// Staff accounts can move money and read private documents, so in
// production their tools stay closed until two-step verification is on.

import { config } from '../config.js';

export const STAFF_ROLES = Object.freeze(['ADMIN', 'MODERATOR', 'FINANCE']);

export function isStaff(user) {
  return Boolean(user && STAFF_ROLES.includes(user.role));
}

// Where someone lands after signing in: staff go straight to their console,
// everyone else to My Twende.
export function homeFor(user) {
  if (user?.role === 'ADMIN' || user?.role === 'MODERATOR') return '/admin';
  if (user?.role === 'FINANCE') return '/finance';
  return '/my-twende';
}

export function staffTwoFactorMissing(user) {
  return config().production && isStaff(user) && !user.twoFactorEnabled;
}
