import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/types/supabase";

export function getSupabaseServiceRoleClient() {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is not set");
  }

  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  ) as unknown as SupabaseClient<Database>;
}
