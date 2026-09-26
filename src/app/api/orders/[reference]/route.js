import { route } from '@/server/http';
import { notFound } from '@/server/errors';
import { orderForViewer } from '@/server/services/checkout';
import { formatMoney } from '@/server/money';

export const GET = route({ auth: 'optional' }, async ({ params, viewer }) => {
  const order = await orderForViewer(params.reference, viewer);
  if (!order) throw notFound();
  // Guests see only the status; ticket codes go to their email.
  const owner = viewer && order.buyerId === viewer.id;
  return {
    reference: order.reference,
    status: order.status,
    total: formatMoney(order.totalMinor, order.currency),
    event: order.event,
    tickets: owner ? order.tickets : [],
  };
});
