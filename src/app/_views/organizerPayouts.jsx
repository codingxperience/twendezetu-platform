'use client';

import { DesignView } from '@/design/DesignView';
import template from '@/design/templates/organizerPayouts';
import * as logic from '@/design/pages/organizerPayouts';

export default function OrganizerPayoutsView(props) {
  return <DesignView template={template} logic={logic} view="organizerPayouts" {...props} />;
}
