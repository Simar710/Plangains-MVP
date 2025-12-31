import Image from "next/image";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getSupabaseServerComponentClient } from "@/lib/supabase/server";

const sortOptions = [
  { value: "free", label: "Free first" },
  { value: "price", label: "Price low-high" },
  { value: "newest", label: "Newest" }
];

function formatPrice(priceCents: number) {
  if (priceCents === 0) return "Free";
  return `$${(priceCents / 100).toFixed(0)}/mo`;
}

export default async function CreatorsPage({
  searchParams
}: {
  searchParams?: { q?: string; sort?: string };
}) {
  const supabase = getSupabaseServerComponentClient();
  const query = (searchParams?.q ?? "").trim();
  const sort = searchParams?.sort ?? "free";

  let request = supabase
    .from("creators")
    .select(
      "id, display_name, slug, bio, monthly_price_cents, stripe_account_id, avatar_url, profile_complete, is_active, created_at"
    )
    .eq("is_active", true)
    .eq("profile_complete", true);

  if (query) {
    request = request.or(`display_name.ilike.%${query}%,slug.ilike.%${query}%`);
  }

  if (sort === "newest") {
    request = request.order("created_at", { ascending: false });
  } else {
    request = request.order("monthly_price_cents", { ascending: true });
    if (sort === "free") {
      request = request.order("created_at", { ascending: false });
    }
  }

  const { data: creators } = await request;

  return (
    <div className="container space-y-6 py-8">
      <div className="space-y-2">
        <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Creators</p>
        <h1 className="text-2xl font-semibold sm:text-3xl">Find a program that fits</h1>
        <p className="text-sm text-muted-foreground sm:text-base">
          Browse active creators. Paid plans require Stripe to be connected.
        </p>
      </div>

      <form className="grid gap-3 sm:grid-cols-[1fr_180px_auto] sm:items-end" action="/creators">
        <div className="space-y-2">
          <Label htmlFor="q">Search name or handle</Label>
          <Input id="q" name="q" placeholder="Search creators" defaultValue={query} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="sort">Sort</Label>
          <select
            id="sort"
            name="sort"
            defaultValue={sort}
            className="h-11 w-full rounded-md border border-border bg-background px-3 text-base sm:text-sm"
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <Button type="submit" className="w-full md:w-auto">
          Apply
        </Button>
      </form>

      <div className="space-y-3">
        {creators?.length ? (
          <div className="rounded-lg border border-border/60">
            {creators.map((creator) => {
              const showSetupIncomplete =
                creator.monthly_price_cents > 0 && !creator.stripe_account_id;
              const initials =
                creator.display_name
                  ?.split(" ")
                  .map((part: string) => part[0])
                  .slice(0, 2)
                  .join("") ?? "PG";

              return (
                <div
                  key={creator.id}
                  className="flex flex-col gap-3 border-b border-border/60 px-3 py-3 last:border-b-0 sm:flex-row sm:items-center"
                >
                  {creator.avatar_url ? (
                    <Image
                      src={creator.avatar_url}
                      alt={creator.display_name}
                      width={40}
                      height={40}
                      className="h-10 w-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                      {initials}
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">{creator.display_name}</p>
                        <p className="truncate text-xs text-muted-foreground">@{creator.slug}</p>
                      </div>
                      <Badge variant="secondary" className="shrink-0 text-xs">
                        {formatPrice(creator.monthly_price_cents)}
                      </Badge>
                    </div>
                    <p className="mt-1 truncate text-xs text-muted-foreground">
                      {creator.bio ?? "PlanGains creator"}
                    </p>
                    {showSetupIncomplete ? (
                      <Badge variant="outline" className="mt-2 text-xs">
                        Setup incomplete
                      </Badge>
                    ) : null}
                  </div>
                  <Button asChild variant="outline" size="sm" className="w-full sm:w-auto">
                    <Link href={`/creator/${creator.slug}`}>View</Link>
                  </Button>
                </div>
              );
            })}
          </div>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>No creators yet</CardTitle>
              <CardDescription>Try a different search or check back soon.</CardDescription>
            </CardHeader>
          </Card>
        )}
      </div>
    </div>
  );
}
