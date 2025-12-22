"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { becomeCreatorSchema, programSchema } from "@/lib/validation/creator";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { getStripeClient, siteUrl } from "@/lib/stripe";

export async function becomeCreatorAction(_: unknown, formData: FormData) {
  const parsed = becomeCreatorSchema.safeParse({
    displayName: formData.get("displayName"),
    slug: formData.get("slug"),
    bio: formData.get("bio"),
    monthlyPrice: formData.get("monthlyPrice")
  });

  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? "Invalid form" };
  }

  const supabase = getSupabaseServerClient();
  const {
    data: { session }
  } = await supabase.auth.getSession();

  if (!session) {
    return { error: "Sign in required" };
  }

  const { error } = await supabase.from("creators").insert({
    user_id: session.user.id,
    display_name: parsed.data.displayName,
    slug: parsed.data.slug,
    bio: parsed.data.bio ?? null,
    monthly_price_cents: Math.round(parsed.data.monthlyPrice * 100)
  });

  if (error) {
    return { error: error.message };
  }

  await supabase.from("profiles").update({ role: "creator" }).eq("id", session.user.id);

  revalidatePath("/creator/settings");
  redirect("/creator/settings");
}

export async function updateCreatorPricingAction(_: unknown, formData: FormData) {
  const supabase = getSupabaseServerClient();
  const {
    data: { session }
  } = await supabase.auth.getSession();
  if (!session) return { error: "Auth required" };

  const price = Number(formData.get("monthlyPrice"));
  if (Number.isNaN(price) || price < 0) {
    return { error: "Price must be zero or higher" };
  }

  const { error } = await supabase
    .from("creators")
    .update({ monthly_price_cents: Math.round(price * 100) })
    .eq("user_id", session.user.id);

  if (error) return { error: error.message };

  revalidatePath("/creator/settings");
  return { error: "" };
}

export async function createProgramAction(_: unknown, formData: FormData) {
  const supabase = getSupabaseServerClient();
  const {
    data: { session }
  } = await supabase.auth.getSession();
  if (!session) return { error: "Auth required" };

  const daysPayload = formData.getAll("day") as string[];
  const exercisesPayload = formData.getAll("exercises") as string[];

  const parsed = programSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description"),
    days: daysPayload.map((title, index) => ({
      title,
      exercises: (exercisesPayload[index] || "")
        .split("\n")
        .filter(Boolean)
        .map((line) => ({ name: line.trim(), instructions: null }))
    }))
  });

  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? "Invalid form" };
  }

  const { data: creator } = await supabase
    .from("creators")
    .select("id")
    .eq("user_id", session.user.id)
    .single();

  if (!creator) return { error: "Creator profile missing" };

  const { data: program, error } = await supabase
    .from("programs")
    .insert({
      creator_id: creator.id,
      title: parsed.data.title,
      description: parsed.data.description ?? null,
      is_published: true
    })
    .select("id")
    .single();

  if (error) return { error: error.message };

  for (const [dayIndex, day] of parsed.data.days.entries()) {
    const { data: dayRow } = await supabase
      .from("program_days")
      .insert({ program_id: program.id, day_number: dayIndex + 1, title: day.title ?? null })
      .select("id")
      .single();

    for (const [position, exercise] of day.exercises.entries()) {
      await supabase.from("program_exercises").insert({
        program_day_id: dayRow?.id,
        name: exercise.name,
        instructions: exercise.instructions ?? null,
        position
      });
    }
  }

  revalidatePath("/creator/settings");
  return { error: "" };
}

export async function createStripeConnectLinkAction() {
  const supabase = getSupabaseServerClient();
  const {
    data: { session }
  } = await supabase.auth.getSession();
  if (!session) return { error: "Auth required" };

  const { data: creator } = await supabase
    .from("creators")
    .select("id, stripe_account_id")
    .eq("user_id", session.user.id)
    .single();

  if (!creator) return { error: "Create a creator profile first" };

  const stripe = getStripeClient();
  let accountId = creator.stripe_account_id;
  if (!accountId) {
    const account = await stripe.accounts.create({
      type: "standard",
      email: session.user.email ?? undefined
    });
    accountId = account.id;
    await supabase.from("creators").update({ stripe_account_id: accountId }).eq("id", creator.id);
  }

  const refreshUrl = process.env.STRIPE_CONNECT_REFRESH_URL || `${siteUrl()}/creator/settings`;
  const returnUrl = process.env.STRIPE_CONNECT_RETURN_URL || `${siteUrl()}/creator/settings`;
  const link = await stripe.accountLinks.create({
    account: accountId,
    refresh_url: refreshUrl,
    return_url: returnUrl,
    type: "account_onboarding"
  });

  redirect(link.url);
}
