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

export type AppOptions = {
  fuentesGrandes: boolean;
};

export type HistoryRow = {
  id: string;
  at: string;
  kind: "uso" | "combustible" | "mantenimiento";
  title: string;
  detail: string;
};
