"use client";

import Link from "next/link";
import type { ReminderEntry } from "@/lib/mecanipana-types";
import { IconNota } from "@/components/grid-action-icons";
import {
  ActivityContributionGrid,
  ActivityContributionLegend,
} from "@/components/activity-contribution-grid";
import { VehicleSetupGate } from "@/components/vehicle-setup-gate";
import {
  buildHistoryRows,
  formatContactOneLine,
  getMaintenanceSuggestionTiles,
  loadFuelLog,
  loadMaintenanceLog,
  loadReminders,
  loadUsageLog,
  readSelectedVehicle,
  type MaintenanceSuggestionTile,
} from "@/lib/local-storage-data";
import { openStreetMapMarkerUrl } from "@/lib/osm";

function formatDisplayAt(iso: string) {
  try {
    const d = new Date(iso);
    return d.toLocaleString("es-VE", { dateStyle: "short", timeStyle: "short" });
  } catch {
    return iso;
  }
}

function formatDueDay(iso: string) {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString("es-VE", {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

function startOfLocalDayMs(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
}

function dueBucket(dueIso: string): "overdue" | "today" | "upcoming" {
  const dueDay = startOfLocalDayMs(new Date(dueIso));
  const today = startOfLocalDayMs(new Date());
  if (dueDay < today) return "overdue";
  if (dueDay === today) return "today";
  return "upcoming";
}

function pendingRemindersSorted(list: ReminderEntry[]) {
  return list
    .filter((r) => !r.done)
    .sort((a, b) => new Date(a.dueAt).getTime() - new Date(b.dueAt).getTime());
}

function suggestionTileClass(tone: MaintenanceSuggestionTile["tone"]) {
  const base =
    "flex min-h-[5.25rem] flex-col items-center justify-center gap-0.5 rounded border-2 px-2 py-2.5 text-center no-underline outline-offset-2 transition-colors hover:opacity-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#303030]";
  if (tone === "attention") return `${base} border-[#b54545] bg-[#fff6f6]`;
  if (tone === "ok") return `${base} border-[#5a9e5a] bg-[#f3faf3]`;
  return `${base} border-dashed border-[#888] bg-[#f7f7f7]`;
}

export function ResumenScreen() {
  const vehicle = readSelectedVehicle();
  const usage = loadUsageLog();
  const fuel = loadFuelLog();
  const reminders = loadReminders();
  const upcoming = pendingRemindersSorted(reminders);
  const maint = loadMaintenanceLog();
  const suggestionTiles = getMaintenanceSuggestionTiles(maint, reminders);
  const timeline = buildHistoryRows().slice(0, 8);

  const onlyVehicleNoLogs =
    usage.length === 0 && fuel.length === 0 && maint.length === 0;

  return (
    <VehicleSetupGate>
      {onlyVehicleNoLogs ? (
        <Link
          href="/datos-vehiculo/cuestionario"
          className="win98-btn win98-btn--accent-amber mb-3 flex min-h-[3.25rem] w-full max-w-md items-center justify-center gap-3 text-[clamp(1rem,3.5vw,1.15rem)] font-extrabold no-underline"
          aria-label="Empezar el Quiz de estado del vehículo"
        >
          <IconNota className="h-7 w-7 shrink-0" aria-hidden />
          Empezar Quiz (8 preguntas)
        </Link>
      ) : null}
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
        <p className="win98-label m-0">Próximos mantenimientos</p>
        <p className="win98-muted m-0 mt-1 text-[0.88rem] leading-snug text-pretty">
          Fechas pendientes que registraste en{" "}
          <Link href="/recordatorios" className="font-semibold text-[#303030] underline underline-offset-2">
            Recordatorios
          </Link>
          {" "}(revisiones, papeles, repuestos…).
        </p>
        {upcoming.length === 0 ? (
          <p className="win98-muted m-2 mb-0 text-sm leading-snug">
            No hay recordatorios pendientes. Cuando añadas uno con fecha, aparecerá aquí ordenado
            por lo más próximo.
          </p>
        ) : (
          <ul className="win98-list m-2 mb-0">
            {upcoming.map((r) => {
              const bucket = dueBucket(r.dueAt);
              const tag =
                bucket === "overdue"
                  ? "Vencido"
                  : bucket === "today"
                    ? "Hoy"
                    : null;
              return (
                <li key={r.id} className="win98-list-item">
                  <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                    <strong className="shrink-0">{formatDueDay(r.dueAt)}</strong>
                    {tag ? (
                      <span
                        className={
                          bucket === "overdue"
                            ? "text-[0.72rem] font-extrabold uppercase tracking-wide text-[#8b0000]"
                            : "text-[0.72rem] font-extrabold uppercase tracking-wide text-[#006400]"
                        }
                      >
                        {tag}
                      </span>
                    ) : null}
                  </div>
                  <div className="text-pretty">{r.text}</div>
                  {r.estimatedCostBs.trim() ? (
                    <div className="win98-muted mt-1 text-[0.82rem] leading-snug">
                      ~ {r.estimatedCostBs.trim()} (estim.)
                    </div>
                  ) : null}
                  {r.contactId ? (
                    <div className="win98-muted mt-1 text-[0.82rem] leading-snug">
                      {formatContactOneLine(r.contactId) || "Contacto (sin datos en agenda)"}
                    </div>
                  ) : null}
                  {r.locationLabel.trim() ? (
                    <div className="win98-muted mt-1 text-[0.82rem] leading-snug">
                      {r.locationLabel.trim()}
                      {r.locationLat != null &&
                      r.locationLon != null &&
                      Number.isFinite(r.locationLat) &&
                      Number.isFinite(r.locationLon) ? (
                        <>
                          {" · "}
                          <a
                            className="font-semibold text-[#0000cc] underline underline-offset-2"
                            href={openStreetMapMarkerUrl(
                              r.locationLat,
                              r.locationLon
                            )}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            Mapa
                          </a>
                        </>
                      ) : null}
                    </div>
                  ) : null}
                </li>
              );
            })}
          </ul>
        )}
        <div className="m-2 mt-4 border-t border-[#c0c0c0] pt-4">
          <p className="win98-label m-0">Recordatorios sugeridos</p>
          <p className="win98-muted m-0 mt-1 text-[0.82rem] leading-snug">
            Resumen local: aceite ~3 meses; lo demás ~6. Papeles si hay palabra clave en recordatorios pendientes.
          </p>
          <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-2.5">
            {suggestionTiles.map((tile) => (
              <Link
                key={tile.id}
                href={tile.href}
                className={suggestionTileClass(tile.tone)}
                title="Abrir recordatorios"
              >
                <span className="text-[1.6rem] leading-none" aria-hidden>
                  {tile.emoji}
                </span>
                <span className="font-extrabold text-[#202020]">{tile.title}</span>
                <span className="win98-muted text-[0.72rem] font-semibold leading-snug">
                  {tile.subtitle}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div className="win98-inset">
        <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-start sm:justify-between">
          <div className="min-w-0 w-full sm:flex-1">
            <p className="win98-label m-0">Actividad por día</p>
            <p className="win98-muted m-0 mt-1 hidden max-w-none text-[0.88rem] leading-snug text-pretty sm:block">
              Cada cuadro es un día con datos de{" "}
              <strong>este equipo</strong>. 
            </p>
          </div>
          <label
            className="flex w-full cursor-not-allowed items-start gap-2 opacity-60 sm:w-auto sm:max-w-[16rem] sm:shrink-0"
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
    </VehicleSetupGate>
  );
}
