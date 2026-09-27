'use client';

import { DesignView } from '@/design/DesignView';
import template from '@/design/templates/providerDashboard';
import * as logic from '@/design/pages/providerDashboard';

export default function ProviderDashboardView(props) {
  return <DesignView template={template} logic={logic} view="providerDashboard" {...props} />;
}
