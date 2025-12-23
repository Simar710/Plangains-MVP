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

function stripeDebugEnabled() {
  return process.env.DEBUG_STRIPE === "true";
}

function logStripeEvent(message: string, payload?: Record<string, unknown>) {
  if (!stripeDebugEnabled()) return;
  if (payload) {
    console.log(`[stripe] ${message}`, payload);
  } else {
    console.log(`[stripe] ${message}`);
  }
}

type SubscriptionStatus =
  | "trialing"
  | "active"
  | "incomplete"
  | "incomplete_expired"
  | "past_due"
  | "canceled"
  | "unpaid"
  | "paused";

function normalizeSubscriptionStatus(subscription: Stripe.Subscription): SubscriptionStatus {
  if (subscription.pause_collection) {
    return "paused";
  }
  return subscription.status as SubscriptionStatus;
}

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
  const payload: {
    member_id: string;
    creator_id: string;
    stripe_subscription_id: string;
    stripe_customer_id: string;
    status: SubscriptionStatus;
    price_cents: number;
    current_period_end?: string | null;
    stripe_checkout_session_id?: string | null;
  } = {
    member_id: params.memberId,
    creator_id: params.creatorId,
    stripe_subscription_id: params.subscriptionId,
    stripe_customer_id: params.customerId,
    status: params.status === "active" ? "active" : params.status,
    price_cents: params.priceCents
  };

  if (typeof params.periodEnd === "number") {
    payload.current_period_end = new Date(params.periodEnd * 1000).toISOString();
  }

  if (typeof params.checkoutSessionId === "string") {
    payload.stripe_checkout_session_id = params.checkoutSessionId;
  }

  const { error } = await supabase.from("subscriptions").upsert(payload, {
    onConflict: "member_id,creator_id"
  });

  if (error) {
    logStripeEvent("subscription.upsert_failed", {
      member_id: params.memberId,
      creator_id: params.creatorId,
      status: params.status,
      message: error.message
    });
    throw new Error(error.message);
  }
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

  logStripeEvent("event.received", { type: event.type, id: event.id });

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
        logStripeEvent("checkout.session.completed", {
          checkout_session_id: session.id,
          subscription_id: session.subscription,
          customer_id: session.customer,
          member_id: session.metadata.member_id,
          creator_id: session.metadata.creator_id
        });
        const subscription = await stripe.subscriptions.retrieve(session.subscription as string, {
          expand: ["items.data.price"]
        });
        await upsertSubscription({
          memberId: session.metadata.member_id,
          creatorId: session.metadata.creator_id,
          subscriptionId: subscription.id,
          customerId: subscription.customer as string,
          priceCents: subscription.items.data[0]?.price?.unit_amount ?? 0,
          status: normalizeSubscriptionStatus(subscription),
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
        logStripeEvent("customer.subscription.sync", {
          subscription_id: subscription.id,
          customer_id: subscription.customer,
          status: normalizeSubscriptionStatus(subscription),
          member_id: memberId,
          creator_id: creatorId
        });
        await upsertSubscription({
          memberId,
          creatorId,
          subscriptionId: subscription.id,
          customerId: subscription.customer as string,
          priceCents: subscription.items.data[0]?.price?.unit_amount ?? 0,
          status: normalizeSubscriptionStatus(subscription),
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
