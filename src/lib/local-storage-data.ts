import type {
  AppOptions,
  FuelEntry,
  HistoryRow,
  MaintenanceEntry,
  ReminderEntry,
  UsageEntry,
} from "@/lib/mecanipana-types";
import { STORAGE_KEYS } from "@/lib/storage-keys";

function safeParse<T>(raw: string | null, fallback: T): T {
  if (raw == null) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function isObjectRecord(x: unknown): x is Record<string, unknown> {
  return typeof x === "object" && x !== null && !Array.isArray(x);
}

export function makeId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export function loadUsageLog(): UsageEntry[] {
  if (typeof window === "undefined") return [];
  const v = safeParse<unknown>(window.localStorage.getItem(STORAGE_KEYS.usageLog), []);
  if (!Array.isArray(v)) return [];
  return v.filter(isUsageEntry);
}

function isUsageEntry(x: unknown): x is UsageEntry {
  if (!isObjectRecord(x)) return false;
  return (
    typeof x.id === "string" &&
    typeof x.at === "string" &&
    typeof x.kind === "string" &&
    typeof x.note === "string" &&
    typeof x.odometerKm === "string"
  );
}

export function saveUsageLog(entries: UsageEntry[]) {
  window.localStorage.setItem(STORAGE_KEYS.usageLog, JSON.stringify(entries));
}

export function appendUsage(entry: Omit<UsageEntry, "id">): UsageEntry {
  const row: UsageEntry = { ...entry, id: makeId() };
  const list = loadUsageLog();
  list.unshift(row);
  saveUsageLog(list);
  return row;
}

export function loadFuelLog(): FuelEntry[] {
  if (typeof window === "undefined") return [];
  const v = safeParse<unknown>(window.localStorage.getItem(STORAGE_KEYS.fuelLog), []);
  if (!Array.isArray(v)) return [];
  return v.filter(isFuelEntry);
}

function isFuelEntry(x: unknown): x is FuelEntry {
  if (!isObjectRecord(x)) return false;
  return (
    typeof x.id === "string" &&
    typeof x.at === "string" &&
    typeof x.liters === "string" &&
    typeof x.amountBs === "string" &&
    typeof x.note === "string"
  );
}

export function saveFuelLog(entries: FuelEntry[]) {
  window.localStorage.setItem(STORAGE_KEYS.fuelLog, JSON.stringify(entries));
}

export function appendFuel(entry: Omit<FuelEntry, "id">): FuelEntry {
  const row: FuelEntry = { ...entry, id: makeId() };
  const list = loadFuelLog();
  list.unshift(row);
  saveFuelLog(list);
  return row;
}

export function loadMaintenanceLog(): MaintenanceEntry[] {
  if (typeof window === "undefined") return [];
  const v = safeParse<unknown>(
    window.localStorage.getItem(STORAGE_KEYS.maintenanceLog),
    []
  );
  if (!Array.isArray(v)) return [];
  return v.filter(isMaintenanceEntry);
}

function isMaintenanceEntry(x: unknown): x is MaintenanceEntry {
  if (!isObjectRecord(x)) return false;
  return (
    typeof x.id === "string" &&
    typeof x.at === "string" &&
    typeof x.what === "string" &&
    typeof x.note === "string"
  );
}

export function saveMaintenanceLog(entries: MaintenanceEntry[]) {
  window.localStorage.setItem(STORAGE_KEYS.maintenanceLog, JSON.stringify(entries));
}

export function appendMaintenance(entry: Omit<MaintenanceEntry, "id">): MaintenanceEntry {
  const row: MaintenanceEntry = { ...entry, id: makeId() };
  const list = loadMaintenanceLog();
  list.unshift(row);
  saveMaintenanceLog(list);
  return row;
}

export function loadReminders(): ReminderEntry[] {
  if (typeof window === "undefined") return [];
  const v = safeParse<unknown>(window.localStorage.getItem(STORAGE_KEYS.reminders), []);
  if (!Array.isArray(v)) return [];
  return v.filter(isReminderEntry);
}

function isReminderEntry(x: unknown): x is ReminderEntry {
  if (!isObjectRecord(x)) return false;
  return (
    typeof x.id === "string" &&
    typeof x.dueAt === "string" &&
    typeof x.text === "string" &&
    typeof x.done === "boolean"
  );
}

export function saveReminders(entries: ReminderEntry[]) {
  window.localStorage.setItem(STORAGE_KEYS.reminders, JSON.stringify(entries));
}

export function loadVehicleNotes(): string {
  if (typeof window === "undefined") return "";
  return window.localStorage.getItem(STORAGE_KEYS.vehicleNotes) ?? "";
}

export function saveVehicleNotes(text: string) {
  window.localStorage.setItem(STORAGE_KEYS.vehicleNotes, text);
}

export function loadAppOptions(): AppOptions {
  if (typeof window === "undefined") return { fuentesGrandes: false };
  const v = safeParse<unknown>(window.localStorage.getItem(STORAGE_KEYS.options), {});
  if (!isObjectRecord(v)) return { fuentesGrandes: false };
  return {
    fuentesGrandes: v.fuentesGrandes === true,
  };
}

export function saveAppOptions(opts: AppOptions) {
  window.localStorage.setItem(STORAGE_KEYS.options, JSON.stringify(opts));
}

export function readSelectedVehicle(): { line: string; variant: string } {
  if (typeof window === "undefined") return { line: "", variant: "" };
  return {
    line: window.localStorage.getItem(STORAGE_KEYS.selectedVehicleLine) ?? "",
    variant: window.localStorage.getItem(STORAGE_KEYS.selectedVariant) ?? "",
  };
}

export function buildHistoryRows(): HistoryRow[] {
  const rows: HistoryRow[] = [];
  for (const e of loadUsageLog()) {
    rows.push({
      id: `uso-${e.id}`,
      at: e.at,
      kind: "uso",
      title: e.kind,
      detail: [e.odometerKm && `${e.odometerKm} km`, e.note].filter(Boolean).join(" · "),
    });
  }
  for (const e of loadFuelLog()) {
    rows.push({
      id: `comb-${e.id}`,
      at: e.at,
      kind: "combustible",
      title: "Combustible",
      detail: [e.liters && `${e.liters} L`, e.amountBs && `${e.amountBs} Bs`, e.note]
        .filter(Boolean)
        .join(" · "),
    });
  }
  for (const e of loadMaintenanceLog()) {
    rows.push({
      id: `mant-${e.id}`,
      at: e.at,
      kind: "mantenimiento",
      title: e.what || "Mantenimiento",
      detail: e.note,
    });
  }
  rows.sort((a, b) => (a.at < b.at ? 1 : a.at > b.at ? -1 : 0));
  return rows;
}

export function exportAllLocalPayload(): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const k of Object.values(STORAGE_KEYS)) {
    const raw = window.localStorage.getItem(k);
    if (raw == null) continue;
    try {
      out[k] = JSON.parse(raw) as unknown;
    } catch {
      out[k] = raw;
    }
  }
  return out;
}

export function clearAllMecanipanaKeys() {
  const keys = Object.keys(window.localStorage);
  for (const k of keys) {
    if (k.startsWith("mecanipana:")) window.localStorage.removeItem(k);
  }
}
