# Stripe Local Testing (PlanGains MVP)

## Prereqs
- Stripe CLI installed and logged in
- Stripe test mode keys in `.env.local`

## 1) Install Stripe CLI
- macOS (Homebrew): `brew install stripe/stripe-cli/stripe`
- Verify: `stripe --version`

## 2) Login to Stripe CLI
- Run: `stripe login`
- Follow the browser prompt

## 3) Start webhook forwarding
- In a new terminal:
  - `stripe listen --forward-to http://localhost:3000/api/stripe/webhook --forward-connect-to http://localhost:3000/api/stripe/webhook`
- Copy the webhook signing secret printed by the CLI into `.env.local`:
  - `STRIPE_WEBHOOK_SECRET=whsec_...`
  - Do not use the Dashboard endpoint secret for CLI-forwarded events.
  - Ensure Stripe CLI is logged into the same Stripe account/sandbox as your API keys.

## 4) Enable debug logging (optional)
- Set `DEBUG_STRIPE=true` in `.env.local`
- Expected logs (server console):
  - `[stripe] event.received { type, id }`
  - `[stripe] checkout.session.completed { checkout_session_id, subscription_id, customer_id, member_id, creator_id }`
  - `[stripe] customer.subscription.sync { subscription_id, customer_id, status, member_id, creator_id }`

## 5) Create a paid creator subscription via the app
- Start dev server: `pnpm dev`
- Sign up and create a creator profile
- Set monthly price > 0
- Complete Connect onboarding (Standard) using test mode
- From a second account, visit `/creator/[slug]` and click Subscribe
- Use Stripe test card: `4242 4242 4242 4242`

## 6) Required webhook events
These events must arrive for status sync to be correct:
- `checkout.session.completed`
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `account.updated` (Stripe Connect onboarding status)

### Connect onboarding status (source of truth)
The app updates `creators.stripe_onboarding_complete` only from the webhook.
It is set to true when Stripe sends `account.updated` with:
- `details_submitted = true`
- `charges_enabled = true`
- `payouts_enabled = true`
- `requirements.currently_due` is empty

## 6a) Testing specific subscription statuses
Use the Stripe Dashboard (test mode) or the CLI to force status changes and verify DB updates.

### Trialing
Add a trial to Checkout for testing:
1) Open `src/lib/actions/subscriptions.ts`
2) Inside `stripe.checkout.sessions.create`, add:
   - `subscription_data: { trial_period_days: 7, ... }`
3) Run a new paid checkout and confirm status becomes `trialing`.
4) Revert the trial change after testing.

### Canceled
Cancel the subscription in Stripe Dashboard:
1) Stripe Dashboard → Customers → select customer → Subscriptions → Cancel
2) Confirm webhook updates DB status to `canceled`.
3) `/app/program` should show “Subscription inactive”.

### Past due / Unpaid
Simulate a failed payment for the subscription:
1) Stripe Dashboard → Subscriptions → select subscription
2) Use “Actions → Simulate failed payment”
3) Check DB status updates to `past_due` or `unpaid` (Stripe may use one or the other)
4) `/app/program` should show “Subscription inactive”.

### Paused
Pause collection:
1) Stripe Dashboard → Subscriptions → select subscription
2) Click “Pause payments” (Pause collection)
3) DB status should update to `paused`.
4) `/app/program` should show “Subscription inactive”.

### Free (no Stripe)
Use a creator with $0 monthly price:
1) Set creator monthly price to 0
2) Subscribe from a member account
3) DB status should be `free`
4) `/app/program` should allow access.

## 7) Verify DB updates
Use Supabase SQL editor or psql to confirm rows:

```sql
select
  member_id,
  creator_id,
  status,
  stripe_subscription_id,
  stripe_customer_id,
  stripe_checkout_session_id,
  current_period_end
from subscriptions
order by created_at desc
limit 5;
```

Expected:
- Paid subscriptions should progress to `active` or `trialing`
- Canceled/paused/unpaid should be reflected in `status`
- Stripe IDs should be stored in the row
- `stripe_checkout_session_id` is only set by the `checkout.session.completed` webhook
- `current_period_end` is only set when Stripe sends `current_period_end` in subscription events

If you toggle status in the Stripe Dashboard, the webhook does not include a checkout session ID,
so `stripe_checkout_session_id` will remain the original value (or null if the first event never set it).
This is expected.

## 8) Verify access gating uses DB state
- `/app/program` reads subscription status from DB
- Access is allowed only for statuses: `active`, `trialing`, `free`
- Any other status shows “Subscription inactive” without redirecting

## Troubleshooting
- If status doesn’t update, confirm webhook secret matches `stripe listen` output
- If `customer.subscription.*` events are missing, ensure CLI is running
- Clear `sb-*` cookies if auth/session errors appear during local testing
