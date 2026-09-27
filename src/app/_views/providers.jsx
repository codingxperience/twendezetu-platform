'use client';

import { DesignView } from '@/design/DesignView';
import template from '@/design/templates/providers';
import * as logic from '@/design/pages/providers';

export default function ProvidersView(props) {
  return <DesignView template={template} logic={logic} view="providers" {...props} />;
}
