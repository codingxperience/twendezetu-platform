// Account settings: profile, notifications, payout methods and security.

import { prisma } from '../db.js';
import { unauthorized } from '../errors.js';
import { notificationSettings, paymentMethods } from '../services/account.js';
import { listSessions } from '../security/sessions.js';
import { maskPhone } from '../services/identity.js';
import { timezoneFor } from '../notify/preferences.js';
import { COUNTRIES, relativeTime } from '../../shared/format.js';
import { DISPLAY_CURRENCIES } from '../../shared/money.js';
import { me } from './common.js';

// "Chrome on macOS" from a user-agent string: enough to recognise a device.
function deviceName(agent = '') {
  const browser = /Edg\//.test(agent) ? 'Edge' : /OPR\//.test(agent) ? 'Opera' : /Chrome\//.test(agent) ? 'Chrome' : /Firefox\//.test(agent) ? 'Firefox' : /Safari\//.test(agent) ? 'Safari' : 'Browser';
  const system = /iPhone|iPad/.test(agent) ? 'iPhone' : /Android/.test(agent) ? 'Android' : /Mac OS X/.test(agent) ? 'macOS' : /Windows/.test(agent) ? 'Windows' : /Linux/.test(agent) ? 'Linux' : 'unknown device';
  return `${browser} on ${system}`;
}

export async function settingsView(viewer, { session } = {}) {
  if (!viewer) throw unauthorized();
  const [person, account, notifications, methods, sessions] = await Promise.all([
    me(viewer),
    prisma.user.findUnique({
      where: { id: viewer.id },
      select: { name: true, email: true, phone: true, phoneVerifiedAt: true, city: true, country: true, currency: true, avatarUrl: true, twoFactorEnabled: true, passwordChangedAt: true, createdAt: true },
    }),
    notificationSettings(viewer.id, { provider: Boolean(viewer.provider) }),
    paymentMethods(viewer.id),
    listSessions(viewer.id),
  ]);

  return {
    me: person,
    profile: {
      name: account.name,
      businessName: viewer.provider?.name || '',
      email: account.email,
      phone: account.phone || '',
      phoneMasked: account.phone ? maskPhone(account.phone) : null,
      phoneVerified: Boolean(account.phoneVerifiedAt),
      city: account.city || '',
      country: account.country || 'US',
      currency: account.currency,
      avatarUrl: account.avatarUrl,
      timezone: timezoneFor(account.country),
    },
    isProvider: Boolean(viewer.provider),
    countries: Object.entries(COUNTRIES).map(([code, item]) => ({ code, name: item.name })),
    currencies: DISPLAY_CURRENCIES,
    notifications,
    methods: methods.map((method) => ({ id: method.id, kind: method.kind, label: method.label, isDefault: method.isDefault, payouts: method.usableForPayouts, added: relativeTime(method.createdAt) })),
    security: {
      twoFactor: account.twoFactorEnabled,
      passwordChanged: account.passwordChangedAt ? relativeTime(account.passwordChangedAt) : null,
      memberSince: account.createdAt.getUTCFullYear(),
    },
    sessions: sessions.map((row) => ({ id: row.id, device: deviceName(row.userAgent || ''), lastSeen: relativeTime(row.lastSeenAt || row.createdAt), current: row.id === session?.id })),
  };
}
