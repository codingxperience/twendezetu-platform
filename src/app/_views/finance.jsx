'use client';

import { DesignView } from '@/design/DesignView';
import template from '@/design/templates/finance';
import * as logic from '@/design/pages/finance';

export default function FinanceView(props) {
  return <DesignView template={template} logic={logic} view="finance" {...props} />;
}
