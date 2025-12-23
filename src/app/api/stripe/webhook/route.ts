import { headers } from "next/headers";
import { NextResponse } from "next/server";
import Stripe from "stripe";

import { getSupabaseServiceRoleClient } from "@/lib/supabase/admin";
import { getStripeClient } from "@/lib/stripe";

const relevantEvents = new Set([
  "checkout.session.completed",
  "customer.subscription.created",
  "customer.subscription.updated",
  "customer.subscription.deleted"
]);

type SubscriptionStatus =
  | "trialing"
  | "active"
  | "incomplete"
  | "incomplete_expired"
  | "past_due"
  | "canceled"
  | "unpaid"
  | "paused";

async function upsertSubscription(params: {
  memberId: string;
  creatorId: string;
  subscriptionId: string;
  customerId: string;
  priceCents: number;
  status: SubscriptionStatus;
  periodEnd?: number | null;
  checkoutSessionId?: string | null;
}) {
  const supabase = getSupabaseServiceRoleClient();
  await supabase.from("subscriptions").upsert({
    member_id: params.memberId,
    creator_id: params.creatorId,
    stripe_subscription_id: params.subscriptionId,
    stripe_customer_id: params.customerId,
    status: params.status === "active" ? "active" : params.status,
    price_cents: params.priceCents,
    current_period_end: params.periodEnd
      ? new Date(params.periodEnd * 1000).toISOString()
      : null,
    stripe_checkout_session_id: params.checkoutSessionId ?? null
  });
}

export async function POST(req: Request) {
  const body = await req.text();
  const signature = headers().get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!signature || !webhookSecret) {
    return NextResponse.json({ error: "Webhook not configured" }, { status: 400 });
  }

  const stripe = getStripeClient();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (error) {
    return NextResponse.json({ error: `Webhook Error: ${String(error)}` }, { status: 400 });
  }

  if (!relevantEvents.has(event.type)) {
    return NextResponse.json({ received: true });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        if (!session.subscription || !session.metadata?.member_id || !session.metadata?.creator_id) {
          break;
        }
        const subscription = await stripe.subscriptions.retrieve(session.subscription as string, {
          expand: ["items.data.price"]
        });
        await upsertSubscription({
          memberId: session.metadata.member_id,
          creatorId: session.metadata.creator_id,
          subscriptionId: subscription.id,
          customerId: subscription.customer as string,
          priceCents: subscription.items.data[0]?.price?.unit_amount ?? 0,
          status: subscription.status,
          periodEnd: subscription.current_period_end,
          checkoutSessionId: session.id
        });
        break;
      }
      case "customer.subscription.created":
      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const memberId = subscription.metadata.member_id;
        const creatorId = subscription.metadata.creator_id;
        if (!memberId || !creatorId) break;
        await upsertSubscription({
          memberId,
          creatorId,
          subscriptionId: subscription.id,
          customerId: subscription.customer as string,
          priceCents: subscription.items.data[0]?.price?.unit_amount ?? 0,
          status: subscription.status,
          periodEnd: subscription.current_period_end
        });
        break;
      }
      default:
        break;
    }
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
