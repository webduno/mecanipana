import { NextResponse } from "next/server";
import { getLogInsertContext } from "@/lib/api/log-insert-context";
import { isLikelyUuidString } from "@/lib/supabase-service";

/** POST — upsert `contacts` (agenda; idempotente por `id`). */
export async function POST(request: Request) {
  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "bad_json" }, { status: 400 });
  }
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    return NextResponse.json({ ok: false, error: "invalid_body" }, { status: 400 });
  }
  const body = raw as Record<string, unknown>;

  const id = body.id;
  const name =
    typeof body.name === "string"
      ? body.name.trim().slice(0, 200)
      : "";
  const phone =
    typeof body.phone === "string" ? body.phone.trim().slice(0, 64) : "";
  const location =
    typeof body.location === "string" ? body.location.trim().slice(0, 500) : "";

  if (!isLikelyUuidString(id)) {
    return NextResponse.json({ ok: false, error: "invalid_id_uuid" }, { status: 400 });
  }

  if (!name) {
    return NextResponse.json({ ok: false, error: "invalid_name" }, { status: 400 });
  }

  const ctx = await getLogInsertContext();
  if (ctx.kind === "error") return ctx.response;

  const { error } = await ctx.client.from("mecanipana_contacts").upsert(
    {
      id,
      user_id: ctx.userId,
      name,
      phone,
      location,
    },
    { onConflict: "id" }
  );

  if (error) {
    return NextResponse.json(
      {
        ok: false,
        error: "postgres_upsert_failed",
        detail: error.message,
        code: error.code,
      },
      { status: 400 }
    );
  }

  return NextResponse.json({ ok: true });
}
