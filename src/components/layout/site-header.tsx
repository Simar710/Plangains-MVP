import Link from "next/link";

import { Button } from "@/components/ui/button";
import { getCreatorProfile, getSession } from "@/lib/auth";
import { signOutAction } from "@/lib/actions/auth";

export async function SiteHeader() {
  const [session, creator] = await Promise.all([getSession(), getCreatorProfile()]);
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="container flex flex-col gap-3 py-3 sm:flex-row sm:items-center sm:justify-between">
        <Link href="/" className="flex items-center gap-2 text-lg font-semibold">
          <span className="rounded-md bg-primary/20 px-2 py-1 text-primary">PlanGains</span>
          <span className="hidden text-sm text-muted-foreground sm:block">
            Build and monetize training programs
          </span>
        </Link>
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <Link href="/creators">Creators</Link>
          <Link href="/app">Dashboard</Link>
          {creator ? <Link href="/creator/settings">Creator Settings</Link> : null}
          {session ? (
            <form action={signOutAction}>
              <Button type="submit" size="sm" variant="secondary">
                Sign out
              </Button>
            </form>
          ) : (
            <Button asChild size="sm">
              <Link href="/auth/sign-in">Sign in</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
