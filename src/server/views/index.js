// Page data loaders by name. Each takes (viewer, params) and returns the
// serialisable data its page renders. /api/views/[page] serves them so a page
// can refresh after an action without a full reload.

import { homeView } from './home.js';
import { eventView } from './event.js';
import { checkoutView } from './checkout.js';
import { myTwendeView } from './myTwende.js';
import { messagesView } from './messages.js';
import { walletView } from './wallet.js';
import { createView } from './create.js';

export const VIEWS = {
  home: homeView,
  event: eventView,
  checkout: checkoutView,
  myTwende: myTwendeView,
  messages: messagesView,
  wallet: walletView,
  create: createView,
};
