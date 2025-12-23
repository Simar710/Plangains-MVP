import Link from "next/link";

import { WorkoutLogger } from "@/components/app/workout-logger";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getSession } from "@/lib/auth";
import { getSupabaseServerComponentClient } from "@/lib/supabase/server";

export default async function ProgramPage() {
  const supabase = getSupabaseServerComponentClient();
  const session = await getSession();

  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("id, creator_id, status, creators(display_name, slug)")
    .eq("member_id", session?.user.id ?? "")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!subscription) {
    return (
      <div className="space-y-4">
        <h1 className="text-3xl font-semibold">My program</h1>
        <Card>
          <CardHeader>
            <CardTitle>No program yet</CardTitle>
            <CardDescription>Subscribe to a creator to see their program.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/creator">Find a creator</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { data: program } = await supabase
    .from("programs")
    .select(
      "id, title, description, program_days(id, day_number, title, program_exercises(id, name, instructions, position))"
    )
    .eq("creator_id", subscription.creator_id)
    .eq("is_published", true)
    .order("day_number", { referencedTable: "program_days", ascending: true })
    .maybeSingle();

  const selectedDay = program?.program_days?.[0];
  const creator = (subscription && Array.isArray(subscription.creators)
    ? subscription.creators[0]
    : subscription?.creators) as { display_name?: string; slug?: string } | null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <p className="text-sm text-muted-foreground">Subscribed to</p>
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-semibold">{creator?.display_name}</h1>
          <Badge variant="secondary" className="capitalize">
            {subscription.status}
          </Badge>
        </div>
        <Link href={`/creator/${creator?.slug}`} className="text-sm">
          View public page
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{program?.title ?? "Program coming soon"}</CardTitle>
            <CardDescription>
              {program?.description ?? "Your creator hasn’t published a program yet."}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {program?.program_days?.map((day) => (
              <div key={day.id} className="rounded-lg border border-border/60 bg-background/60 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Day {day.day_number}</p>
                    <p className="text-base font-semibold">{day.title ?? `Day ${day.day_number}`}</p>
                  </div>
                  <Badge variant="secondary">{day.program_exercises?.length ?? 0} movements</Badge>
                </div>
                <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                  {day.program_exercises?.map((exercise) => (
                    <li key={exercise.id} className="flex items-start justify-between gap-4">
                      <span>{exercise.name}</span>
                      {exercise.instructions ? <span className="text-xs">{exercise.instructions}</span> : null}
                    </li>
                  ))}
                  {!day.program_exercises?.length ? <li>No exercises yet.</li> : null}
                </ul>
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Log a set</CardTitle>
              <CardDescription>Track progress as you move through the program.</CardDescription>
            </CardHeader>
            <CardContent>
              <WorkoutLogger subscriptionId={subscription.id} programDayId={selectedDay?.id} />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Recent guidance</CardTitle>
              <CardDescription>Keep logs lean. Exporting will come later.</CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Workouts store sets linked to your subscription. Data stays scoped to you and your
              creator.
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
