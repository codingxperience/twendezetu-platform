import { route } from '@/server/http';
import { notFound } from '@/server/errors';
import { orderForViewer } from '@/server/services/checkout';
import { formatMoney } from '@/shared/money';

// Guests pass the key from their confirmation email as ?key=.
export const GET = route({ auth: 'optional' }, async ({ params, viewer, url }) => {
  const key = url.searchParams.get('key') || undefined;
  const order = await orderForViewer(params.reference, viewer, key);
  if (!order) throw notFound();
  return {
    reference: order.reference,
    status: order.status,
    total: formatMoney(order.totalMinor, order.currency),
    event: order.event,
    tickets: order.tickets,
  };
});
