'use client';

import { DesignView } from '@/design/DesignView';
import template from '@/design/templates/settings';
import * as logic from '@/design/pages/settings';

export default function SettingsView(props) {
  return <DesignView template={template} logic={logic} view="settings" {...props} />;
}
