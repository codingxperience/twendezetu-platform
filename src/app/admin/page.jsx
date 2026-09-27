import AdminView from '../_views/admin';
import { requireRole } from '@/server/viewer';
import { adminView } from '@/server/views/admin';

export const dynamic = 'force-dynamic';

export const metadata = { title: 'Admin console — Twendezetu', robots: { index: false } };

export default async function AdminPage({ searchParams }) {
  const params = (await searchParams) || {};
  const section = typeof params.section === 'string' ? params.section : undefined;
  const q = typeof params.q === 'string' ? params.q.slice(0, 80) : undefined;
  const viewer = await requireRole(['ADMIN', 'MODERATOR'], `/admin${section ? `?section=${section}` : ''}`);
  const data = await adminView(viewer, { section, q });
  return <AdminView data={data} params={{ section: data.section, q }} />;
}
