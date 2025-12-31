import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { requireAdmin } from "@/lib/auth";
import { toggleCreatorActiveAction } from "@/lib/actions/admin";
import { getSupabaseServerComponentClient } from "@/lib/supabase/server";

function formatPrice(priceCents: number) {
  if (priceCents === 0) return "Free";
  return `$${(priceCents / 100).toFixed(0)}/mo`;
}

export default async function AdminPage() {
  await requireAdmin();
  const supabase = getSupabaseServerComponentClient();

  const [{ count: creatorCount }, { count: memberCount }, { count: activeSubCount }] =
    await Promise.all([
      supabase.from("creators").select("*", { count: "exact", head: true }),
      supabase.from("profiles").select("*", { count: "exact", head: true }).eq("role", "member"),
      supabase
        .from("subscriptions")
        .select("*", { count: "exact", head: true })
        .in("status", ["active", "trialing", "free"])
    ]);

  const { data: creators } = await supabase
    .from("creators")
    .select("id, display_name, slug, monthly_price_cents, stripe_account_id, is_active, created_at")
    .order("created_at", { ascending: false });

  return (
    <div className="container space-y-8 py-10">
      <div className="space-y-2">
        <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Admin</p>
        <h1 className="text-3xl font-semibold">Operations console</h1>
        <p className="text-muted-foreground">Toggle visibility and monitor subscription health.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Total creators</CardTitle>
            <CardDescription>All creator profiles</CardDescription>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">{creatorCount ?? 0}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Total members</CardTitle>
            <CardDescription>Profiles with member role</CardDescription>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">{memberCount ?? 0}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Active subscriptions</CardTitle>
            <CardDescription>Active, trialing, free</CardDescription>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">{activeSubCount ?? 0}</CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Creators</CardTitle>
          <CardDescription>Stripe status, pricing, and active toggle.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {creators?.length ? (
            creators.map((creator) => {
              const stripeConnected = Boolean(creator.stripe_account_id);
              return (
                <div
                  key={creator.id}
                  className="flex flex-col gap-3 rounded-lg border border-border/60 p-4 md:flex-row md:items-center md:justify-between"
                >
                  <div className="space-y-1">
                    <p className="text-base font-semibold">{creator.display_name}</p>
                    <p className="text-sm text-muted-foreground">@{creator.slug}</p>
                    <div className="flex flex-wrap gap-2 text-xs">
                      <Badge variant="secondary">{formatPrice(creator.monthly_price_cents)}</Badge>
                      <Badge variant={stripeConnected ? "secondary" : "outline"}>
                        {stripeConnected ? "Stripe connected" : "Stripe not connected"}
                      </Badge>
                      <Badge variant={creator.is_active ? "secondary" : "outline"}>
                        {creator.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                  </div>
                  <form action={toggleCreatorActiveAction} className="flex w-full items-center gap-2 md:w-auto">
                    <input type="hidden" name="creatorId" value={creator.id} />
                    <input type="hidden" name="isActive" value={creator.is_active ? "true" : "false"} />
                    <Button type="submit" variant="outline" size="sm" className="w-full md:w-auto">
                      {creator.is_active ? "Deactivate" : "Activate"}
                    </Button>
                  </form>
                </div>
              );
            })
          ) : (
            <p className="text-sm text-muted-foreground">No creators yet.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
