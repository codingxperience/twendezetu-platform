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
import { providerView } from './provider.js';
import { providersView } from './providers.js';
import { providerDashboardView } from './providerDashboard.js';
import { providerVerificationView } from './providerVerification.js';
import { providerWalletView } from './providerWallet.js';
import { settingsView } from './settings.js';
import { checkinView } from './checkin.js';
import { disputesView } from './disputes.js';
import { organizerAnalyticsView } from './organizerAnalytics.js';
import { organizerPayoutsView } from './organizerPayouts.js';
import { referralRewardsView } from './referralRewards.js';
import { splitPayView } from './splitPay.js';
import { adminView } from './admin.js';
import { financeView } from './finance.js';

export const VIEWS = {
  home: homeView,
  event: eventView,
  checkout: checkoutView,
  myTwende: myTwendeView,
  messages: messagesView,
  wallet: walletView,
  create: createView,
  provider: providerView,
  providers: providersView,
  providerDashboard: providerDashboardView,
  providerVerification: providerVerificationView,
  providerWallet: providerWalletView,
  settings: settingsView,
  checkin: checkinView,
  disputes: disputesView,
  organizerAnalytics: organizerAnalyticsView,
  organizerPayouts: organizerPayoutsView,
  referralRewards: referralRewardsView,
  splitPay: splitPayView,
  admin: adminView,
  finance: financeView,
};
