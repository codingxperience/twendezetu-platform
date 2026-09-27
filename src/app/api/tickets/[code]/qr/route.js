import QRCode from 'qrcode';
import { route } from '@/server/http';
import { notFound } from '@/server/errors';
import { prisma } from '@/server/db';
import { qrPayload } from '@/server/services/tickets';
import { canOpenOrder } from '@/server/services/checkout';

// The scannable QR for a ticket, as SVG. Only the ticket's owner, the buyer
// of its order, or a guest holding the order's key can fetch it.
export const GET = route({ auth: 'optional' }, async ({ viewer, params, url }) => {
  const key = url.searchParams.get('key') || undefined;
  const ticket = await prisma.ticket.findUnique({ where: { code: params.code }, include: { order: { select: { id: true, buyerId: true } } } });
  const allowed = ticket && ((viewer && ticket.ownerId === viewer.id) || canOpenOrder(ticket.order, viewer, key));
  if (!allowed) throw notFound();
  const svg = await QRCode.toString(qrPayload(ticket.code), { type: 'svg', errorCorrectionLevel: 'M', margin: 1, color: { dark: '#14201F', light: '#F7F1E6' } });
  return new Response(svg, { headers: { 'content-type': 'image/svg+xml', 'cache-control': 'private, max-age=3600' } });
});
