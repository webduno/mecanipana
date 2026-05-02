function coordFromUnknown(v: unknown): number | null {
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (typeof v === "string" && v.trim() !== "") {
    const n = Number(v.trim().replace(",", "."));
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

/** Acepta camelCase o snake_case (sync API / localStorage / export). */
export function normalizeLocationFieldsFromRecord(x: Record<string, unknown>): {
  locationLabel: string;
  locationLat: number | null;
  locationLon: number | null;
} {
  const raw = x.locationLabel ?? x.location_label ?? "";
  const locationLabel =
    typeof raw === "string" ? raw.trim().slice(0, 500) : "";
  const lat = coordFromUnknown(x.locationLat ?? x.location_lat);
  const lon = coordFromUnknown(x.locationLon ?? x.location_lon);
  if (lat === null || lon === null) {
    return { locationLabel, locationLat: null, locationLon: null };
  }
  return { locationLabel, locationLat: lat, locationLon: lon };
}
