'use client';

import { DesignView } from '@/design/DesignView';
import template from '@/design/templates/splitPay';
import * as logic from '@/design/pages/splitPay';

export default function SplitPayView(props) {
  return <DesignView template={template} logic={logic} view="splitPay" {...props} />;
}
