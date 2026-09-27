'use client';

import { DesignView } from '@/design/DesignView';
import template from '@/design/templates/disputes';
import * as logic from '@/design/pages/disputes';

export default function DisputesView(props) {
  return <DesignView template={template} logic={logic} view="disputes" {...props} />;
}
