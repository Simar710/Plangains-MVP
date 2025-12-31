"use server";

import { redirect } from "next/navigation";

import { siteUrl, platformFeePercent, getStripeClient } from "@/lib/stripe";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export async function startSubscriptionAction(formData: FormData) {
  const creatorId = formData.get("creatorId")?.toString();
  if (!creatorId) {
    redirect("/creator");
  }

  const supabase = getSupabaseServerClient();
  const {
    data: { session }
  } = await supabase.auth.getSession();

  if (!session) {
    redirect("/auth/sign-in");
  }

  const { data: creator } = await supabase
    .from("creators")
    .select("id, slug, display_name, monthly_price_cents, stripe_account_id")
    .eq("id", creatorId)
    .single();

  if (!creator) {
    redirect("/creator");
  }

  if (creator.monthly_price_cents === 0) {
    await supabase
      .from("subscriptions")
      .upsert(
        {
          member_id: session!.user.id,
          creator_id: creator.id,
          status: "free",
          price_cents: 0,
          stripe_subscription_id: null,
          stripe_checkout_session_id: null,
          stripe_customer_id: null
        },
        { onConflict: "member_id,creator_id" }
      );
    redirect(`/creator/${creator.slug}?subscribed=1`);
  }

  if (!process.env.STRIPE_SECRET_KEY) {
    redirect(`/creator/${creator.slug}?error=stripe_not_configured`);
  }

  const stripe = getStripeClient();
  const checkout = await stripe.checkout.sessions.create({
    mode: "subscription",
    payment_method_types: ["card"],
    customer_email: session!.user.email ?? undefined,
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: { name: `${creator.display_name} Membership` },
          recurring: { interval: "month" },
          unit_amount: creator.monthly_price_cents
        },
        quantity: 1
      }
    ],
    success_url: `${siteUrl()}/creator/${creator.slug}?checkout=success`,
    cancel_url: `${siteUrl()}/creator/${creator.slug}?checkout=cancelled`,
    subscription_data: {
      metadata: {
        member_id: session!.user.id,
        creator_id: creator.id
      },
      trial_period_days: 7,
      transfer_data: creator.stripe_account_id
        ? {
            destination: creator.stripe_account_id
          }
        : undefined,
      application_fee_percent: platformFeePercent()
    },
    metadata: {
      member_id: session!.user.id,
      creator_id: creator.id
    }
  });

  await supabase
    .from("subscriptions")
    .upsert(
      {
        member_id: session!.user.id,
        creator_id: creator.id,
        status: "incomplete",
        price_cents: creator.monthly_price_cents,
        stripe_checkout_session_id: checkout.id
      },
      { onConflict: "member_id,creator_id" }
    )
    .select()
    .single();

  redirect(checkout.url ?? `/creator/${creator.slug}`);
}

export async function cancelSubscriptionAction(formData: FormData) {
  const creatorId = formData.get("creatorId")?.toString();
  if (!creatorId) {
    redirect("/creator");
  }

  const supabase = getSupabaseServerClient();
  const {
    data: { session }
  } = await supabase.auth.getSession();

  if (!session) {
    redirect("/auth/sign-in");
  }

  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("id, status, stripe_subscription_id")
    .eq("member_id", session.user.id)
    .eq("creator_id", creatorId)
    .maybeSingle();

  const { data: creator } = await supabase
    .from("creators")
    .select("slug")
    .eq("id", creatorId)
    .maybeSingle();
  const creatorSlug = creator?.slug ?? undefined;

  if (!subscription) {
    redirect(creatorSlug ? `/creator/${creatorSlug}` : "/creators");
  }

  let periodEnd: string | null = null;
  if (subscription.stripe_subscription_id) {
    if (!process.env.STRIPE_SECRET_KEY) {
      redirect(creatorSlug ? `/creator/${creatorSlug}?error=stripe_not_configured` : "/creators");
    }
    const stripe = getStripeClient();
    const canceled = await stripe.subscriptions.cancel(subscription.stripe_subscription_id);
    if (typeof canceled.current_period_end === "number") {
      periodEnd = new Date(canceled.current_period_end * 1000).toISOString();
    }
  }

  await supabase
    .from("subscriptions")
    .update({
      status: "canceled",
      current_period_end: periodEnd
    })
    .eq("id", subscription.id);

  redirect(creatorSlug ? `/creator/${creatorSlug}?unsubscribed=1` : "/creators");
}
