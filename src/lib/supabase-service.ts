import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/** Validación UUID generada en cliente (`crypto.randomUUID`), compatible con Postgres. */
export const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isLikelyUuidString(s: unknown): s is string {
  return typeof s === "string" && UUID_REGEX.test(s.trim());
}

/** Solo servidor (`SUPABASE_*` sin NEXT_PUBLIC donde aplique). */
export function createSupabaseServiceClient(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!url || !key) return null;
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

/** `auth.users.id` del modo prueba con service role hasta que haya login en la app. */
export function getConfiguredSyncAuthUserId(): string | null {
  const uid = process.env.SUPABASE_SYNC_USER_ID?.trim();
  return uid && isLikelyUuidString(uid) ? uid : null;
}
