# PlanGains MVP Checklist

## Repo + Tooling
- ✅ Next.js App Router + TypeScript + Tailwind + shadcn/ui
- ✅ pnpm scripts (dev/build/lint/typecheck)
- ✅ README + AGENTS.md + .env.example

## Pages & Routing
- ✅ Landing page (/)
- ✅ Auth pages (/auth/sign-in, /auth/sign-up)
- ✅ Member dashboard gated (/app)
- ✅ Member program page gated (/app/program)
- ✅ Creator hub (/creator)
- ✅ Creator onboarding gated (/creator/become)
- ✅ Creator settings gated (/creator/settings)
- ✅ Public creator page (/creator/[slug])
- ✅ Admin page gated (/admin)

## Supabase
- ✅ Centralized helpers in src/lib
- ✅ Migrations for profiles, creators, subscriptions, programs, program_days, program_exercises, workouts, workout_sets
- ✅ RLS policies for member/creator access

## Auth
- ✅ Email/password sign-up + sign-in
- ✅ Server session checks + middleware routing guards

## Creator Onboarding
- ✅ Become a creator flow (creates creators row + role update)
- ✅ Set monthly price (including $0)
- ✅ Stripe Connect Standard onboarding link

## Subscriptions
- ✅ Free plan instant subscription record
- ✅ Paid plan Stripe Checkout session
- ✅ Stripe webhook updates subscription status (source of truth)

## Programs + Logging
- ✅ Minimal program builder (days + exercises)
- ✅ Member program view
- ✅ Workout logging (sets)

## Stripe
- ✅ Create Connect onboarding link
- ✅ Create Checkout subscription session
- ✅ Webhook route with signature verification

## Notes
- 🟡 Supabase typing currently loosened to `any` (generate types later)
