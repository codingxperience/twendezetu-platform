# Twendezetu — Platform

A full-stack East African event marketplace. Real database, real auth, real booking flow, payment-ready.

**Tech:** Next.js 15 (App Router) · Prisma · Supabase Postgres · JWT cookies · Stripe · Zustand + SWR

---

## What's inside

- **Marketing homepage** — featured vendors, eight cities across four countries, curated package editorial
- **Browse** — category, city, search, and sort filters backed by real database queries
- **Vendor detail pages** — gallery, packages, dynamic pricing, share, save-to-favorites
- **4-step booking flow** — event details, contact, review, deposit payment (Stripe-ready)
- **Customer dashboard** — upcoming/past events, booking detail with two-way messaging, cancellation
- **Vendor dashboard** — inquiries, bookings, revenue tile, public-listing link
- **Saved vendors, inbox, account preferences**
- **REST API** — `/api/auth/*`, `/api/vendors`, `/api/bookings`, `/api/bookings/:id/messages`, `/api/favorites`, `/api/inquiries`, `/api/payments/intent`

---

## Quick start

```bash
git clone https://github.com/codingxperience/twendezetu-platform.git
cd twendezetu-platform
npm install
cp .env.example .env

# Fill DATABASE_URL and DIRECT_URL from Supabase Connect > ORM > Prisma.
# Apply migrations when setting up or changing the schema:
npm run db:deploy
npm run db:seed
npm run dev
```

Visit http://localhost:3000.

### Demo accounts (all use password `demo1234`)

| Email              | Role     | City    |
|--------------------|----------|---------|
| wanjiku@demo.tz    | customer | Nairobi |
| david@demo.tz      | customer | Kampala |
| aisha@demo.tz      | vendor   | Kampala (Mwalimu Studios) |
| mama@demo.tz       | vendor   | Nairobi (Sarova Garden)   |

---

## Deploying

### Vercel (recommended)

1. Push to GitHub.
2. Import the repo at [vercel.com/new](https://vercel.com/new).
3. Add environment variables from `.env.example` (at minimum `AUTH_SECRET`, `DATABASE_URL`, and `DIRECT_URL`).
4. Use Supabase's Prisma connection strings: transaction pooler for `DATABASE_URL`, session pooler for `DIRECT_URL`.
5. Run `npm run db:deploy` before deploying schema changes, then deploy. The normal build does not need a live database connection.

### GitHub Pages

GitHub Pages is not a supported deployment target for this app. Twendezetu uses
Next.js API routes, Prisma, database-backed auth, and server-rendered pages;
GitHub Pages only serves static files. A GitHub Pages URL for this repository
will return 404 unless you replace the app with a static export, which would
remove the booking, auth, dashboard, and API functionality.

### Railway / Fly.io / Render

The included `Dockerfile` is multi-stage and production-ready.

```bash
docker build -t twendezetu .
docker run -p 3000:3000 -e AUTH_SECRET=... twendezetu
```

Set `AUTH_SECRET`, `DATABASE_URL`, and `DIRECT_URL` when running the container. `DATABASE_URL` should point at the Supabase transaction pooler; `DIRECT_URL` should point at the Supabase session pooler for migrations. Run `npm run db:deploy` as an explicit release step before deploying schema changes.

---

## Stripe payments

Without `STRIPE_SECRET_KEY` the booking flow uses **mock mode**: deposits are recorded but no money moves. To enable live payments:

1. Create a Stripe account at [stripe.com](https://stripe.com).
2. Set `STRIPE_SECRET_KEY`, `STRIPE_PUBLISHABLE_KEY`, `STRIPE_WEBHOOK_SECRET` in your `.env` or hosting provider.
3. Test in dev with card `4242 4242 4242 4242` · expiry `12/34` · CVC `123`.
4. Configure a webhook at `https://yourdomain/api/payments/intent` for real-time confirmations (the route is scaffolded for handler expansion).

---

## What's not in this release (deliberately scoped out)

- **Email/SMS sending** — scaffolded in env vars; logs to stdout without provider keys. Add Resend (`RESEND_API_KEY`) and Africa's Talking for production.
- **File uploads** — vendor images are URL strings. For uploads, plug in Cloudflare R2 / Vercel Blob and add an `/api/uploads` route.
- **Admin / vendor approval** — schema supports `role: admin` but the moderation UI is not built.
- **Real-time messaging** — current implementation polls via SWR. Swap in Pusher Channels or a WebSocket route for live chat.
- **Rate limiting** — recommend Upstash Redis + a middleware before opening to the public.
- **Multi-region currency feed** — currency rates are hardcoded estimates in `src/lib/currency.js`; refresh from a feed on a cron.

---

## Repo layout

```
src/
├── app/
│   ├── api/              REST API (auth, vendors, bookings, favorites, …)
│   ├── browse/           marketplace browse page
│   ├── vendors/[id]/     vendor detail
│   ├── book/[id]/        4-step booking flow
│   ├── confirm/[id]/     booking confirmation
│   ├── dashboard/        customer dashboard + bookings/[id]
│   ├── vendor-dashboard/ vendor dashboard
│   ├── sign-in/, sign-up/, favorites/, inbox/, account/, about/
│   └── layout.jsx, page.jsx, globals.css, tokens.css
├── components/           Header, Footer, VendorCard, Photo, Icon, …
├── lib/                  prisma.js, auth.js, api.js, api-client.js, swr.js, currency.js, data.js
└── store/                zustand UI store (locale + booking draft)

prisma/
├── schema.prisma         User, Vendor, Package, Booking, Message, Favorite, Inquiry, Review
├── seed.mjs              Kenya/Uganda-balanced catalogue + demo users
└── migrations/
```
