import type { MaintenanceEntry, UsageEntry } from "@/lib/mecanipana-types";

/** Valores coincidentes con columnas Postgres (solo strings / números; sin prefijos ni claves localStorage). */
function logSyncFail(label: string, status: number, payload: unknown) {
  console.log(`[Mecanipana] Supabase sync ${label} falló:`, status, payload);
}

/**
 * Inserta uso en servidor; fallos esperados hasta configurar `.env.local`.
 * localStorage ya guardó la fila; esto solo intenta Réplica Postgres.
 */
export async function pushUsageEntryRemote(entry: UsageEntry): Promise<void> {
  try {
    const res = await fetch("/api/usage-entries", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: entry.id,
        at: entry.at,
        urgencia: entry.urgencia,
        kind: entry.kind,
        note: entry.note ?? "",
        odometer_km: entry.odometerKm ?? "",
      }),
    });
    let bodyJson: unknown;
    try {
      bodyJson = await res.json();
    } catch {
      bodyJson = await res.text().catch(() => null);
    }
    if (!res.ok) logSyncFail("uso", res.status, bodyJson);
  } catch (e) {
    console.log("[Mecanipana] Supabase sync uso (fetch):", e);
  }
}

export async function pushMaintenanceEntryRemote(
  entry: MaintenanceEntry
): Promise<void> {
  try {
    const res = await fetch("/api/maintenance-entries", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: entry.id,
        at: entry.at,
        urgencia: entry.urgencia,
        what: entry.what ?? "",
        note: entry.note ?? "",
      }),
    });
    let bodyJson: unknown;
    try {
      bodyJson = await res.json();
    } catch {
      bodyJson = await res.text().catch(() => null);
    }
    if (!res.ok) logSyncFail("mantenimiento", res.status, bodyJson);
  } catch (e) {
    console.log("[Mecanipana] Supabase sync mantenimiento (fetch):", e);
  }
}
