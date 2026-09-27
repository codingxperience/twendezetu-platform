'use client';

import { DesignView } from '@/design/DesignView';
import template from '@/design/templates/organizerAnalytics';
import * as logic from '@/design/pages/organizerAnalytics';

export default function OrganizerAnalyticsView(props) {
  return <DesignView template={template} logic={logic} view="organizerAnalytics" {...props} />;
}
