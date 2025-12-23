"use server";

import { revalidatePath } from "next/cache";

import { logWorkoutSchema } from "@/lib/validation/workouts";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export async function logWorkoutAction(_: unknown, formData: FormData) {
  const parsed = logWorkoutSchema.safeParse({
    subscriptionId: formData.get("subscriptionId"),
    programDayId: formData.get("programDayId") || null,
    exerciseName: formData.get("exerciseName"),
    weight: formData.get("weight"),
    reps: formData.get("reps"),
    rpe: formData.get("rpe"),
    notes: formData.get("notes")
  });

  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? "Invalid form" };
  }

  const supabase = getSupabaseServerClient();
  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("id, member_id, status")
    .eq("id", parsed.data.subscriptionId)
    .single();

  if (!subscription) {
    return { error: "Subscription not found" };
  }

  const allowedStatuses = new Set(["active", "trialing", "free"]);
  if (!allowedStatuses.has(subscription.status)) {
    return { error: "Subscription inactive" };
  }

  const { data: workout, error: workoutError } = await supabase
    .from("workouts")
    .insert({
      subscription_id: parsed.data.subscriptionId,
      program_day_id: parsed.data.programDayId
    })
    .select("id")
    .single();

  if (workoutError) {
    return { error: workoutError.message };
  }

  const { error: setError } = await supabase.from("workout_sets").insert({
    workout_id: workout.id,
    exercise_name: parsed.data.exerciseName,
    weight: parsed.data.weight ?? null,
    reps: parsed.data.reps ?? null,
    rpe: parsed.data.rpe ?? null,
    notes: parsed.data.notes ?? null
  });

  if (setError) {
    return { error: setError.message };
  }

  revalidatePath("/app/program");
  return { error: "" };
}
