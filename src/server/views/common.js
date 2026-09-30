// What every page needs to know about the person looking at it.

import { prisma } from '../db.js';
import { config } from '../config.js';
import { initials } from '../../shared/format.js';

// The language a visitor without an account picked, kept in a cookie.
async function cookieLocale() {
  try {
    const { cookies } = await import('next/headers');
    return (await cookies()).get('tz_lang')?.value === 'SW' ? 'SW' : 'EN';
  } catch {
    return 'EN';
  }
}

export async function me(viewer) {
  if (!viewer) {
    return {
      locale: await cookieLocale(),
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
    locale: viewer.locale === 'SW' ? 'SW' : 'EN',
    city: viewer.city || '',
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
