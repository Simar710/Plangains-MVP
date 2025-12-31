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

## Mobile-First UI Rules (Web MVP)
- Default layout targets mobile width first (320–430px). Desktop is responsive enhancement, not a separate design.
- Use single-column layouts by default; add multi-column only at `md:` or higher.
- Avoid tables for core flows (program view, logging). Use card/stack layouts.
- Navigation: mobile-first header or bottom nav patterns; keep tap targets ≥ 44px.
- Forms: stacked fields, large inputs, clear errors; no cramped inline layouts on mobile.
- Always test pages at 375x812 and 390x844 in devtools before considering a UI “done”.