'use client';

import { DesignView } from '@/design/DesignView';
import template from '@/design/templates/home';
import * as logic from '@/design/pages/home';

export default function HomeView(props) {
  return <DesignView template={template} logic={logic} view="home" {...props} />;
}
