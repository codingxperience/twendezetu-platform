'use client';

import { DesignView } from '@/design/DesignView';
import template from '@/design/templates/checkin';
import * as logic from '@/design/pages/checkin';

export default function CheckinView(props) {
  return <DesignView template={template} logic={logic} view="checkin" {...props} />;
}
