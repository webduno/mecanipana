export type UsageEntry = {
  id: string;
  at: string;
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
  what: string;
  note: string;
};

export type ReminderEntry = {
  id: string;
  dueAt: string;
  text: string;
  done: boolean;
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
};
