import { NextResponse } from "next/server";
import { getLogInsertContext } from "@/lib/api/log-insert-context";
import { normalizeLocationFieldsFromRecord } from "@/lib/location-fields";
import { isLikelyUuidString } from "@/lib/supabase-service";

function parseOptionalContactId(body: Record<string, unknown>): string | null {
  const raw = body.contact_id ?? body.contactId;
  if (raw === null || raw === undefined) return null;
  if (typeof raw !== "string") return null;
  const t = raw.trim();
  if (t === "") return null;
  if (!isLikelyUuidString(t)) return null;
  return t;
}

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
  const loc = normalizeLocationFieldsFromRecord(body);
  const estimatedCostBs =
    typeof body.estimated_cost_bs === "string"
      ? body.estimated_cost_bs.trim().slice(0, 64)
      : typeof body.estimatedCostBs === "string"
        ? body.estimatedCostBs.trim().slice(0, 64)
        : "";

  const ctx = await getLogInsertContext();
  if (ctx.kind === "error") return ctx.response;

  const contactId = parseOptionalContactId(body);

  const { error } = await ctx.client.from("reminders").insert({
    id,
    user_id: ctx.userId,
    due_at: dueIso,
    text,
    done,
    location_label: loc.locationLabel,
    location_lat: loc.locationLat,
    location_lon: loc.locationLon,
    estimated_cost_bs: estimatedCostBs,
    contact_id: contactId,
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
