# PlanGains MVP

Creator-first fitness platform built with Next.js (App Router), Supabase, Stripe, Tailwind, and shadcn/ui.

## Features
- Email/password auth via Supabase.
- Creator onboarding with slug, bio, pricing, and Stripe Connect Standard onboarding.
- Public creator pages with subscription CTA (free or paid via Stripe Checkout).
- Webhook-driven subscription source of truth.
- Program builder (title + day/exercise lists) and member program viewer.
- Workout logging (sets) tied to the member subscription.

## Getting started
1. Install pnpm if needed: `npm install -g pnpm`.
2. Install dependencies: `pnpm install`.
3. Copy envs: `cp .env.example .env.local` and fill values.
4. Run the dev server: `pnpm dev`.

### Required env vars (.env.local)
- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_SITE_URL` (e.g., `http://localhost:3000`)
- `STRIPE_PUBLISHABLE_KEY`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`
- `STRIPE_PLATFORM_FEE_PERCENT` (default 8)
- `STRIPE_CONNECT_RETURN_URL`, `STRIPE_CONNECT_REFRESH_URL`

### Supabase
- Apply migrations locally: `supabase db push` or run the SQL in `supabase/migrations/0001_init.sql` against your project.
- RLS is enabled; service role key is needed for webhooks and profile bootstrap.

### Stripe
- Use Stripe CLI to forward webhooks:
  - `stripe listen --forward-to localhost:3000/api/stripe/webhook`
- Paid subscriptions flow via Checkout sessions with Connect destination and application fee percent.

### Scripts
- `pnpm dev` — start dev server
- `pnpm build` — production build
- `pnpm lint` — lint with next lint
- `pnpm typecheck` — TypeScript type checks
- `pnpm format` — format with Prettier

## What’s next
- Flesh out program editing and history views.
- Add better error states around Stripe onboarding.
- Add activity history for logged workout sets.
- Harden RLS with more granular admin checks as needed.
