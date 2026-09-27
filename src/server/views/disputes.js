// Refunds and disputes: open a case on a purchase, follow it, and answer the
// cases opened against you.

import { unauthorized } from '../errors.js';
import { ESCROW } from '../fees.js';
import { REASONS, disputesForUser, eligiblePurchases } from '../services/disputes.js';
import { me } from './common.js';

export async function disputesView(viewer, { case: reference, order, booking } = {}) {
  if (!viewer) throw unauthorized();
  const [person, purchases, cases] = await Promise.all([me(viewer), eligiblePurchases(viewer.id), disputesForUser(viewer.id)]);

  // A link from a ticket or booking opens its case when there is one, and
  // otherwise starts a new one with that purchase picked.
  const active =
    cases.find((item) => item.reference === reference) ||
    (order && cases.find((item) => item.orderReference === order && item.status !== 'WITHDRAWN')) ||
    (booking && cases.find((item) => item.bookingId === booking && item.status !== 'WITHDRAWN')) ||
    null;
  const picked = purchases.find((item) => (order && item.kind === 'order' && item.reference === order) || (booking && item.kind === 'booking' && item.id === booking));

  return {
    me: person,
    purchases,
    cases,
    activeCase: active?.reference || null,
    picked: picked ? `${picked.kind}:${picked.id}` : null,
    reasons: Object.entries(REASONS).map(([key, [title, desc]]) => ({ key, title, desc })),
    responseHours: ESCROW.disputeResponseHours,
  };
}
