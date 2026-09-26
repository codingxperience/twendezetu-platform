import { route } from '@/server/http';
import { schemas } from '@/server/schemas';
import { addPaymentMethod, paymentMethods } from '@/server/services/account';

export const GET = route({ auth: 'required' }, async ({ viewer }) => ({ methods: await paymentMethods(viewer.id) }));

export const POST = route({ auth: 'required', body: schemas.paymentMethod }, async ({ body, viewer }) => ({ method: await addPaymentMethod(viewer, body) }));
