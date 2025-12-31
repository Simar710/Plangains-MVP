# Supabase Type Generation

The app uses generated Supabase Database types at `src/types/supabase.ts`. Re-generate whenever the schema changes.

## Option A: Supabase CLI (local)
Prereqs:
- Supabase CLI installed
- Local Supabase running or linked
- Docker Desktop running for local Supabase

Run:
```bash
pnpm gen:types
```

This runs:
```bash
supabase gen types typescript --local > src/types/supabase.ts
```

## Option B: Supabase CLI with Project Ref (remote)
Prereqs:
- Supabase CLI installed
- Project ref and access token

```bash
SUPABASE_ACCESS_TOKEN=... supabase gen types typescript --project-id YOUR_PROJECT_REF > src/types/supabase.ts
```

## Notes
- Always overwrite `src/types/supabase.ts` when schema changes.
- Keep the Stripe webhook and server actions using the typed clients so queries stay type-safe.
