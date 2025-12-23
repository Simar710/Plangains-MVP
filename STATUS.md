# PlanGains MVP Status

## Implemented (✅)
- Next.js App Router app with TypeScript, Tailwind, shadcn/ui components
- Public landing page, creator hub, and marketing content
- Auth pages (sign-in/sign-up) with server actions
- Auth gating via middleware for /app/*, /creator/*, /admin/*
- Member dashboard + program view + workout logging (minimal)
- Creator onboarding, settings, pricing, and program builder (minimal)
- Stripe Connect onboarding link creation (Standard)
- Stripe Checkout subscription session creation
- Stripe webhook route with signature verification and subscription upsert
- Stripe debug logging switch via `DEBUG_STRIPE`
- Stripe local testing guide at `docs/STRIPE_TESTING.md`
- Supabase schema + RLS policies via migration in supabase/migrations/0001_init.sql
- Centralized Supabase helpers in src/lib
- .env.example present with required vars
- Auth redirect flow now sends unauthenticated users to `/auth/sign-in` (with `next` passthrough) for protected routes and sign-out lands on `/auth/sign-in`
- ESLint tuned for MVP: `_`-prefixed unused vars allowed; Supabase helpers permit `any` to keep strict elsewhere; unused imports cleaned

## Partially Done (🟡)
- Supabase client typings are intentionally loosened to avoid type errors (TODO: generate and wire real Supabase types)
- Admin area is a gated stub without functionality
- Program builder/logging are minimal; no editing or history views

## Missing (❌)
- None blocking MVP skeleton

## Breaking Issues / TODOs
- TODO: regenerate Supabase types so TS can type-check queries without `any`
- Stripe flows require real keys and webhook secret to validate end-to-end
- Re-run `pnpm dev` after pulling updates to confirm middleware behavior and auth redirects
- Stripe e2e tested locally: yes
- Validated: Stripe CLI forwarding, Checkout flow, webhook sync for active/trialing/canceled/paused/unpaid/free, DB status updates, access gating for inactive statuses
- Remaining: none for Stripe e2e testing

## Run Instructions
1) Install deps: `pnpm install`
2) Start dev server: `pnpm dev`
3) Lint: `pnpm lint`
4) Typecheck: `pnpm typecheck`

## Required Environment Variables (.env.local)
- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY
- SUPABASE_SERVICE_ROLE_KEY
- NEXT_PUBLIC_SITE_URL
- STRIPE_SECRET_KEY
- STRIPE_WEBHOOK_SECRET
- STRIPE_PLATFORM_FEE_PERCENT
- STRIPE_CONNECT_REFRESH_URL
- STRIPE_CONNECT_RETURN_URL
- DEBUG_STRIPE

## Supabase Migrations
- `supabase/migrations/0001_init.sql`
- Apply with: `supabase db push`
