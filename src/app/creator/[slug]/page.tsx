import { notFound } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { startSubscriptionAction } from "@/lib/actions/subscriptions";
import { getSupabaseServerComponentClient } from "@/lib/supabase/server";

export default async function CreatorPublicPage({ params }: { params: { slug: string } }) {
  const supabase = getSupabaseServerComponentClient();
  const { data: creator } = await supabase
    .from("creators")
    .select("id, display_name, bio, monthly_price_cents")
    .eq("slug", params.slug)
    .single();

  if (!creator) return notFound();

  const { data: program } = await supabase
    .from("programs")
    .select("title, description")
    .eq("creator_id", creator.id)
    .eq("is_published", true)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const priceLabel =
    creator.monthly_price_cents === 0
      ? "Free"
      : `$${(creator.monthly_price_cents / 100).toFixed(0)}/month`;

  return (
    <div className="container max-w-4xl space-y-6 py-10">
      <div className="flex flex-col gap-2">
        <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground">Creator</p>
        <h1 className="text-4xl font-semibold">{creator.display_name}</h1>
        <p className="text-muted-foreground">{creator.bio}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Subscribe</CardTitle>
          <CardDescription>Stripe Checkout for paid plans; free plans are instant.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-2xl font-semibold">{priceLabel}</p>
            <p className="text-sm text-muted-foreground">Cancel anytime</p>
          </div>
          <form action={startSubscriptionAction} className="w-full max-w-sm space-y-2 md:w-auto">
            <input type="hidden" name="creatorId" value={creator.id} />
            <Button type="submit" className="w-full">
              {creator.monthly_price_cents === 0 ? "Join for free" : "Subscribe"}
            </Button>
            <p className="text-xs text-muted-foreground">
              Stripe webhooks manage paid subscription status.
            </p>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Program preview</CardTitle>
          <CardDescription>
            Members get full access after subscribing. Creators keep programs simple and focused.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-lg font-semibold">{program?.title ?? "Program coming soon"}</p>
          <p className="text-muted-foreground">{program?.description ?? "Creator is still drafting."}</p>
        </CardContent>
      </Card>
    </div>
  );
}
