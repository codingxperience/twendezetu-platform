import { cookies } from 'next/headers';
import HomeView from './_views/home';
import { getViewer } from '@/server/viewer';
import { homeView } from '@/server/views/home';

export const dynamic = 'force-dynamic';

export default async function HomePage({ searchParams }) {
  const params = (await searchParams) || {};
  const viewer = await getViewer();
  // The city picked in the header: from the link, else the one remembered.
  const remembered = (await cookies()).get('tz_city')?.value;
  const city = typeof params.city === 'string' ? params.city : remembered ? decodeURIComponent(remembered) : undefined;
  const data = await homeView(viewer, { city });
  return <HomeView data={data} params={{ cat: typeof params.cat === 'string' ? params.cat : undefined, city }} />;
}
