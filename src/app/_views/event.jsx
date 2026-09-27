'use client';

import { DesignView } from '@/design/DesignView';
import standard from '@/design/templates/eventDetail';
import flagship from '@/design/templates/event';
import * as logic from '@/design/pages/event';

export default function EventView({ data, ...props }) {
  return <DesignView template={data.template === 'event' ? flagship : standard} logic={logic} view="event" data={data} {...props} />;
}
