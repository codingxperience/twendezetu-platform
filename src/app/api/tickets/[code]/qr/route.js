import QRCode from 'qrcode';
import { route } from '@/server/http';
import { notFound } from '@/server/errors';
import { prisma } from '@/server/db';
import { qrPayload } from '@/server/services/tickets';

// The scannable QR for a ticket, as SVG. Only the ticket's owner (or the
// buyer of its order) can fetch it.
export const GET = route({ auth: 'required' }, async ({ viewer, params }) => {
  const ticket = await prisma.ticket.findUnique({ where: { code: params.code }, include: { order: { select: { buyerId: true } } } });
  if (!ticket || (ticket.ownerId !== viewer.id && ticket.order.buyerId !== viewer.id)) throw notFound();
  const svg = await QRCode.toString(qrPayload(ticket.code), { type: 'svg', errorCorrectionLevel: 'M', margin: 1, color: { dark: '#14201F', light: '#F7F1E6' } });
  return new Response(svg, { headers: { 'content-type': 'image/svg+xml', 'cache-control': 'private, max-age=3600' } });
});
