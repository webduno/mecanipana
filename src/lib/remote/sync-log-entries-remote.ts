import type {
  MaintenanceEntry,
  ReminderEntry,
  UsageEntry,
} from "@/lib/mecanipana-types";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

/** Valores coincidentes con columnas Postgres (solo strings / números; sin prefijos ni claves localStorage). */
function logSyncFail(label: string, status: number, payload: unknown) {
  console.log(`[Mecanipana] Supabase sync ${label} falló:`, status, payload);
}

async function hasAuthSession(): Promise<boolean> {
  const supabase = createSupabaseBrowserClient();
  if (!supabase) return false;
  const { data } = await supabase.auth.getSession();
  return Boolean(data.session?.user);
}

/**
 * Inserta uso en servidor solo si hubo login (sesión). Sin sesión: solo localStorage.
 */
export async function pushUsageEntryRemote(entry: UsageEntry): Promise<void> {
  try {
    if (!(await hasAuthSession())) return;

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

/** Igual que uso: solo con sesión de login. */
export async function pushMaintenanceEntryRemote(
  entry: MaintenanceEntry
): Promise<void> {
  try {
    if (!(await hasAuthSession())) return;

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
        location_label: entry.locationLabel ?? "",
        location_lat: entry.locationLat,
        location_lon: entry.locationLon,
        paid_bs: entry.paidBs ?? "",
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

/** Igual que uso: solo con sesión de login. */
export async function pushReminderEntryRemote(
  entry: ReminderEntry
): Promise<void> {
  try {
    if (!(await hasAuthSession())) return;

    const res = await fetch("/api/reminders", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: entry.id,
        due_at: entry.dueAt,
        text: entry.text ?? "",
        done: Boolean(entry.done),
        location_label: entry.locationLabel ?? "",
        location_lat: entry.locationLat,
        location_lon: entry.locationLon,
        estimated_cost_bs: entry.estimatedCostBs ?? "",
      }),
    });
    let bodyJson: unknown;
    try {
      bodyJson = await res.json();
    } catch {
      bodyJson = await res.text().catch(() => null);
    }
    if (!res.ok) logSyncFail("recordatorio", res.status, bodyJson);
  } catch (e) {
    console.log("[Mecanipana] Supabase sync recordatorio (fetch):", e);
  }
}
