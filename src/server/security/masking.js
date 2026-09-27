// Contact masking and scam signals for in-platform conversations.
//
// Until an offer is accepted neither side sees the other's phone number or
// email. People still type them into messages, so the server replaces them
// before a message is stored. The same pass looks for the classic
// "pay me directly" pattern, which the trust team wants to see early.

const EMAIL = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi;
// Nine or more digits, allowing spaces, dots, dashes and brackets between
// them, with an optional leading +. East African mobile numbers are ten
// digits locally (07…) and twelve internationally; US numbers are ten. Prices
// are written with commas or "K"/"M", which break the run.
const PHONE = /\+?\d(?:[\s().-]*\d){8,}/g;
const CHAT_LINK = /\b(?:https?:\/\/)?(?:wa\.me|api\.whatsapp\.com|chat\.whatsapp\.com|t\.me|telegram\.me|m\.me)\/\S*/gi;
const HANDLE_HINT = /\b(?:whatsapp|watsapp|telegram|signal|call|text|sms)\s*(?:me)?\s*(?:on|at)?\s*:?\s*@[A-Z0-9_.]{3,}/gi;

const OFF_PLATFORM = [
  /\b(?:pay|send|transfer)\b[^.!?\n]{0,40}\b(?:directly|outside|off[- ]?(?:the )?(?:platform|app|site))\b/i,
  /\b(?:send|pay|transfer)\b[^.!?\n]{0,30}\b(?:deposit|money|payment|cash)\b[^.!?\n]{0,30}\b(?:to my|my own|personal)\b/i,
  /\b(?:m-?pesa|momo|mobile money|airtel money|till|paybill)\b[^.!?\n]{0,30}\b(?:number|no\.?|#)\b/i,
  /\bavoid (?:the )?(?:fees?|commission)\b/i,
];

export const MASK_TOKEN = '[hidden until an offer is accepted]';

export function maskContacts(text) {
  let redacted = false;
  const replace = () => {
    redacted = true;
    return MASK_TOKEN;
  };
  const masked = String(text)
    .replace(CHAT_LINK, replace)
    .replace(EMAIL, replace)
    .replace(HANDLE_HINT, replace)
    .replace(PHONE, replace);
  return { text: masked, redacted };
}

export function offPlatformPaymentSignal(text) {
  return OFF_PLATFORM.some((pattern) => pattern.test(String(text)));
}
