"use client";

import { useFormState } from "react-dom";

import { createProgramAction } from "@/lib/actions/creator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function ProgramForm() {
  const [state, formAction] = useFormState(createProgramAction, { error: "" });

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">Program title</Label>
        <Input id="title" name="title" required placeholder="4 Week Strength" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" name="description" placeholder="Who this is for and what to expect." />
      </div>
      <div className="grid gap-3 md:grid-cols-3">
        {[1, 2, 3].map((day) => (
          <div key={day} className="space-y-2 rounded-lg border border-border/60 bg-background/60 p-3">
            <Label htmlFor={`day-${day}`}>Day {day} title</Label>
            <Input id={`day-${day}`} name="day" placeholder={`Day ${day}`} />
            <Label htmlFor={`exercises-${day}`} className="text-xs text-muted-foreground">
              Exercises (one per line)
            </Label>
            <Textarea id={`exercises-${day}`} name="exercises" placeholder={`Squat\nBench Press\nRows`} />
          </div>
        ))}
      </div>
      {state?.error ? <p className="text-sm text-destructive">{state.error}</p> : null}
      <Button type="submit">Publish program draft</Button>
    </form>
  );
}
