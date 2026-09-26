// The signed-in person, for server components. Memoised per request with
// React's cache(), so a page and its layout share one lookup.

import 'server-only';
import { cache } from 'react';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { resolveSession, sessionCookieName } from './security/sessions.js';

export const getViewer = cache(async () => {
  const jar = await cookies();
  const resolved = await resolveSession(jar.get(sessionCookieName())?.value);
  if (!resolved || resolved.session.mfaPending) return null;
  return resolved.user;
});

export async function requireViewer(nextPath) {
  const viewer = await getViewer();
  if (!viewer) redirect(`/sign-in?next=${encodeURIComponent(nextPath || '/my-twende')}`);
  return viewer;
}

export async function requireRole(roles, nextPath) {
  const viewer = await requireViewer(nextPath);
  if (!roles.includes(viewer.role)) redirect('/my-twende');
  return viewer;
}
