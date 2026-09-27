'use client';

import { DesignView } from '@/design/DesignView';
import template from '@/design/templates/signin';
import * as logic from '@/design/pages/signin';

export default function SignInView(props) {
  return <DesignView template={template} logic={logic} {...props} />;
}
