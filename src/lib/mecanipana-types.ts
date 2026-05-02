export type UsageEntry = {
  id: string;
  at: string;
  /** Prioridad para tablero (1–100); 75/50/25 son niveles típicos. */
  urgencia: number;
  kind: string;
  note: string;
  odometerKm: string;
};

export type FuelEntry = {
  id: string;
  at: string;
  liters: string;
  amountBs: string;
  note: string;
};

export type MaintenanceEntry = {
  id: string;
  at: string;
  /** Prioridad para tablero (1–100); 75/50/25 son niveles típicos. */
  urgencia: number;
  what: string;
  note: string;
  /** Ubicación opcional (texto libre o resultado de Nominatim / OpenStreetMap). */
  locationLabel: string;
  locationLat: number | null;
  locationLon: number | null;
  /** Monto pagado (texto libre: usuario indica moneda; opcional). */
  paidBs: string;
};

export type ReminderEntry = {
  id: string;
  dueAt: string;
  text: string;
  done: boolean;
  /** Ubicación opcional (OpenStreetMap vía Nominatim en la app). */
  locationLabel: string;
  locationLat: number | null;
  locationLon: number | null;
  /** Costo estimado (texto libre: usuario indica moneda; opcional). */
  estimatedCostBs: string;
};

/** Temas de interfaz (localStorage + futura sync Supabase `app_options.theme`). */
export const THEME_IDS = ["win98", "neumorphism", "facephism"] as const;
export type ThemeId = (typeof THEME_IDS)[number];

export type AppOptions = {
  fuentesGrandes: boolean;
  theme: ThemeId;
};

export type HistoryRow = {
  id: string;
  at: string;
  kind: "uso" | "combustible" | "mantenimiento";
  title: string;
  detail: string;
  /** Solo uso y mantenimiento; orden futuro para tableros */
  urgencia?: number;
};
