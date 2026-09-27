// The signed-in person, for server components. Memoised per request with
// React's cache(), so a page and its layout share one lookup.

import 'server-only';
import { cache } from 'react';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { resolveSession, sessionCookieName } from './security/sessions.js';
import { staffTwoFactorMissing } from './security/staff.js';

const resolveCurrent = cache(async () => {
  const jar = await cookies();
  const resolved = await resolveSession(jar.get(sessionCookieName())?.value);
  if (!resolved || resolved.session.mfaPending) return null;
  return resolved;
});

export const getViewer = cache(async () => (await resolveCurrent())?.user || null);

// The signed-in session itself, for pages that show "this device".
export const getSession = cache(async () => (await resolveCurrent())?.session || null);

export async function requireViewer(nextPath) {
  const viewer = await getViewer();
  if (!viewer) redirect(`/sign-in?next=${encodeURIComponent(nextPath || '/my-twende')}`);
  return viewer;
}

export async function requireRole(roles, nextPath) {
  const viewer = await requireViewer(nextPath);
  if (!roles.includes(viewer.role)) redirect('/my-twende');
  if (staffTwoFactorMissing(viewer)) redirect('/settings?tab=security');
  return viewer;
}
