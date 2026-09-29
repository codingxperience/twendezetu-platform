# Twendezetu

An events marketplace for East Africa and the diaspora, with the vendors
who make events happen. People find events on the home page and at
/events, RSVP and buy tickets, post events of their own, and book vendors
at /vendors or post a need ("a photographer for a ruracio in Kiambu") and
take offers. They chip in to group pools, split a table's tickets by link,
and pay with cards or Twende points. Vendors and organizers get paid
through escrow, with disputes, payouts and a finance console behind it.

**Stack:** Next.js 15 (App Router, React 19) · Prisma 5 · Postgres
(Supabase) · Stripe · Resend or SMTP · Africa's Talking · Supabase Storage ·
optional Upstash Redis.

---

## Running it locally

Requires Node 20.12 or newer and a Postgres database (local, or a Supabase
project).

```bash
npm install
cp .env.example .env        # fill DATABASE_URL, DIRECT_URL and AUTH_SECRET
npm run db:deploy           # migrations, then row-level security lockdown
npm run db:seed             # demo data (refuses to run on a database with real accounts)
npm run dev
```

Everything else in `.env.example` is optional in development. Without
Stripe, card payments succeed instantly in test mode; without email and SMS
keys, messages and verification codes are written to the server log.

### Demo accounts

All use the password `karibu-twende-2026`.

| Email                | Who                                                              |
|----------------------|------------------------------------------------------------------|
| amina@example.com    | Member in Jersey City: tickets, a split, pools, needs, a dispute |
| kato@example.com     | Provider, Kato 4x4 & Tours (Kampala), verified, with bookings    |
| events@example.com   | Organizer of the catalogue events, with payouts                  |
| admin@example.com    | Administrator: moderation, cases, users, verification            |
| finance@example.com  | Finance: ledger, escrow, withdrawals, pool reviews               |
| trust@example.com    | Moderator                                                        |

---

## How it is built

```
src/app/            routes: pages (server components) and /api route handlers
src/server/views/   one loader per page: gathers exactly what the page shows
src/server/services domain logic: checkout, marketplace, disputes, payouts, …
src/server/         ledger, database, config, notifications, security, storage
src/design/         page templates (markup) and page logic (state and actions)
src/shared/         money, time zones and formatting, used on both sides
prisma/             schema, migrations, seed
tests/              unit tests and database tests
```

A page request runs a loader in `src/server/views`, which calls services and
returns plain data. The page's logic module in `src/design/pages` turns that
into what the template binds to, and sends every action to an API route.
API routes (`src/server/http.js`) share one pipeline: session, roles,
input validation with zod, rate limits, idempotency keys and error
mapping.

### Money

- **One ledger.** Every movement of value is a double-entry journal entry
  that balances in each currency. Postgres applies each line to its account,
  refuses overdrafts, checks balance at commit, and forbids editing or
  deleting journal rows. Balances cannot be written directly.
- **Escrow.** Ticket money waits in event escrow until 48 hours after the
  event; booking money waits until the customer confirms the job (or 72
  hours after it). An open dispute freezes either.
- **Points.** One point is one US cent. Paying in points rounds the points
  owed up, and turning money into points rounds down, so a conversion never
  hands out more than it takes in.
- **Refunds** accumulate on the order, so a partial refund followed by a
  cancellation never pays out twice.
- **Fees** live in `src/server/fees.js` and every page reads them from there.

### Privacy and safety

Contact details in conversations stay hidden until an offer is accepted,
and messages asking for payment off the platform are flagged for the trust
team. See [SECURITY.md](SECURITY.md) for how accounts, data and money are
protected.

---

## Scripts

| Command                    | What it does                                                   |
|----------------------------|----------------------------------------------------------------|
| `npm run dev`              | Development server on port 3000                                |
| `npm run build`            | Prisma client and production build (no database needed)        |
| `npm run db:deploy`        | Apply migrations, then re-apply the row-level security lockdown |
| `npm run db:seed`          | Replace the database with demo data                            |
| `npm test`                 | Unit tests, no database                                        |
| `npm run test:integration` | Database tests against `DATABASE_URL`, always rolled back      |
| `npm run lint`             | ESLint                                                         |

---

## Deploying

### Vercel

1. Import the repository and set the variables from `.env.example`. In
   production `DATA_ENCRYPTION_KEY` is required.
2. Point `DATABASE_URL` at the Supabase transaction pooler and `DIRECT_URL`
   at the session pooler.
3. Run `npm run db:deploy` against the production database before
   deploying a schema change.
4. Add the Stripe webhook `https://YOUR_DOMAIN/api/payments/stripe/webhook`.
5. Set `CRON_SECRET`. `vercel.json` runs every scheduled job once a day,
   which is the Hobby plan's limit. For timely escrow releases, reminders and
   notifications, have any scheduler call `/api/cron/tick` every few minutes
   with `Authorization: Bearer <CRON_SECRET>`; without `?all=1` it runs the
   frequent jobs every time and the hourly, daily and weekly ones when due.

### SiteGround (Node.js tool)

1. In Site Tools → Node.js, deploy from GitHub with the Next.js preset,
   branch `main`, Node 22, package manager npm, build command
   `npm run build:hosted` and output directory `.next`.
2. Add the variables from `.env.example` under Environment Variables before
   the first build. `NEXT_PUBLIC_APP_URL` is baked in at build time.
3. With `MIGRATE_ON_BUILD=true` each build applies pending migrations.
   `SEED_ON_BUILD=demo` (with `SEED_DEMO_PASSWORD`) loads the demo data on
   the next build; set it back to `off` straight after.
4. In Devs → Cron Jobs, call the scheduler every five minutes:
   `curl -fsS -H "Authorization: Bearer <CRON_SECRET>" https://YOUR_DOMAIN/api/cron/tick`

### Containers (Railway, Fly.io, Render, Cloud Run)

```bash
docker build -t twendezetu .
docker run -p 3000:3000 --env-file .env twendezetu
```

The image runs as a non-root user and reports health from `/api/health`,
which returns 503 when the database is unreachable or a table is missing
row-level security. Run `npm run db:deploy` as a release step.

GitHub Pages cannot host this app: it needs a server and a database.
