import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

import type { Database } from "@/db/types";

const protectedPaths = ["/app", "/creator/become", "/creator/settings", "/creator/programs"];
const creatorPaths = ["/creator/settings", "/creator/programs"];

export async function middleware(request: NextRequest) {
  const response = NextResponse.next({ request });
  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set({ name, value, ...options });
          });
        }
      }
    }
  );

  const {
    data: { session }
  } = await supabase.auth.getSession();

  const path = request.nextUrl.pathname;
  const needsAuth = protectedPaths.some((p) => path === p || path.startsWith(`${p}/`));
  if (needsAuth && !session) {
    return NextResponse.redirect(new URL("/auth/sign-in", request.url));
  }

  if (session) {
    if (path.startsWith("/admin")) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", session.user.id)
        .single();
      if (profile?.role !== "admin") {
        return NextResponse.redirect(new URL("/", request.url));
      }
    }

    const needsCreator = creatorPaths.some((p) => path === p || path.startsWith(`${p}/`));
    if (needsCreator) {
      const { data: creator } = await supabase
        .from("creators")
        .select("id")
        .eq("user_id", session.user.id)
        .maybeSingle();
      if (!creator) {
        return NextResponse.redirect(new URL("/creator/become", request.url));
      }
    }
  }

  return response;
}

export const config = {
  matcher: ["/app/:path*", "/creator/:path*", "/admin/:path*"]
};
