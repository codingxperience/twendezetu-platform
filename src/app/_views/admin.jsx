'use client';

import { DesignView } from '@/design/DesignView';
import template from '@/design/templates/admin';
import * as logic from '@/design/pages/admin';

export default function AdminView(props) {
  return <DesignView template={template} logic={logic} view="admin" {...props} />;
}
