// The admin console. Each section loads only its own data; the overview's
// counts drive the badges in the side menu.

import { unauthorized, forbidden } from '../errors.js';
import { adminOverview, adminSettings, contentList, listUsers, reportQueue } from '../services/moderation.js';
import { verificationQueue } from '../services/verification.js';
import { escalatedCases } from '../services/disputes.js';
import { me } from './common.js';

export const ADMIN_SECTIONS = ['overview', 'moderation', 'cases', 'users', 'verify', 'content', 'settings'];

export async function adminView(viewer, { section, q } = {}) {
  if (!viewer) throw unauthorized();
  if (!['ADMIN', 'MODERATOR'].includes(viewer.role)) throw forbidden();
  const current = ADMIN_SECTIONS.includes(section) ? section : 'overview';
  const [person, overview] = await Promise.all([me(viewer), adminOverview()]);
  const load = {
    overview: async () => ({}),
    moderation: async () => ({ reports: (await reportQueue()).reports }),
    cases: async () => ({ cases: await escalatedCases() }),
    users: async () => ({ users: await listUsers({ q }), query: q || '' }),
    verify: async () => ({ verifications: await verificationQueue() }),
    content: async () => ({ posts: await contentList() }),
    settings: async () => ({ settings: await adminSettings() }),
  };
  return {
    me: person,
    staff: { id: viewer.id, name: viewer.name, role: viewer.role, twoFactor: viewer.twoFactorEnabled, isAdmin: viewer.role === 'ADMIN' },
    section: current,
    overview,
    ...(await load[current]()),
  };
}
