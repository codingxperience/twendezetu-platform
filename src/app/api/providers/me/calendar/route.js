import { route } from '@/server/http';
import { providerBookingsCalendar } from '@/server/services/providers';

export const GET = route({ auth: 'required' }, async ({ viewer }) =>
  new Response(await providerBookingsCalendar(viewer), {
    headers: {
      'content-type': 'text/calendar; charset=utf-8',
      'content-disposition': 'attachment; filename="twendezetu-bookings.ics"',
      'cache-control': 'private, no-store',
    },
  }));
