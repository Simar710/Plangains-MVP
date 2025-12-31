import { BecomeCreatorForm } from "@/components/creator/become-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getProfile } from "@/lib/auth";

export default async function BecomeCreatorPage() {
  const profile = await getProfile();
  const defaultSlug = profile?.username?.toLowerCase().replace(/[^a-z0-9-]/g, "-") ?? undefined;

  return (
    <div className="container max-w-3xl space-y-6 py-10">
      <div className="space-y-2">
        <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground">Creator onboarding</p>
        <h1 className="text-2xl font-semibold sm:text-3xl">Become a creator</h1>
        <p className="text-sm text-muted-foreground sm:text-base">
          Create your creator profile to start publishing programs and accepting subscriptions.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Your creator profile</CardTitle>
          <CardDescription>Set your public slug and starting price.</CardDescription>
        </CardHeader>
        <CardContent>
          <BecomeCreatorForm defaultSlug={defaultSlug} />
        </CardContent>
      </Card>
    </div>
  );
}
