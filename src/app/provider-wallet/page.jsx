import ProviderWalletView from '../_views/providerWallet';
import { requireViewer } from '@/server/viewer';
import { providerWalletView } from '@/server/views/providerWallet';

export const dynamic = 'force-dynamic';

export const metadata = { title: 'Business wallet — Twendezetu', robots: { index: false } };

export default async function ProviderWalletPage() {
  const viewer = await requireViewer('/provider-wallet');
  return <ProviderWalletView data={await providerWalletView(viewer)} />;
}
