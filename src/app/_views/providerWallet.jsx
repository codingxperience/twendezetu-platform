'use client';

import { DesignView } from '@/design/DesignView';
import template from '@/design/templates/providerWallet';
import * as logic from '@/design/pages/providerWallet';

export default function ProviderWalletView(props) {
  return <DesignView template={template} logic={logic} view="providerWallet" {...props} />;
}
