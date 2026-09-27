// Organizer payouts: ticket money held per event, released after the event,
// and withdrawn to mobile money or a bank.

import { unauthorized } from '../errors.js';
import { organizerPayouts } from '../services/payouts.js';
import { me } from './common.js';

export async function organizerPayoutsView(viewer, { currency } = {}) {
  if (!viewer) throw unauthorized();
  const [person, payouts] = await Promise.all([me(viewer), organizerPayouts(viewer, { currency: typeof currency === 'string' ? currency.toUpperCase() : undefined })]);
  return { me: person, ...payouts };
}
