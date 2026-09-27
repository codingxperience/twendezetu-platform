'use client';

import { DesignView } from '@/design/DesignView';
import full from '@/design/templates/provider';
import compact from '@/design/templates/providerDetail';
import * as logic from '@/design/pages/provider';

export default function ProviderView({ data, ...props }) {
  return <DesignView template={data.layout === 'provider' ? full : compact} logic={logic} view="provider" data={data} {...props} />;
}
