import { redirect } from 'next/navigation';
import SignInView from '../_views/signin';
import { getViewer } from '@/server/viewer';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Sign in — Twendezetu',
  description: 'Sign in or create your free Twendezetu account.',
  robots: { index: false },
};

const text = (value) => (typeof value === 'string' ? value.slice(0, 300) : undefined);

export default async function SignInPage({ searchParams }) {
  const params = (await searchParams) || {};
  const next = text(params.next);
  const safeNext = next && next.startsWith('/') && !next.startsWith('//') ? next : null;
  if (!params.reset && (await getViewer())) redirect(safeNext || '/my-twende');
  return <SignInView data={{}} params={{ next: safeNext, mode: text(params.mode), role: text(params.role), reset: text(params.reset), ref: text(params.ref) }} />;
}
