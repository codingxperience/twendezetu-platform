import MyTwendeView from '../_views/myTwende';
import { requireViewer } from '@/server/viewer';
import { myTwendeView } from '@/server/views/myTwende';

export const dynamic = 'force-dynamic';

export const metadata = { title: 'My Twende — Twendezetu', robots: { index: false } };

export default async function MyTwendePage({ searchParams }) {
  const params = (await searchParams) || {};
  const tab = typeof params.tab === 'string' ? params.tab : undefined;
  const viewer = await requireViewer(tab ? `/my-twende?tab=${encodeURIComponent(tab)}` : '/my-twende');
  const data = await myTwendeView(viewer);
  return <MyTwendeView data={data} params={{ tab }} />;
}
