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

function clampUrgencia(n: unknown): number | null {
  const v =
    typeof n === "number"
      ? n
      : typeof n === "string"
        ? Number(n.trim())
        : NaN;
  if (!Number.isFinite(v)) return null;
  return Math.min(100, Math.max(1, Math.round(v)));
}

/** POST — `maintenance_entries` (RLS / fallback como usage). */
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
  const atRaw = body.at;
  const what =
    typeof body.what === "string"
      ? body.what.trim()
      : "";
  const note = typeof body.note === "string" ? body.note : "";

  if (!isLikelyUuidString(id)) {
    return NextResponse.json({ ok: false, error: "invalid_id_uuid" }, { status: 400 });
  }

  let atIso = typeof atRaw === "string" ? atRaw.trim() : "";
  try {
    if (!atIso) throw new Error("empty_at");
    const d = new Date(atIso);
    if (Number.isNaN(d.getTime())) throw new Error("bad_at");
    atIso = d.toISOString();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_at" }, { status: 400 });
  }

  const urgencia = clampUrgencia(body.urgencia);
  if (urgencia === null) {
    return NextResponse.json({ ok: false, error: "invalid_urgencia" }, { status: 400 });
  }

  const ctx = await getLogInsertContext();
  if (ctx.kind === "error") return ctx.response;

  const whatFinal = what || "Mantenimiento";
  const loc = normalizeLocationFieldsFromRecord(body);
  const paidBs =
    typeof body.paid_bs === "string"
      ? body.paid_bs.trim().slice(0, 64)
      : typeof body.paidBs === "string"
        ? body.paidBs.trim().slice(0, 64)
        : "";

  const contactId = parseOptionalContactId(body);

  const { error } = await ctx.client.from("maintenance_entries").insert({
    id,
    user_id: ctx.userId,
    at: atIso,
    urgencia,
    what: whatFinal,
    note,
    location_label: loc.locationLabel,
    location_lat: loc.locationLat,
    location_lon: loc.locationLon,
    paid_bs: paidBs,
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
