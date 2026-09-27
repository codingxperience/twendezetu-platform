import { notFound } from 'next/navigation';
import ProviderView from '../../_views/provider';
import { prisma } from '@/server/db';
import { getViewer } from '@/server/viewer';
import { providerView } from '@/server/views/provider';
import { previewMetadata } from '@/server/og';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const provider = await prisma.provider.findUnique({ where: { slug }, select: { name: true, headline: true, coverUrl: true, status: true, slug: true } });
  if (!provider || provider.status !== 'ACTIVE') return { title: 'Provider — Twendezetu', robots: { index: false } };
  return previewMetadata({ title: provider.name, description: provider.headline, path: `/providers/${provider.slug}`, image: provider.coverUrl });
}

export default async function ProviderPage({ params }) {
  const { slug } = await params;
  const viewer = await getViewer();
  const data = await providerView(viewer, { slug });
  if (!data) notFound();
  return <ProviderView data={data} params={{ slug }} />;
}
