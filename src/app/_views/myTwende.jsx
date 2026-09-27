'use client';

import { DesignView } from '@/design/DesignView';
import template from '@/design/templates/myTwende';
import * as logic from '@/design/pages/myTwende';

export default function MyTwendeView(props) {
  return <DesignView template={template} logic={logic} view="myTwende" {...props} />;
}
