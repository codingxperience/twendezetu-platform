import { notFound, redirect } from 'next/navigation';
import { requireViewer } from '@/server/viewer';
import { claimServiceRequest } from '@/server/services/providers';

export const dynamic = 'force-dynamic';

export const metadata = { title: 'Your request — Twendezetu', robots: { index: false } };

// The link from a guest's email: sign in (or create an account), and the
// conversation with the provider moves into Messages.
export default async function ClaimRequestPage({ params, searchParams }) {
  const { id } = await params;
  const { key } = (await searchParams) || {};
  const viewer = await requireViewer(`/requests/${encodeURIComponent(id)}/claim?key=${encodeURIComponent(String(key || ''))}`);
  const result = await claimServiceRequest(viewer, id, typeof key === 'string' ? key : '').catch((error) => {
    // A wrong key, or a request another account already joined, reads as not found.
    if (error.status === 404 || error.status === 403) return null;
    throw error;
  });
  if (!result) notFound();
  redirect(`/messages?thread=${result.threadId}`);
}
