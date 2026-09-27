'use client';

import { DesignView } from '@/design/DesignView';
import template from '@/design/templates/messages';
import * as logic from '@/design/pages/messages';

export default function MessagesView(props) {
  return <DesignView template={template} logic={logic} view="messages" {...props} />;
}
