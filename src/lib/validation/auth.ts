import { z } from "zod";

export const signUpSchema = z.object({
  email: z.string().email({ message: "Valid email required" }),
  password: z.string().min(6, "Use at least 6 characters"),
  fullName: z.string().min(2, "Name is required"),
  username: z.string().min(3, "Username is required").max(20)
});

export const signInSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, "Password is required")
});
