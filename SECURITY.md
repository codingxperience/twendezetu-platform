# Security

Twendezetu holds people's money, identity documents and phone numbers. This
is how each is protected, and how to tell us when something is wrong.

## Reporting a problem

Report it privately through **Security → Report a vulnerability** on this
repository's GitHub page, with what you found and how to reproduce it.
Please do not test against other people's accounts or money, and give the
maintainers a chance to fix it before telling anyone else.

## Accounts

- **Passwords** are hashed with scrypt (N = 2^15) and a random salt. At least
  ten characters; the most common breached passwords are refused. Sign-in
  runs the same work for unknown emails, so timing does not reveal who has
  an account.
- **Sessions** are 32 random bytes in an HttpOnly, SameSite=Lax cookie
  (`__Host-` prefixed and Secure in production). The database stores only
  their SHA-256, so a copy of it holds no usable session. Signing out,
  changing a password or being suspended ends sessions at once. Members can
  see and end their sessions under Settings → Security.
- **Password reset** links are single use, expire after 30 minutes and
  exist only in the email: the database keeps their SHA-256, and no copy
  goes to the notification inbox or outbox. The request form answers the
  same way, just as fast, for every address; the lookup and the email run
  after the reply. A new link cancels older ones, a second request within a
  minute sends nothing, and the reset page drops the token from the
  address bar and sends no referrer. Resetting signs out every device and
  tells the member; with two-step verification on, the next sign-in still
  asks for the texted code.
- **Two-step verification** sends a code by text message at sign-in. Money
  moves (sending points, cashing out, withdrawing earnings, covering a
  split) ask for a fresh code when it is on.
- **Staff** (administrators, moderators, finance) cannot use staff tools in
  production until two-step verification is on, and cannot turn it off.
  Only administrators grant staff roles, never to themselves, and every
  staff action is written to the audit log.

## Requests

Every API route goes through one pipeline (`src/server/http.js`):

- State-changing requests from another origin are refused (CSRF).
- Input is validated with zod before any work is done.
- Rate limits apply per person and per IP address (a generic cell-rate
  algorithm in Postgres, or Redis when configured), tighter on sign-in,
  codes, money and posting.
- Money routes take an `Idempotency-Key`, so a retried request is answered
  from the first result instead of charging twice.
- Errors reach the browser as plain messages; stack traces and SQL stay in
  the server log.

Pages send a content security policy (scripts, frames and connections from
this site only), HSTS in production, `X-Frame-Options: DENY`,
`nosniff` and a permissions policy that allows only the camera, for door
check-in.

## Money

- All value moves through a double-entry ledger. Postgres itself applies
  each line to its account, refuses overdrafts, checks that every entry
  balances in each currency, forbids editing or deleting journal rows and
  refuses direct changes to balances. Application bugs cannot quietly
  create or destroy money.
- Card details never touch Twendezetu: payments happen on Stripe's page,
  and the webhook is verified with Stripe's signature. Test-mode payments
  are refused in production unless an operator turns them on deliberately.
- Paid money waits in escrow until the event has passed or the job is
  confirmed; an open dispute freezes it. Refunds accumulate per order, so
  the same money cannot be refunded twice.
- Withdrawals are approved in batches by finance and recorded with the
  transfer reference. A failed transfer returns the full amount, fee
  included.

## Personal data

- National ID numbers and payout account numbers are encrypted with
  AES-256-GCM (`DATA_ENCRYPTION_KEY`). Pages show only the last digits.
- Once a verification is approved or rejected, the ID documents and number
  are deleted; only the decision is kept.
- Uploads are checked by their actual bytes, not their name, limited to
  4 MB, and JPEG photos lose their location and camera metadata. Every file
  is served through `/api/files`; ID documents, message attachments and
  dispute evidence only to the people allowed to see them.
- Phone numbers, emails and chat links typed into conversations are hidden
  until an offer is accepted. Messages asking to pay outside the platform
  are flagged for the trust team.
- Guests who order tickets or send requests without an account reach their
  order or conversation through links signed with a key derived from
  `AUTH_SECRET`; guessing a reference is not enough.
- Every table has Postgres row-level security with no policies, and
  Supabase's public API roles have no grants. `npm run db:deploy` re-applies
  this after each migration, and `/api/health` reports unhealthy if any
  table is missing it.

## Secrets

`AUTH_SECRET`, `DATA_ENCRYPTION_KEY`, the Stripe keys, `SUPABASE_SERVICE_ROLE_KEY`
and `CRON_SECRET` live only in the hosting provider's environment. `.env` is
gitignored. Rotating `AUTH_SECRET` signs everyone out and invalidates
outstanding guest links and ticket QR codes; `DATA_ENCRYPTION_KEY` must never
change once data is stored.
