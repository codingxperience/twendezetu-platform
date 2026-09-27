import SettingsView from '../_views/settings';
import { getSession, requireViewer } from '@/server/viewer';
import { settingsView } from '@/server/views/settings';

export const dynamic = 'force-dynamic';

export const metadata = { title: 'Settings — Twendezetu', robots: { index: false } };

export default async function SettingsPage({ searchParams }) {
  const params = (await searchParams) || {};
  const tab = typeof params.tab === 'string' ? params.tab : undefined;
  const viewer = await requireViewer(tab ? `/settings?tab=${encodeURIComponent(tab)}` : '/settings');
  const data = await settingsView(viewer, { session: await getSession() });
  return <SettingsView data={data} params={{ tab }} />;
}
