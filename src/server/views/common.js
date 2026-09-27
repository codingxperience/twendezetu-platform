// What every page needs to know about the person looking at it.

import { prisma } from '../db.js';
import { config } from '../config.js';
import { initials } from '../../shared/format.js';

export async function me(viewer) {
  if (!viewer) {
    return {
      signedIn: false,
      signedOut: true,
      accountHref: '/sign-in',
      accountLabel: 'Sign in',
      isStaff: false,
      isFinance: false,
      isProvider: false,
      unread: 0,
    };
  }
  const unread = await prisma.notification.count({ where: { userId: viewer.id, readAt: null } });
  return {
    signedIn: true,
    signedOut: false,
    id: viewer.id,
    name: viewer.name,
    firstName: viewer.name.split(' ')[0],
    handle: viewer.handle,
    email: viewer.email,
    initials: initials(viewer.name),
    currency: viewer.currency,
    accountHref: '/my-twende',
    accountLabel: 'My Twende',
    isStaff: ['ADMIN', 'MODERATOR'].includes(viewer.role),
    isFinance: ['ADMIN', 'FINANCE'].includes(viewer.role),
    isProvider: Boolean(viewer.provider),
    providerSlug: viewer.provider?.slug || null,
    twoFactor: viewer.twoFactorEnabled,
    unread,
  };
}

export function appUrl() {
  return config().appUrl;
}
