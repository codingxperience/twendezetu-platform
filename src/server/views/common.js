// What every page needs to know about the person looking at it.

import { prisma } from '../db.js';
import { config } from '../config.js';
import { initials } from '../../shared/format.js';

const LOCALES = ['EN', 'SW', 'FR', 'ES'];

// The language picked on this device (the `tz_lang` cookie, set by the
// language picker) and whether the picker was folded away. The cookie wins
// over the account's saved language, so the picker answers at once on every
// device; signing in elsewhere falls back to the account's choice.
async function devicePrefs() {
  try {
    const { cookies } = await import('next/headers');
    const jar = await cookies();
    const lang = jar.get('tz_lang')?.value;
    return { locale: LOCALES.includes(lang) ? lang : null, langPillClosed: jar.get('tz_langpill')?.value === 'closed' };
  } catch {
    return { locale: null, langPillClosed: false };
  }
}

export async function me(viewer) {
  const device = await devicePrefs();
  if (!viewer) {
    return {
      locale: device.locale || 'EN',
      langPillClosed: device.langPillClosed,
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
    locale: device.locale || (LOCALES.includes(viewer.locale) ? viewer.locale : 'EN'),
    langPillClosed: device.langPillClosed,
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
