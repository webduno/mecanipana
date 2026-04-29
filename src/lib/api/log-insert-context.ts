import type { SupabaseClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { createSupabaseServiceClient, getConfiguredSyncAuthUserId } from "@/lib/supabase-service";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type LogInsertContext =
  | {
      kind: "session";
      client: SupabaseClient;
      userId: string;
    }
  | {
      kind: "service";
      client: SupabaseClient;
      userId: string;
    }
  | { kind: "error"; response: NextResponse };

/**
 * Sesión JWT (cookies) para RLS; fallback opcional service role + SYNC_USER (dev).
 */
export async function getLogInsertContext(): Promise<LogInsertContext> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
  if (!url || !anon) {
    return {
      kind: "error",
      response: NextResponse.json(
        {
          ok: false,
          error: "missing_public_supabase_keys",
          detail:
            "NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY (.env.local).",
        },
        { status: 503 }
      ),
    };
  }

  try {
    const server = await createSupabaseServerClient();
    const {
      data: { user },
    } = await server.auth.getUser();

    if (user?.id) {
      return { kind: "session", client: server, userId: user.id };
    }

    const srv = createSupabaseServiceClient();
    const fallback = getConfiguredSyncAuthUserId();
    if (srv && fallback) {
      return { kind: "service", client: srv, userId: fallback };
    }

    return {
      kind: "error",
      response: NextResponse.json(
        {
          ok: false,
          error: "not_authenticated",
          detail:
            "Inicia sesión en /login o configura SUPABASE_SYNC_USER_ID + SUPABASE_SERVICE_ROLE_KEY (solo dev).",
        },
        { status: 401 }
      ),
    };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return {
      kind: "error",
      response: NextResponse.json(
        { ok: false, error: "supabase_init_failed", detail: msg },
        { status: 503 }
      ),
    };
  }
}
