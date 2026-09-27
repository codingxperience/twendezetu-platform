import { redirect } from 'next/navigation';
import SignInView from '../_views/signin';
import { getViewer } from '@/server/viewer';
import { checkPasswordReset } from '@/server/services/identity';
import { homeFor } from '@/server/security/staff';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Sign in — Twendezetu',
  description: 'Sign in or create your free Twendezetu account.',
  robots: { index: false },
  referrer: 'no-referrer',
};

const text = (value) => (typeof value === 'string' ? value.slice(0, 300) : undefined);

export default async function SignInPage({ searchParams }) {
  const params = (await searchParams) || {};
  const next = text(params.next);
  const safeNext = next && next.startsWith('/') && !next.startsWith('//') ? next : null;
  const reset = text(params.reset);
  const viewer = reset ? null : await getViewer();
  if (viewer) redirect(safeNext || homeFor(viewer));
  // A reset link is checked as the page renders, so an expired or used one
  // says so before anyone types a new password.
  const data = reset ? { reset: await checkPasswordReset(reset) } : {};
  return <SignInView data={data} params={{ next: safeNext, mode: text(params.mode), role: text(params.role), reset, ref: text(params.ref) }} />;
}
