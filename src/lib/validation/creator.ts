import { z } from "zod";

export const becomeCreatorSchema = z.object({
  displayName: z.string().min(2, "Display name required"),
  slug: z
    .string()
    .min(3, "Slug too short")
    .max(40)
    .regex(/^[a-z0-9-]+$/, "Use lowercase letters, numbers, and dashes"),
  bio: z.string().max(500).optional().nullable(),
  monthlyPrice: z.coerce.number().min(0)
});

export const programSchema = z.object({
  title: z.string().min(2),
  description: z.string().optional().nullable(),
  days: z.array(
    z.object({
      title: z.string().optional().nullable(),
      exercises: z.array(
        z.object({
          name: z.string().min(1),
          instructions: z.string().optional().nullable()
        })
      )
    })
  )
});
