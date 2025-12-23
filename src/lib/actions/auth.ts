"use server";

import { redirect } from "next/navigation";

import { signInSchema, signUpSchema } from "@/lib/validation/auth";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { getSupabaseServiceRoleClient } from "@/lib/supabase/admin";

export async function signInAction(_: unknown, formData: FormData) {
  const parsed = signInSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password")
  });

  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? "Invalid form" };
  }

  const supabase = getSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error) {
    return { error: error.message };
  }

  redirect("/app");
}

export async function signUpAction(_: unknown, formData: FormData) {
  const parsed = signUpSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    fullName: formData.get("fullName"),
    username: formData.get("username")
  });

  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? "Invalid form" };
  }

  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: { full_name: parsed.data.fullName, username: parsed.data.username }
    }
  });

  if (error) {
    return { error: error.message };
  }

  if (data.user && process.env.SUPABASE_SERVICE_ROLE_KEY) {
    const service = getSupabaseServiceRoleClient();
    await service
      .from("profiles")
      .upsert({
        id: data.user.id,
        full_name: parsed.data.fullName,
        username: parsed.data.username,
        role: "member"
      })
      .select()
      .single();
  }

  redirect("/app");
}

export async function signOutAction() {
  const supabase = getSupabaseServerClient();
  await supabase.auth.signOut();
  redirect("/auth/sign-in");
}
