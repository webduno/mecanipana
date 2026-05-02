import { NextResponse } from "next/server";
import { getLogInsertContext } from "@/lib/api/log-insert-context";
import { isLikelyUuidString } from "@/lib/supabase-service";

/** POST — `reminders` (RLS / fallback como uso y mantenimiento). */
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
  const dueRaw =
    typeof body.due_at === "string"
      ? body.due_at.trim()
      : typeof body.dueAt === "string"
        ? body.dueAt.trim()
        : "";

  const text =
    typeof body.text === "string" ? body.text.trim() : "";

  if (!isLikelyUuidString(id)) {
    return NextResponse.json({ ok: false, error: "invalid_id_uuid" }, { status: 400 });
  }

  if (!text) {
    return NextResponse.json({ ok: false, error: "invalid_text" }, { status: 400 });
  }

  let dueIso = dueRaw;
  try {
    if (!dueIso) throw new Error("empty_due");
    const d = new Date(dueIso);
    if (Number.isNaN(d.getTime())) throw new Error("bad_due");
    dueIso = d.toISOString();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_due_at" }, { status: 400 });
  }

  const done = body.done === true;

  const ctx = await getLogInsertContext();
  if (ctx.kind === "error") return ctx.response;

  const { error } = await ctx.client.from("reminders").insert({
    id,
    user_id: ctx.userId,
    due_at: dueIso,
    text,
    done,
  });

  if (error) {
    return NextResponse.json(
      {
        ok: false,
        error: "postgres_insert_failed",
        detail: error.message,
        code: error.code,
      },
      { status: 400 }
    );
  }

  return NextResponse.json({ ok: true });
}
