'use client';

import { DesignView } from '@/design/DesignView';
import template from '@/design/templates/events';
import * as logic from '@/design/pages/events';

export default function EventsView(props) {
  return <DesignView template={template} logic={logic} {...props} />;
}
