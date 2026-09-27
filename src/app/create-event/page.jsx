import { notFound } from 'next/navigation';
import CreateView from '../_views/create';
import { requireViewer } from '@/server/viewer';
import { createView } from '@/server/views/create';

export const dynamic = 'force-dynamic';

export const metadata = { title: 'Post on Twendezetu', robots: { index: false } };

const text = (value) => (typeof value === 'string' ? value.slice(0, 120) : undefined);

export default async function CreateEventPage({ searchParams }) {
  const params = (await searchParams) || {};
  const kind = params.kind === 'need' ? 'need' : undefined;
  const edit = text(params.edit);
  const query = new URLSearchParams(Object.entries({ kind, edit }).filter(([, value]) => value)).toString();
  const viewer = await requireViewer(`/create-event${query ? `?${query}` : ''}`);
  const data = await createView(viewer, { kind, edit }).catch((error) => {
    // Someone else's post, or one that no longer exists, reads as not found.
    if (error.status === 404) return null;
    throw error;
  });
  if (!data) notFound();
  return <CreateView data={data} params={{ kind, edit }} />;
}
