import Link from "next/link";

import { PricingForm } from "@/components/creator/pricing-form";
import { ProgramForm } from "@/components/creator/program-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { createStripeConnectLinkAction } from "@/lib/actions/creator";
import { getCreatorProfile } from "@/lib/auth";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export default async function CreatorSettingsPage() {
  const creator = await getCreatorProfile();
  const supabase = getSupabaseServerClient();

  const { data: program } = await supabase
    .from("programs")
    .select("title, is_published")
    .eq("creator_id", creator?.id ?? "")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!creator) {
    return (
      <div className="container max-w-3xl space-y-4 py-10">
        <Card>
          <CardHeader>
            <CardTitle>Become a creator</CardTitle>
            <CardDescription>Create your profile before configuring settings.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/creator/become">Start onboarding</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container space-y-6 py-10">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground">Creator settings</p>
          <h1 className="text-3xl font-semibold">{creator.display_name}</h1>
          <p className="text-sm text-muted-foreground">Public page: /creator/{creator.slug}</p>
        </div>
        <Badge variant="secondary">Stripe {creator.stripe_account_id ? "connected" : "not connected"}</Badge>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Stripe Connect</CardTitle>
            <CardDescription>Onboard to receive payouts and collect paid subscriptions.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <form action={createStripeConnectLinkAction}>
              <Button type="submit">{creator.stripe_account_id ? "Update Stripe details" : "Connect Stripe"}</Button>
            </form>
            <p className="text-sm text-muted-foreground">
              Standard Connect is used. Platform fee is applied via Checkout sessions.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pricing</CardTitle>
            <CardDescription>Set your monthly subscription price (USD).</CardDescription>
          </CardHeader>
          <CardContent>
            <PricingForm defaultPrice={creator.monthly_price_cents / 100} />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Program builder</CardTitle>
          <CardDescription>
            Keep it simple: add a title, description, and a few days with exercises.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {program ? (
            <div className="rounded-lg border border-border/60 bg-background/60 p-4 text-sm">
              <p className="font-medium">Current program</p>
              <p>{program.title}</p>
              <p className="text-muted-foreground">{program.is_published ? "Published" : "Draft"}</p>
            </div>
          ) : null}
          <ProgramForm />
        </CardContent>
      </Card>
    </div>
  );
}
