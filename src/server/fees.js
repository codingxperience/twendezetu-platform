// Platform pricing in one place. Free posts stay free; fees apply only when
// money moves.

export const FEES = Object.freeze({
  // Added to the buyer's ticket total at checkout.
  ticketServiceBps: 500,
  // Taken from the provider's side when escrow is released.
  bookingCommissionBps: 700,
  // Flat fee on cashing points out to a card or mobile money wallet.
  cashoutFeePoints: 50,
  // Flat fee on provider and organizer withdrawals, per payout currency.
  withdrawalFeeMinor: { UGX: 2_500, KES: 5_000, TZS: 250_000, RWF: 1_000, USD: 100 },
  // Provider listing membership, per year, in the provider's currency.
  membershipMinor: { UGX: 20_000, KES: 70_000, TZS: 1_300_000, RWF: 7_500, USD: 500 },
  // Renewing more than 30 days before expiry earns a discount.
  earlyRenewalBps: 1_500,
  earlyRenewalWindowDays: 30,
});

export const ESCROW = Object.freeze({
  // Ticket money is released to the organizer this long after the event ends.
  eventReleaseDelayHours: 48,
  // A booking auto-releases this long after the service date unless disputed.
  bookingReleaseDelayHours: 72,
  // The other party's window to respond to a dispute.
  disputeResponseHours: 72,
});

export const LIMITS = Object.freeze({
  maxTicketsPerOrder: 10,
  orderHoldMinutes: 15,
  splitShareMax: 10,
  splitLifetimeHours: 72,
  pointsTransferMax: 500_000,
  topUpUsdOptions: [5, 10, 25, 50],
  topUpUsdMax: 500,
});

export const REFERRAL_POINTS = Object.freeze({
  JOINED: 50,
  FIRST_TICKET: 200,
  FIRST_POST: 150,
  BECAME_PROVIDER: 500,
});

export const REFERRAL_TIERS = Object.freeze([
  { name: 'Rafiki', friends: 1, perk: 'Points on every milestone', multiplier: 1 },
  { name: 'Connector', friends: 10, perk: '2× points from here on', multiplier: 2 },
  { name: 'Champion', friends: 25, perk: '3× points from here on', multiplier: 3 },
]);
