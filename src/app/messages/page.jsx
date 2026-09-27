import MessagesView from '../_views/messages';
import { requireViewer } from '@/server/viewer';
import { messagesView } from '@/server/views/messages';

export const dynamic = 'force-dynamic';

export const metadata = { title: 'Messages — Twendezetu', robots: { index: false } };

export default async function MessagesPage({ searchParams }) {
  const params = (await searchParams) || {};
  const thread = typeof params.thread === 'string' ? params.thread.slice(0, 40) : undefined;
  const viewer = await requireViewer(thread ? `/messages?thread=${encodeURIComponent(thread)}` : '/messages');
  const data = await messagesView(viewer, { thread });
  return <MessagesView data={data} params={{ thread }} />;
}
