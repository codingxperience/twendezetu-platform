import HomeView from './_views/home';
import { getViewer } from '@/server/viewer';
import { homeView } from '@/server/views/home';

export const dynamic = 'force-dynamic';

export default async function HomePage({ searchParams }) {
  const params = (await searchParams) || {};
  const viewer = await getViewer();
  const data = await homeView(viewer);
  return <HomeView data={data} params={{ cat: typeof params.cat === 'string' ? params.cat : undefined }} />;
}
