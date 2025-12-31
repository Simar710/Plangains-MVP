"use server";

import { revalidatePath } from "next/cache";

import { getSupabaseServerClient } from "@/lib/supabase/server";

export async function toggleCreatorActiveAction(formData: FormData) {
  const creatorId = formData.get("creatorId")?.toString();
  const isActive = formData.get("isActive") === "true";
  if (!creatorId) {
    return;
  }

  const supabase = getSupabaseServerClient();
  const {
    data: { session }
  } = await supabase.auth.getSession();

  if (!session) {
    return;
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", session.user.id)
    .single();

  if (profile?.role !== "admin") {
    return;
  }

  const { error } = await supabase
    .from("creators")
    .update({ is_active: !isActive })
    .eq("id", creatorId);

  if (error) {
    return;
  }

  revalidatePath("/admin");
}
