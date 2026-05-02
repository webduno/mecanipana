import { NextResponse } from "next/server";
import type { NominatimSearchHit } from "@/lib/osm";

const MAX_Q = 200;
const NOMINATIM =
  "https://nominatim.openstreetmap.org/search?format=json&limit=6";

/** Proxy de búsqueda Nominatim (User-Agent identificable; no exponer claves). */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") ?? "").trim();
  if (q.length < 2) {
    return NextResponse.json(
      { ok: false, error: "query_too_short" },
      { status: 400 }
    );
  }
  if (q.length > MAX_Q) {
    return NextResponse.json(
      { ok: false, error: "query_too_long" },
      { status: 400 }
    );
  }

  const url = `${NOMINATIM}&q=${encodeURIComponent(q)}`;
  let res: Response;
  try {
    res = await fetch(url, {
      headers: {
        Accept: "application/json",
        "User-Agent": "Mecanipana/1.0 (vehicle log web app)",
      },
      next: { revalidate: 0 },
    });
  } catch {
    return NextResponse.json(
      { ok: false, error: "nominatim_unreachable" },
      { status: 502 }
    );
  }

  if (!res.ok) {
    return NextResponse.json(
      { ok: false, error: "nominatim_http", status: res.status },
      { status: 502 }
    );
  }

  let raw: unknown;
  try {
    raw = await res.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: "nominatim_bad_json" },
      { status: 502 }
    );
  }

  if (!Array.isArray(raw)) {
    return NextResponse.json({ ok: true, results: [] as NominatimSearchHit[] });
  }

  const results: NominatimSearchHit[] = [];
  for (const item of raw) {
    if (!item || typeof item !== "object" || Array.isArray(item)) continue;
    const o = item as Record<string, unknown>;
    const display =
      typeof o.display_name === "string" ? o.display_name.trim() : "";
    const latRaw = o.lat;
    const lonRaw = o.lon;
    const lat =
      typeof latRaw === "string"
        ? Number(latRaw.replace(",", "."))
        : typeof latRaw === "number"
          ? latRaw
          : NaN;
    const lon =
      typeof lonRaw === "string"
        ? Number(lonRaw.replace(",", "."))
        : typeof lonRaw === "number"
          ? lonRaw
          : NaN;
    if (!display || !Number.isFinite(lat) || !Number.isFinite(lon)) continue;
    results.push({ display_name: display, lat, lon });
  }

  return NextResponse.json({ ok: true, results });
}
