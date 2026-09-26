import { route, withStatus } from '@/server/http';
import { invalid, notFound } from '@/server/errors';
import { prisma } from '@/server/db';
import { schemas } from '@/server/schemas';
import { acceptOffer, counterOffer, declineOffer, reviseOffer, withdrawOffer } from '@/server/services/marketplace';
import { parseMoneyInput } from '@/server/money';

export const POST = route({ auth: 'required', body: schemas.offerAction, idempotent: true }, async ({ body, viewer, params }) => {
  switch (body.action) {
    case 'accept':
      return withStatus(200, await acceptOffer(viewer, params.id));
    case 'counter':
      return withStatus(200, await counterOffer(viewer, params.id, body.note));
    case 'decline':
      return withStatus(200, await declineOffer(viewer, params.id));
    case 'withdraw':
      return withStatus(200, await withdrawOffer(viewer, params.id));
    case 'revise': {
      const offer = await prisma.offer.findUnique({ where: { id: params.id }, select: { currency: true } });
      if (!offer) throw notFound();
      const priceMinor = parseMoneyInput(body.price, offer.currency);
      if (priceMinor == null) throw invalid('Enter your new price.');
      return withStatus(200, await reviseOffer(viewer, params.id, { priceMinor, note: body.note }));
    }
    default:
      throw invalid('Unknown action.');
  }
});
