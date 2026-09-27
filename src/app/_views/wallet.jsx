'use client';

import { DesignView } from '@/design/DesignView';
import template from '@/design/templates/wallet';
import * as logic from '@/design/pages/wallet';

export default function WalletView(props) {
  return <DesignView template={template} logic={logic} view="wallet" {...props} />;
}
