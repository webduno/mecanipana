import {
  THEME_IDS,
  type AppOptions,
  type FuelEntry,
  type HistoryRow,
  type MaintenanceEntry,
  type ReminderEntry,
  type ThemeId,
  type UsageEntry,
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
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {
    return crypto.randomUUID();
  }
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.getRandomValues === "function"
  ) {
    const b = new Uint8Array(16);
    crypto.getRandomValues(b);
    b[6] = (b[6]! & 0x0f) | 0x40;
    b[8] = (b[8]! & 0x3f) | 0x80;
    let hex = "";
    for (const x of b) {
      hex += x.toString(16).padStart(2, "0");
    }
    return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(
      16,
      20
    )}-${hex.slice(20)}`;
  }
  throw new Error(
    "Mecanipana: no se puede generar id (crypto.randomUUID / getRandomValues no disponibles)."
  );
}

function normalizeUrgencia(raw: unknown): number {
  if (typeof raw === "number" && Number.isFinite(raw)) {
    return Math.min(100, Math.max(1, Math.round(raw)));
  }
  if (typeof raw === "string" && raw.trim() !== "") {
    const n = Number(raw.trim().replace(",", "."));
    if (Number.isFinite(n)) return Math.min(100, Math.max(1, Math.round(n)));
  }
  return 50;
}

function parseUsageEntry(x: unknown): UsageEntry | null {
  if (!isObjectRecord(x)) return null;
  if (
    typeof x.id !== "string" ||
    typeof x.at !== "string" ||
    typeof x.kind !== "string" ||
    typeof x.note !== "string" ||
    typeof x.odometerKm !== "string"
  ) {
    return null;
  }
  return {
    id: x.id,
    at: x.at,
    kind: x.kind,
    note: x.note,
    odometerKm: x.odometerKm,
    urgencia: normalizeUrgencia(x.urgencia),
  };
}

export function loadUsageLog(): UsageEntry[] {
  if (typeof window === "undefined") return [];
  const v = safeParse<unknown>(window.localStorage.getItem(STORAGE_KEYS.usageLog), []);
  if (!Array.isArray(v)) return [];
  return v.map(parseUsageEntry).filter((e): e is UsageEntry => e !== null);
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
  return v.map(parseMaintenanceEntry).filter((e): e is MaintenanceEntry => e !== null);
}

function parseMaintenanceEntry(x: unknown): MaintenanceEntry | null {
  if (!isObjectRecord(x)) return null;
  if (
    typeof x.id !== "string" ||
    typeof x.at !== "string" ||
    typeof x.what !== "string" ||
    typeof x.note !== "string"
  ) {
    return null;
  }
  return {
    id: x.id,
    at: x.at,
    what: x.what,
    note: x.note,
    urgencia: normalizeUrgencia(x.urgencia),
  };
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

function isNonEmptyTrimmedString(x: unknown): x is string {
  return typeof x === "string" && x.trim() !== "";
}

export function loadMaintenanceWhatCustom(): string[] {
  if (typeof window === "undefined") return [];
  const v = safeParse<unknown>(
    window.localStorage.getItem(STORAGE_KEYS.maintenanceWhatCustom),
    []
  );
  if (!Array.isArray(v)) return [];
  return v.filter(isNonEmptyTrimmedString).map((s) => s.trim());
}

export function appendMaintenanceWhatCustom(label: string): string[] {
  const trimmed = label.trim();
  if (!trimmed) return loadMaintenanceWhatCustom();
  const current = loadMaintenanceWhatCustom();
  const lower = trimmed.toLowerCase();
  if (current.some((x) => x.toLowerCase() === lower)) return current;
  const next = [...current, trimmed];
  window.localStorage.setItem(STORAGE_KEYS.maintenanceWhatCustom, JSON.stringify(next));
  return next;
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

function normalizeTheme(raw: unknown): ThemeId {
  if (
    typeof raw === "string" &&
    (THEME_IDS as readonly string[]).includes(raw)
  ) {
    return raw as ThemeId;
  }
  return "win98";
}

export function loadAppOptions(): AppOptions {
  if (typeof window === "undefined") {
    return { fuentesGrandes: false, theme: "win98" };
  }
  const v = safeParse<unknown>(window.localStorage.getItem(STORAGE_KEYS.options), {});
  if (!isObjectRecord(v)) return { fuentesGrandes: false, theme: "win98" };
  return {
    fuentesGrandes: v.fuentesGrandes === true,
    theme: normalizeTheme(v.theme),
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
      urgencia: e.urgencia,
      detail: [
        `urg. ${e.urgencia}`,
        e.odometerKm && `${e.odometerKm} km`,
        e.note,
      ]
        .filter(Boolean)
        .join(" · "),
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
      urgencia: e.urgencia,
      detail: [`urg. ${e.urgencia}`, e.note].filter(Boolean).join(" · "),
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
