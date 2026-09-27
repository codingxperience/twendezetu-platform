import ProviderVerificationView from '../_views/providerVerification';
import { requireViewer } from '@/server/viewer';
import { providerVerificationView } from '@/server/views/providerVerification';

export const dynamic = 'force-dynamic';

export const metadata = { title: 'Verification — Twendezetu', robots: { index: false } };

export default async function ProviderVerificationPage() {
  const viewer = await requireViewer('/provider-verification');
  return <ProviderVerificationView data={await providerVerificationView(viewer)} />;
}
