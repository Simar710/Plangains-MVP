# PlanGains Agent Guide

Scope: Applies to entire repo.

## Architecture & Rules
- Single Next.js (App Router) app with TypeScript, Tailwind, and shadcn/ui.
- Centralize Supabase interactions in `src/lib` or `src/db`; avoid scattered client calls.
- Stripe webhook is the source of truth for paid subscription status; keep logic focused there.
- No scope creep: no meals, community feed, messaging, or mobile apps.
- Prefer boring patterns: server actions + simple components; minimal client state.
- Keep routing guards via middleware and server checks.
- Naming: kebab-case for migrations, camelCase for code, PascalCase for components.
- Testing: document commands in final message; prioritize lint/build if time allows.
- If uncertain, leave a TODO comment and proceed safely.

## Commit & PR
- Keep commits scoped and descriptive.
- Update README and .env.example when adding env vars.
- After committing, generate a PR message via the automation tool.

## Milestone Checklist
1. Repo + tooling setup
2. Supabase schema + helpers
3. Auth pages
4. Creator onboarding + settings
5. Stripe integration (Connect + Checkout + webhook)
6. Programs + workout logging basics
7. Polish, docs, and sanity checks
