// Errors that are safe to show to the person making the request. Anything
// else that escapes a handler is logged and answered with a generic 500.

export class AppError extends Error {
  constructor(status, code, message, details) {
    super(message);
    this.name = 'AppError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export const badRequest = (message, details) => new AppError(400, 'bad_request', message, details);
export const invalid = (message, details) => new AppError(422, 'invalid', message, details);
export const unauthorized = (message = 'Please sign in to continue.') => new AppError(401, 'unauthorized', message);
export const forbidden = (message = 'You do not have access to that.') => new AppError(403, 'forbidden', message);
export const notFound = (message = 'We could not find that.') => new AppError(404, 'not_found', message);
export const conflict = (message, code = 'conflict') => new AppError(409, code, message);
export const gone = (message) => new AppError(410, 'gone', message);
export const tooMany = (retryAfterSeconds) =>
  new AppError(429, 'rate_limited', 'Too many attempts. Please wait a moment and try again.', { retryAfterSeconds });
export const unavailable = (message) => new AppError(503, 'unavailable', message);

export const insufficientFunds = (message = 'Not enough balance for that.') =>
  new AppError(409, 'insufficient_funds', message);

export function assert(condition, error) {
  if (!condition) throw error;
}

// Maps database errors raised by constraints and ledger triggers to AppErrors.
// Returns null for anything it does not recognise.
export function fromDatabaseError(error) {
  const text = `${error?.message || ''} ${error?.meta?.message || ''}`;
  if (text.includes('insufficient_funds')) return insufficientFunds();
  if (text.includes('TicketTier_inventory')) return conflict('Those tickets just sold out.', 'sold_out');
  if (text.includes('PromoCode_redemptions')) return conflict('That promo code has been fully used.', 'promo_exhausted');
  if (text.includes('Offer_one_live_per_provider')) return conflict('You already have a live offer on this need.', 'offer_exists');
  if (text.includes('Dispute_one_live_per')) return conflict('There is already an open case for this purchase.', 'dispute_exists');
  if (error?.code === 'P2002') return conflict('That already exists.', 'duplicate');
  if (error?.code === 'P2025') return notFound();
  return null;
}
