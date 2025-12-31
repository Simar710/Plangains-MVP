import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const features = [
  {
    title: "Monetize on day one",
    description: "Set a price (or free) and start collecting recurring revenue with Stripe Checkout.",
    cta: "Connect Stripe and launch"
  },
  {
    title: "Simple program builder",
    description: "Create programs with days and exercises. No complex CMS required.",
    cta: "Draft your program"
  },
  {
    title: "Workout logging",
    description: "Members log sets and track progress from a focused dashboard.",
    cta: "Guide members clearly"
  }
];

export default function Home() {
  return (
    <div className="bg-gradient-to-b from-background via-[#0b1020] to-background">
      <section className="container grid gap-6 py-10 md:grid-cols-2 md:items-center">
        <div className="space-y-6">
          <div className="inline-flex rounded-full border border-primary/40 bg-primary/10 px-3 py-1 text-xs uppercase tracking-[0.2em] text-primary">
            Creator-first fitness
          </div>
          <h1 className="text-2xl font-semibold leading-tight sm:text-4xl">
            Launch, monetize, and deliver training with PlanGains.
          </h1>
          <p className="text-sm text-muted-foreground sm:text-base">
            Set your own subscription price, onboard to Stripe Connect in minutes, and give members a
            clear place to follow programs and log workouts. Web-only, mobile-first, no distractions.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button asChild size="lg">
              <Link href="/auth/sign-up">Get started</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/creator">See how it works</Link>
            </Button>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground sm:text-sm">
            <span>Stripe Connect payouts</span>
            <span className="h-1 w-1 rounded-full bg-muted" />
            <span>Supabase auth + Postgres</span>
            <span className="h-1 w-1 rounded-full bg-muted" />
            <span>Transparent platform fees</span>
          </div>
        </div>
        <div className="relative">
          <div className="absolute -inset-6 bg-primary/20 blur-3xl" aria-hidden />
          <div className="relative rounded-2xl border border-border/80 bg-secondary/40 p-5 shadow-xl">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Monthly recurring revenue</p>
                <p className="text-3xl font-semibold">$12,840</p>
              </div>
              <div className="rounded-full bg-primary/20 px-3 py-1 text-sm text-primary">+18% MoM</div>
            </div>
            <div className="mt-6 space-y-3">
              {[
                { label: "Active members", value: "1,248" },
                { label: "Avg. workout completion", value: "82%" },
                { label: "Platform fee", value: "8% per payment" }
              ].map((metric) => (
                <div key={metric.label} className="flex items-center justify-between rounded-lg border border-border/60 bg-background/60 px-3 py-2">
                  <span className="text-sm text-muted-foreground">{metric.label}</span>
                  <span className="text-base font-semibold">{metric.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="container grid gap-4 py-8 md:grid-cols-3">
        {features.map((feature) => (
          <Card key={feature.title} className="h-full">
            <CardHeader>
              <CardTitle>{feature.title}</CardTitle>
              <CardDescription>{feature.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="ghost" className="px-0" asChild>
                <Link href="/auth/sign-up">{feature.cta}</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </section>
    </div>
  );
}
