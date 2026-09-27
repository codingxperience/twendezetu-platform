'use client';

import { DesignView } from '@/design/DesignView';
import template from '@/design/templates/create';
import * as logic from '@/design/pages/create';

export default function CreateView(props) {
  return <DesignView template={template} logic={logic} view="create" {...props} />;
}
