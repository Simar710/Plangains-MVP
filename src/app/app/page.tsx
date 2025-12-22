import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getSession } from "@/lib/auth";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export default async function DashboardPage() {
  const supabase = getSupabaseServerClient();
  const session = await getSession();
  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, role")
    .eq("id", session?.user.id)
    .single();

  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("*, creators(display_name, slug)")
    .eq("member_id", session?.user.id ?? "")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <p className="text-sm text-muted-foreground">Welcome back</p>
        <h1 className="text-3xl font-semibold">
          {profile?.full_name ?? "PlanGains member"}
        </h1>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Badge variant="secondary">{profile?.role ?? "member"}</Badge>
          <Link href="/app/program">My program</Link>
          <Link href="/creator">Browse creators</Link>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Current subscription</CardTitle>
            <CardDescription>Subscriptions are managed by Stripe webhooks.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {subscription ? (
              <>
                <p className="text-sm text-muted-foreground">Creator</p>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-lg font-semibold">{subscription.creators?.display_name}</p>
                    <p className="text-sm text-muted-foreground capitalize">{subscription.status}</p>
                  </div>
                  <Button asChild variant="secondary">
                    <Link href={`/creator/${subscription.creators?.slug}`}>View creator</Link>
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Subscription status updates flow from Stripe webhooks; free plans are instant.
                </p>
              </>
            ) : (
              <div className="space-y-2">
                <p className="text-muted-foreground">No subscriptions yet.</p>
                <Button asChild>
                  <Link href="/creator">Find a creator</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick actions</CardTitle>
            <CardDescription>Jump into your workflow.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-3">
            <Button asChild variant="outline">
              <Link href="/app/program">My program</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/creator/become">Become a creator</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/creator/settings">Creator settings</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
