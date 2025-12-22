import { redirect } from "next/navigation";
import type { Session } from "@supabase/supabase-js";

import type { Creator, Profile } from "@/db/types";
import { getSupabaseServerComponentClient } from "@/lib/supabase/server";

export async function getSession(): Promise<Session | null> {
  const supabase = getSupabaseServerComponentClient();
  const {
    data: { session }
  } = await supabase.auth.getSession();
  return session;
}

export async function getProfile(): Promise<Profile | null> {
  const supabase = getSupabaseServerComponentClient();
  const session = await getSession();
  if (!session) return null;

  const { data } = await supabase
    .from("profiles")
    .select("id, full_name, username, role")
    .eq("id", session.user.id)
    .single();

  return data ?? null;
}

export async function getCreatorProfile(): Promise<Creator | null> {
  const supabase = getSupabaseServerComponentClient();
  const session = await getSession();
  if (!session) return null;

  const { data } = await supabase
    .from("creators")
    .select("*")
    .eq("user_id", session.user.id)
    .maybeSingle();

  return data ?? null;
}

export async function requireUser() {
  const session = await getSession();
  if (!session) {
    redirect("/auth/sign-in");
  }
  return session;
}

export async function requireCreator() {
  const [profile, creator] = await Promise.all([getProfile(), getCreatorProfile()]);
  if (!profile || profile.role === "member" || !creator) {
    redirect("/creator/become");
  }
  return { profile, creator };
}

export async function requireAdmin() {
  const profile = await getProfile();
  if (!profile || profile.role !== "admin") {
    redirect("/");
  }
  return profile;
}
