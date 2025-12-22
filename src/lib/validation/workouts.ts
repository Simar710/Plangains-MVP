import { z } from "zod";

export const logWorkoutSchema = z.object({
  subscriptionId: z.string().uuid(),
  programDayId: z.string().uuid().optional().nullable(),
  exerciseName: z.string().min(1, "Exercise required"),
  weight: z.coerce.number().optional().nullable(),
  reps: z.coerce.number().int().optional().nullable(),
  rpe: z.coerce.number().optional().nullable(),
  notes: z.string().optional().nullable()
});
