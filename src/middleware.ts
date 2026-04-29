import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware-helper";
import { hasSupabaseSessionCookies } from "@/lib/supabase/session-cookies";

export async function middleware(request: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
  if (!url || !anon) {
    return NextResponse.next({ request });
  }

  if (!hasSupabaseSessionCookies(request)) {
    return NextResponse.next({ request });
  }

  return updateSession(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
