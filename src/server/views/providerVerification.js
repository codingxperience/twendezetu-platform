// The verification centre: the provider's application as it stands.

import { unauthorized } from '../errors.js';
import { verificationState } from '../services/verification.js';
import { PROVIDER_CATEGORIES } from '../../shared/format.js';
import { me } from './common.js';

export async function providerVerificationView(viewer) {
  if (!viewer) throw unauthorized();
  const [person, state] = await Promise.all([me(viewer), verificationState(viewer)]);
  return {
    me: person,
    ...state,
    savedAt: state.savedAt ? new Date(state.savedAt).toISOString() : null,
    categories: Object.values(PROVIDER_CATEGORIES).map((item) => ({ label: item.label })),
  };
}
