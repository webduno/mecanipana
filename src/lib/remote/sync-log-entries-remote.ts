import type {
  ContactEntry,
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

async function pushContactToServer(entry: ContactEntry): Promise<boolean> {
  const res = await fetch("/api/contacts", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      id: entry.id,
      name: entry.name ?? "",
      phone: entry.phone ?? "",
      location: entry.location ?? "",
    }),
  });
  let bodyJson: unknown;
  try {
    bodyJson = await res.json();
  } catch {
    bodyJson = await res.text().catch(() => null);
  }
  if (!res.ok) {
    logSyncFail("contacto", res.status, bodyJson);
    return false;
  }
  return true;
}

async function ensureContactSyncedForId(
  contactId: string | null | undefined
): Promise<void> {
  if (!contactId?.trim()) return;
  if (!(await hasAuthSession())) return;
  const { getContactById } = await import("@/lib/local-storage-data");
  const c = getContactById(contactId);
  if (!c) return;
  await pushContactToServer(c);
}

/**
 * Sincroniza un contacto con Supabase (upsert). Solo con sesión.
 */
export async function pushContactEntryRemote(entry: ContactEntry): Promise<void> {
  try {
    if (!(await hasAuthSession())) return;
    await pushContactToServer(entry);
  } catch (e) {
    console.log("[Mecanipana] Supabase sync contacto (fetch):", e);
  }
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

    await ensureContactSyncedForId(entry.contactId);

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
        contact_id: entry.contactId,
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

    await ensureContactSyncedForId(entry.contactId);

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
        contact_id: entry.contactId,
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
