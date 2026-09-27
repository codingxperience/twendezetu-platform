'use client';

import { DesignView } from '@/design/DesignView';
import template from '@/design/templates/providerVerification';
import * as logic from '@/design/pages/providerVerification';

export default function ProviderVerificationView(props) {
  return <DesignView template={template} logic={logic} view="providerVerification" {...props} />;
}
