import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const steps = [
  {
    title: "Create your profile",
    description: "Add your name, bio, and set a monthly price. $0 is allowed for free programs."
  },
  {
    title: "Connect Stripe",
    description: "Standard Connect onboarding so you own the relationship. Platform takes a fee."
  },
  {
    title: "Publish a program",
    description: "Outline days and exercises. Keep it simple for your members."
  }
];

export default function CreatorHub() {
  return (
    <div className="container space-y-6 py-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Creators</p>
          <h1 className="text-2xl font-semibold sm:text-3xl">Earn from your training programs</h1>
          <p className="max-w-2xl text-sm text-muted-foreground sm:text-base">
            PlanGains is built for solo trainers and gym owners who want recurring revenue without
            managing a complex app. Connect Stripe, set your price, and share your public page.
          </p>
        </div>
        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
          <Button asChild className="w-full sm:w-auto">
            <Link href="/auth/sign-up">Start free</Link>
          </Button>
          <Button asChild variant="outline" className="w-full sm:w-auto">
            <Link href="/creator/become">Become a creator</Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {steps.map((step) => (
          <Card key={step.title}>
            <CardHeader>
              <CardTitle>{step.title}</CardTitle>
              <CardDescription>{step.description}</CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Platform basics</CardTitle>
          <CardDescription>
            Payments use Stripe Checkout subscriptions. Free tiers create instant subscriptions without
            payment. Webhooks control paid subscription state.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <p className="text-sm font-semibold">What you get</p>
            <ul className="list-disc space-y-1 pl-4 text-sm text-muted-foreground">
              <li>Hosted public page with subscribe button</li>
              <li>Program builder with days and exercises</li>
              <li>Member dashboard for logging workouts</li>
              <li>Stripe Connect payouts with platform fee</li>
            </ul>
          </div>
          <div className="space-y-2">
            <p className="text-sm font-semibold">What we skip (on purpose)</p>
            <ul className="list-disc space-y-1 pl-4 text-sm text-muted-foreground">
              <li>No community feed or DMs</li>
              <li>No meal tracking</li>
              <li>No native apps yet (mobile-first web)</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
