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
import { parseVariantLabel } from "@/lib/vehicle-variant-parse";

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

/** Heurística: entradas que cuentan como cambio o filtro de aceite (incl. etiquetas personalizadas). */
function isOilChangeWhat(what: string): boolean {
  const w = what.trim().toLowerCase();
  if (!w.includes("aceite")) return false;
  if (w.includes("presión") || w.includes("presion") || w.includes("testigo")) return false;
  return (
    w.includes("cambio") || w.includes("filtro") || w === "aceite" || /^aceite\b/.test(w)
  );
}

export type OilChangeReminderSuggestion =
  | { kind: "register_first" }
  | { kind: "older_than_three_months"; lastAt: string; what: string };

function startOfLocalDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function addCalendarMonths(base: Date, months: number): Date {
  const d = new Date(base.getTime());
  d.setMonth(d.getMonth() + months);
  return d;
}

function lastMaintenanceMatch(
  entries: MaintenanceEntry[],
  pred: (what: string) => boolean,
): { at: string; what: string } | null {
  let best: { at: string; what: string } | null = null;
  let bestMs = -Infinity;
  for (const e of entries) {
    if (!pred(e.what)) continue;
    const t = new Date(e.at).getTime();
    if (!Number.isFinite(t)) continue;
    if (t > bestMs) {
      bestMs = t;
      best = { at: e.at, what: e.what };
    }
  }
  return best;
}

export function getLastOilChangeFromMaintenanceLog(
  entries: MaintenanceEntry[],
): { at: string; what: string } | null {
  return lastMaintenanceMatch(entries, isOilChangeWhat);
}

type LogRecency = "none" | "stale" | "ok";

function logRecency(
  entries: MaintenanceEntry[],
  pred: (what: string) => boolean,
  staleAfterMonths: number,
): LogRecency {
  const last = lastMaintenanceMatch(entries, pred);
  if (!last) return "none";
  const lastDate = new Date(last.at);
  if (Number.isNaN(lastDate.getTime())) return "none";
  const threshold = addCalendarMonths(lastDate, staleAfterMonths);
  const todayStart = startOfLocalDay(new Date()).getTime();
  const thresholdStart = startOfLocalDay(threshold).getTime();
  if (todayStart <= thresholdStart) return "ok";
  return "stale";
}

function isCauchoWhat(what: string): boolean {
  const w = what.trim().toLowerCase();
  return (
    w.includes("caucho") ||
    w.includes("llanta") ||
    w.includes("neumático") ||
    w.includes("neumatico") ||
    w.includes("alineación") ||
    w.includes("alineacion") ||
    w.includes("balanceo")
  );
}

function isFrenoWhat(what: string): boolean {
  const w = what.trim().toLowerCase();
  return (
    w.includes("freno") ||
    w.includes("frenos") ||
    w.includes("pastilla") ||
    w.includes("disco")
  );
}

function isBateriaWhat(what: string): boolean {
  const w = what.trim().toLowerCase();
  return w.includes("batería") || w.includes("bateria");
}

function isRefrigeranteWhat(what: string): boolean {
  const w = what.trim().toLowerCase();
  return (
    w.includes("refrigerante") ||
    w.includes("coolant") ||
    w.includes("anticongelante") ||
    w.includes("enfriamiento") ||
    w.includes("radiador")
  );
}

/** Filtros que no sean ya cubiertos por cambio/filtro de aceite. */
function isFiltroNoAceiteWhat(what: string): boolean {
  if (isOilChangeWhat(what)) return false;
  const w = what.trim().toLowerCase();
  return w.includes("filtro");
}

function isLucesWhat(what: string): boolean {
  const w = what.trim().toLowerCase();
  return (
    w.includes("luz") ||
    w.includes("luces") ||
    w.includes("foco") ||
    w.includes("faro") ||
    w.includes("bomillo") ||
    w.includes("direccional") ||
    w.includes("stop")
  );
}

function isVidrioWhat(what: string): boolean {
  const w = what.trim().toLowerCase();
  return (
    w.includes("vidrio") ||
    w.includes("cristal") ||
    w.includes("parabrisas") ||
    w.includes("luneta")
  );
}

function hasPaperReminderPending(reminders: ReminderEntry[]): boolean {
  const re =
    /seguro|póliza|poliza|ordenanza|certificado|licencia|circulaci[oó]n|titulo|título|papeles|vehicular/i;
  return reminders.some((r) => !r.done && re.test(r.text));
}

export type MaintenanceSuggestionTile = {
  id: string;
  emoji: string;
  title: string;
  subtitle: string;
  tone: "ok" | "attention" | "tip";
  href: "/mantenimiento" | "/recordatorios";
};

/**
 * Tarjetas compactas para Resumen (VE): heurística por `what` en el log local
 * y recordatorios pendientes para papeles. Aceite 3 meses; el resto del taller 6 meses;
 * luces/vidrios sin registro se muestran como tip suave.
 */
export function getMaintenanceSuggestionTiles(
  entries: MaintenanceEntry[],
  reminders: ReminderEntry[],
): MaintenanceSuggestionTile[] {
  const tiles: MaintenanceSuggestionTile[] = [];

  const pushLogTile = (
    id: string,
    emoji: string,
    title: string,
    months: number,
    pred: (what: string) => boolean,
    softNever: boolean,
  ) => {
    const r = logRecency(entries, pred, months);
    if (r === "none") {
      tiles.push({
        id,
        emoji,
        title,
        subtitle: softNever ? "Revisar" : "Anotar",
        tone: softNever ? "tip" : "attention",
        href: "/mantenimiento",
      });
      return;
    }
    if (r === "stale") {
      tiles.push({
        id,
        emoji,
        title,
        subtitle: "Ya toca",
        tone: "attention",
        href: "/mantenimiento",
      });
      return;
    }
    tiles.push({
      id,
      emoji,
      title,
      subtitle: "Al día",
      tone: "ok",
      href: "/mantenimiento",
    });
  };

  pushLogTile("caucho", "🛞", "Cauchos", 6, isCauchoWhat, false);
  pushLogTile("freno", "🛑", "Frenos", 6, isFrenoWhat, false);
  pushLogTile("bateria", "🔋", "Batería", 6, isBateriaWhat, false);
  pushLogTile("refrigerante", "🌡️", "Refrigerante", 6, isRefrigeranteWhat, false);
  pushLogTile("filtro", "🔧", "Filtros", 6, isFiltroNoAceiteWhat, false);

  if (hasPaperReminderPending(reminders)) {
    tiles.push({
      id: "papeles",
      emoji: "📄",
      title: "Papeles",
      subtitle: "En lista",
      tone: "ok",
      href: "/recordatorios",
    });
  } else {
    tiles.push({
      id: "papeles",
      emoji: "📄",
      title: "Papeles",
      subtitle: "Anótalo",
      tone: "attention",
      href: "/recordatorios",
    });
  }

  pushLogTile("luces", "💡", "Luces", 6, isLucesWhat, true);
  pushLogTile("vidrios", "🪟", "Vidrios", 6, isVidrioWhat, true);
  pushLogTile("aceite", "🛢️", "Aceite", 3, isOilChangeWhat, false);

  return tiles;
}

/**
 * Para Resumen: sugerir registrar aceite o planear cambio si el último en el log local tiene más de 3 meses.
 * `null` si hay un cambio registrado y la fecha aún no supera ese umbral (mismo día del 3.er mes inclusive).
 */
export function getOilChangeReminderSuggestion(
  entries: MaintenanceEntry[],
): OilChangeReminderSuggestion | null {
  const last = getLastOilChangeFromMaintenanceLog(entries);
  if (!last) return { kind: "register_first" };
  const lastDate = new Date(last.at);
  if (Number.isNaN(lastDate.getTime())) return { kind: "register_first" };
  const threeMonthsAfter = addCalendarMonths(lastDate, 3);
  const todayStart = startOfLocalDay(new Date()).getTime();
  const thresholdStart = startOfLocalDay(threeMonthsAfter).getTime();
  if (todayStart <= thresholdStart) return null;
  return { kind: "older_than_three_months", lastAt: last.at, what: last.what };
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

/** Añade texto al historial de notas (preguntas breves desde el cuestionario). */
export function appendQuestionnaireParagraphToVehicleNotes(body: string): void {
  const trimmed = body.trim();
  if (!trimmed) return;
  const cur = loadVehicleNotes().trimEnd();
  const stamp = new Date().toLocaleString("es-VE", {
    dateStyle: "short",
    timeStyle: "short",
  });
  const block = `\n\n--- Estado rápido del carro (${stamp}) ---\n${trimmed}\n`;
  saveVehicleNotes(cur ? `${cur}${block}` : `${block.trim()}\n`);
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

/** Marca/modelo y versión `motor · año` guardados con formato válido. */
export function isVehicleProfileComplete(): boolean {
  const { line, variant } = readSelectedVehicle();
  if (!line.trim()) return false;
  return parseVariantLabel(variant) !== null;
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

const STORAGE_KEY_SET = new Set<string>(Object.values(STORAGE_KEYS));

function valueToStorageString(v: unknown): string {
  if (typeof v === "string") return v;
  return JSON.stringify(v);
}

/** Aplica un objeto exportado por {@link exportAllLocalPayload} (solo claves conocidas). */
export function importAllLocalPayload(payload: unknown): void {
  if (!isObjectRecord(payload)) {
    throw new Error("Mecanipana: el respaldo no es un objeto JSON.");
  }
  for (const [k, v] of Object.entries(payload)) {
    if (!STORAGE_KEY_SET.has(k)) continue;
    if (v === undefined) continue;
    window.localStorage.setItem(k, valueToStorageString(v));
  }
}

export function clearAllMecanipanaKeys() {
  const keys = Object.keys(window.localStorage);
  for (const k of keys) {
    if (k.startsWith("mecanipana:")) window.localStorage.removeItem(k);
  }
}
