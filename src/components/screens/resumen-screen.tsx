"use client";

import {
  ActivityContributionGrid,
  ActivityContributionLegend,
} from "@/components/activity-contribution-grid";
import {
  buildHistoryRows,
  loadFuelLog,
  loadMaintenanceLog,
  loadUsageLog,
  readSelectedVehicle,
} from "@/lib/local-storage-data";

function formatDisplayAt(iso: string) {
  try {
    const d = new Date(iso);
    return d.toLocaleString("es-VE", { dateStyle: "short", timeStyle: "short" });
  } catch {
    return iso;
  }
}

export function ResumenScreen() {
  const vehicle = readSelectedVehicle();
  const usage = loadUsageLog();
  const fuel = loadFuelLog();
  const maint = loadMaintenanceLog();
  const timeline = buildHistoryRows().slice(0, 8);

  return (
    <>
      <p className="m-0 text-pretty">
        Resumen de lo que llevas guardado en <strong>este equipo</strong>.
      </p>

      <div className="win98-inset">
        <p className="win98-label m-0">Carro elegido (inicio)</p>
        <p className="m-2 mb-0 font-bold">
          {vehicle.line || "—"} {vehicle.variant || ""}
        </p>
      </div>

      <div className="win98-inset m-0 grid gap-3 sm:grid-cols-3">
        <div>
          <p className="win98-muted m-0">Usos</p>
          <p className="m-1 text-2xl font-extrabold">{usage.length}</p>
        </div>
        <div>
          <p className="win98-muted m-0">Cargas de gas</p>
          <p className="m-1 text-2xl font-extrabold">{fuel.length}</p>
        </div>
        <div>
          <p className="win98-muted m-0">Mantenimiento</p>
          <p className="m-1 text-2xl font-extrabold">{maint.length}</p>
        </div>
      </div>

      <div className="win98-inset">
        <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <p className="win98-label m-0">Actividad por día</p>
            <p className="win98-muted m-0 mt-1 max-w-none text-[0.88rem] leading-snug">
              Estilo grilla de contribuciones: cada cuadro es un día con datos de{" "}
              <strong>este equipo</strong>. Si un día tiene más de un tipo, el cuadro se divide
              en franjas de color.
            </p>
          </div>
          <label
            className="flex max-w-[16rem] shrink-0 cursor-not-allowed items-start gap-2 opacity-60"
            title="Próximamente: sincronización con cuenta."
          >
            <input
              type="checkbox"
              className="mt-1 h-5 w-5 shrink-0"
              disabled
              checked={false}
              readOnly
              aria-disabled="true"
            />
            <span className="text-[0.88rem] leading-snug">
              <span className="font-semibold text-[#303030]">
                Usar info de base de datos
              </span>
              <span className="win98-muted block text-[0.82rem]">
                Por ahora solo datos locales.
              </span>
            </span>
          </label>
        </div>
        <ActivityContributionGrid
          usageLog={usage}
          fuelLog={fuel}
          maintenanceLog={maint}
          weeks={26}
        />
        <ActivityContributionLegend />
      </div>

      <div>
        <p className="win98-label">Últimos movimientos</p>
        {timeline.length === 0 ? (
          <p className="win98-muted m-0">Todavía no hay registros.</p>
        ) : (
          <ul className="win98-list">
            {timeline.map((r) => (
              <li key={r.id} className="win98-list-item">
                <strong>{formatDisplayAt(r.at)}</strong> — {r.title}
                {r.detail ? (
                  <div className="win98-muted">{r.detail}</div>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}
