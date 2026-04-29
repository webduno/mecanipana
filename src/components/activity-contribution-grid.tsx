"use client";

import type {
  FuelEntry,
  MaintenanceEntry,
  UsageEntry,
} from "@/lib/mecanipana-types";

/** Alineado con badges / tipos en historial */
const COLOR_USO = "#000080";
const COLOR_COMBUSTIBLE = "#b35900";
const COLOR_MANTENIMIENTO = "#1f6b3a";
const COLOR_EMPTY = "#e6e6e6";
const COLOR_FUTURE = "#f4f4f4";

const WEEKDAY_LABELS_SHORT = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

function localDayKeyFromIso(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function localDayKeyFromDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

type DayBuckets = Map<
  string,
  { uso: number; fuel: number; maint: number }
>;

function buildDayBuckets(
  usageLog: UsageEntry[],
  fuelLog: FuelEntry[],
  maintenanceLog: MaintenanceEntry[]
): DayBuckets {
  const map = new Map<string, { uso: number; fuel: number; maint: number }>();

  function bump(
    key: string,
    field: "uso" | "fuel" | "maint",
    delta = 1
  ) {
    if (!key) return;
    const cur = map.get(key) ?? { uso: 0, fuel: 0, maint: 0 };
    cur[field] += delta;
    map.set(key, cur);
  }

  for (const e of usageLog) {
    bump(localDayKeyFromIso(e.at), "uso");
  }
  for (const e of fuelLog) {
    bump(localDayKeyFromIso(e.at), "fuel");
  }
  for (const e of maintenanceLog) {
    bump(localDayKeyFromIso(e.at), "maint");
  }

  return map;
}

type CellModel = {
  key: string;
  date: Date;
  isFuture: boolean;
  uso: number;
  fuel: number;
  maint: number;
};

function buildWeekGrid(
  buckets: DayBuckets,
  numWeeks: number,
  today: Date
): CellModel[][] {
  const end = new Date(today);
  end.setHours(0, 0, 0, 0);

  const sunThisWeek = new Date(end);
  sunThisWeek.setDate(end.getDate() - end.getDay());

  const sunOldest = new Date(sunThisWeek);
  sunOldest.setDate(sunThisWeek.getDate() - (numWeeks - 1) * 7);

  const cols: CellModel[][] = [];
  for (let c = 0; c < numWeeks; c++) {
    const column: CellModel[] = [];
    for (let r = 0; r < 7; r++) {
      const cellDate = new Date(sunOldest);
      cellDate.setDate(sunOldest.getDate() + c * 7 + r);
      cellDate.setHours(0, 0, 0, 0);

      const dk = localDayKeyFromDate(cellDate);
      const isFuture = cellDate > end;
      const b = buckets.get(dk) ?? { uso: 0, fuel: 0, maint: 0 };

      column.push({
        key: dk,
        date: cellDate,
        isFuture,
        uso: isFuture ? 0 : b.uso,
        fuel: isFuture ? 0 : b.fuel,
        maint: isFuture ? 0 : b.maint,
      });
    }
    cols.push(column);
  }
  return cols;
}

function cellTooltip(
  date: Date,
  uso: number,
  fuel: number,
  maint: number,
  isFuture: boolean
): string {
  const ds = date.toLocaleDateString("es-VE", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  if (isFuture) return `${ds} · (futuro)`;
  const bits: string[] = [];
  if (uso) bits.push(`Usos: ${uso}`);
  if (fuel) bits.push(`Gas: ${fuel}`);
  if (maint) bits.push(`Mant.: ${maint}`);
  return bits.length ? `${ds} · ${bits.join(" · ")}` : `${ds} · Sin registros`;
}

function ActivityCell({
  uso,
  fuel,
  maint,
  date,
  isFuture,
}: {
  uso: number;
  fuel: number;
  maint: number;
  date: Date;
  isFuture: boolean;
}) {
  const segments: { color: string; id: string }[] = [];
  if (uso > 0) segments.push({ color: COLOR_USO, id: "u" });
  if (fuel > 0) segments.push({ color: COLOR_COMBUSTIBLE, id: "f" });
  if (maint > 0) segments.push({ color: COLOR_MANTENIMIENTO, id: "m" });

  const emptyBg = isFuture ? COLOR_FUTURE : COLOR_EMPTY;
  const title = cellTooltip(date, uso, fuel, maint, isFuture);

  return (
    <div
      className="box-border aspect-square min-h-[12px] min-w-[12px] border border-[#b0b0b0] shadow-[inset_1px_1px_0_#fff,inset_-1px_-1px_0_#808080]"
      style={{ backgroundColor: segments.length === 0 ? emptyBg : undefined }}
      title={title}
      role="presentation"
    >
      {segments.length > 0 ? (
        <div className="flex h-full w-full">
          {segments.map((s) => (
            <div
              key={s.id}
              className="h-full min-h-0 min-w-0 flex-1"
              style={{ backgroundColor: s.color }}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}

export type ActivityContributionGridProps = {
  usageLog: UsageEntry[];
  fuelLog: FuelEntry[];
  maintenanceLog: MaintenanceEntry[];
  /** Columnas (semanas), como la grilla de perfil de GitHub */
  weeks?: number;
};

export function ActivityContributionGrid({
  usageLog,
  fuelLog,
  maintenanceLog,
  weeks = 26,
}: ActivityContributionGridProps) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const buckets = buildDayBuckets(usageLog, fuelLog, maintenanceLog);
  const matrix = buildWeekGrid(buckets, weeks, today);

  return (
    <div className="flex min-w-0 gap-1.5 sm:gap-2">
      <div
        className="flex shrink-0 flex-col gap-[3px]"
        aria-hidden
      >
        {WEEKDAY_LABELS_SHORT.map((lab) => (
          <span
            key={lab}
            className="flex h-[14px] items-center text-[0.62rem] font-semibold leading-none text-[#505050] sm:text-[0.68rem]"
          >
            {lab}
          </span>
        ))}
      </div>
      <div className="min-w-0 flex-1 overflow-x-auto pb-1">
        <div
          className="grid gap-[3px]"
          style={{
            gridTemplateColumns: `repeat(${weeks}, minmax(11px, 14px))`,
            gridTemplateRows: `repeat(7, minmax(11px, 14px))`,
            width: "max-content",
          }}
          role="grid"
          aria-label="Actividad por día en las últimas semanas"
        >
          {matrix.flatMap((column, ci) =>
            column.map((cell, ri) => (
              <div
                key={`${cell.key}-${ci}-${ri}`}
                style={{ gridColumn: ci + 1, gridRow: ri + 1 }}
              >
                <ActivityCell
                  uso={cell.uso}
                  fuel={cell.fuel}
                  maint={cell.maint}
                  date={cell.date}
                  isFuture={cell.isFuture}
                />
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export function ActivityContributionLegend() {
  return (
    <div
      className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5 text-[0.82rem] text-[#303030]"
    >
      <span className="inline-flex items-center gap-1.5">
        <span
          className="inline-block size-3 shrink-0 border border-[#808080]"
          style={{ backgroundColor: COLOR_USO }}
        />
        Usos
      </span>
      <span className="inline-flex items-center gap-1.5">
        <span
          className="inline-block size-3 shrink-0 border border-[#808080]"
          style={{ backgroundColor: COLOR_COMBUSTIBLE }}
        />
        Carga de gas
      </span>
      <span className="inline-flex items-center gap-1.5">
        <span
          className="inline-block size-3 shrink-0 border border-[#808080]"
          style={{ backgroundColor: COLOR_MANTENIMIENTO }}
        />
        Mantenimiento
      </span>
      <span className="inline-flex items-center gap-1.5 text-[#606060]">
        <span
          className="inline-block size-3 shrink-0 border border-[#b0b0b0]"
          style={{ backgroundColor: COLOR_EMPTY }}
        />
        Sin registros
      </span>
    </div>
  );
}
