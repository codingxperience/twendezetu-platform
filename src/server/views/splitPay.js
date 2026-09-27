// Split pay: one group, one link, everyone pays their own seat. Anyone with
// the link can see the split and pay a seat; only its starter can remind
// people or cover the rest.

import { notFound, unauthorized } from '../errors.js';
import { splitView, splitsForUser } from '../services/splits.js';
import { appUrl, me } from './common.js';

export async function splitPayView(viewer, { split: slug } = {}) {
  const person = await me(viewer);
  if (!slug) {
    if (!viewer) throw unauthorized();
    return { me: person, split: null, splits: await splitsForUser(viewer.id) };
  }
  const split = await splitView(String(slug), viewer);
  if (!split) throw notFound('That split link is not valid.');
  return { me: person, split, link: `${appUrl()}/split-pay?split=${split.slug}`, splits: [] };
}
