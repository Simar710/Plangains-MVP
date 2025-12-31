"use client";

import { useFormState } from "react-dom";

import { logWorkoutAction } from "@/lib/actions/workouts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function WorkoutLogger({ subscriptionId, programDayId }: { subscriptionId: string; programDayId?: string | null }) {
  const [state, formAction] = useFormState(logWorkoutAction, { error: "" });

  return (
    <form action={formAction} className="space-y-2 rounded-lg border border-border/60 bg-secondary/30 p-3">
      <input type="hidden" name="subscriptionId" value={subscriptionId} />
      <input type="hidden" name="programDayId" value={programDayId ?? ""} />
      <div className="space-y-1">
        <Label htmlFor="exerciseName">Exercise</Label>
        <Input id="exerciseName" name="exerciseName" placeholder="Bench Press" required />
      </div>
      <div className="grid gap-2 sm:grid-cols-3">
        <div className="space-y-1">
          <Label htmlFor="weight">Weight (optional)</Label>
          <Input id="weight" name="weight" type="number" step="0.5" placeholder="100" />
        </div>
        <div className="space-y-1">
          <Label htmlFor="reps">Reps</Label>
          <Input id="reps" name="reps" type="number" placeholder="8" />
        </div>
        <div className="space-y-1">
          <Label htmlFor="rpe">RPE</Label>
          <Input id="rpe" name="rpe" type="number" step="0.5" placeholder="7.5" />
        </div>
      </div>
      <div className="space-y-1">
        <Label htmlFor="notes">Notes</Label>
        <Textarea id="notes" name="notes" placeholder="Focus on drive and tempo" />
      </div>
      {state?.error ? <p className="text-sm text-destructive">{state.error}</p> : null}
      <Button type="submit" className="w-full">
        Log set
      </Button>
    </form>
  );
}
