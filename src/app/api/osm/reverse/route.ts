import { NextResponse } from "next/server";

const NOMINATIM =
  "https://nominatim.openstreetmap.org/reverse?format=json&zoom=18&addressdetails=0";

function parseCoord(raw: string | null): number | null {
  if (raw == null || raw.trim() === "") return null;
  const n = Number(raw.trim().replace(",", "."));
  if (!Number.isFinite(n)) return null;
  return n;
}

/** Proxy Nominatim reverse (click en mapa → nombre legible). */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const lat = parseCoord(searchParams.get("lat"));
  const lon = parseCoord(searchParams.get("lon"));
  if (lat === null || lon === null) {
    return NextResponse.json({ ok: false, error: "invalid_lat_lon" }, { status: 400 });
  }
  if (lat < -90 || lat > 90 || lon < -180 || lon > 180) {
    return NextResponse.json({ ok: false, error: "out_of_range" }, { status: 400 });
  }

  const url = `${NOMINATIM}&lat=${encodeURIComponent(String(lat))}&lon=${encodeURIComponent(String(lon))}`;
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

  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    return NextResponse.json({ ok: false, error: "invalid_payload" }, { status: 502 });
  }

  const o = raw as Record<string, unknown>;
  const display =
    typeof o.display_name === "string" ? o.display_name.trim() : "";

  if (!display) {
    return NextResponse.json({
      ok: true,
      display_name: `${lat.toFixed(5)}, ${lon.toFixed(5)}`,
      lat,
      lon,
    });
  }

  return NextResponse.json({
    ok: true,
    display_name: display,
    lat,
    lon,
  });
}
