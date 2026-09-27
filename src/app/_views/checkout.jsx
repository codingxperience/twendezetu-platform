'use client';

import { DesignView } from '@/design/DesignView';
import template from '@/design/templates/checkout';
import * as logic from '@/design/pages/checkout';

export default function CheckoutView(props) {
  return <DesignView template={template} logic={logic} view="checkout" {...props} />;
}
