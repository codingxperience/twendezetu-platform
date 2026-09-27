// The finance console: revenue and volume from the ledger, money held in
// escrow, withdrawals to approve and send, and pool releases to review.

import { forbidden, unauthorized } from '../errors.js';
import { financeOverview } from '../services/finance.js';
import { me } from './common.js';

const RANGES = ['7d', '30d', '90d'];
const FILTERS = ['ALL', 'TICKETS', 'BOOKINGS', 'MEMBERSHIPS', 'POINTS', 'PAYOUTS', 'REFUNDS'];

export async function financeView(viewer, { range, filter } = {}) {
  if (!viewer) throw unauthorized();
  if (!['ADMIN', 'FINANCE'].includes(viewer.role)) throw forbidden();
  const chosen = { range: RANGES.includes(range) ? range : '30d', filter: FILTERS.includes(filter) ? filter : 'ALL' };
  const [person, overview] = await Promise.all([me(viewer), financeOverview(chosen)]);
  return {
    me: person,
    staff: { name: viewer.name, role: viewer.role, twoFactor: viewer.twoFactorEnabled, isAdmin: viewer.role === 'ADMIN' },
    ...chosen,
    filters: FILTERS,
    ...overview,
    ledger: overview.ledger.map(({ createdAt, ...row }) => ({ ...row, at: createdAt.toISOString() })),
  };
}
