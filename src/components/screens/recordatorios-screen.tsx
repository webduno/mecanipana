"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import type { ReminderEntry } from "@/lib/mecanipana-types";
import { VehicleSetupGate } from "@/components/vehicle-setup-gate";
import { ContactPickerField } from "@/components/contact-picker-field";
import { LocationOsmField, type LocationOsmValue } from "@/components/location-osm-field";
import {
  dateForFuturePreset,
  FutureDatePresetField,
  toDateInputValue,
  useFutureDatePresetState,
} from "@/components/date-preset-field";
import {
  formatContactOneLine,
  loadReminders,
  makeId,
  saveReminders,
} from "@/lib/local-storage-data";
import { openStreetMapMarkerUrl } from "@/lib/osm";
import { pushReminderEntryRemote } from "@/lib/remote/sync-log-entries-remote";

/** Si la URL solo trae `tema`, prellenamos con el mismo rótulo que en Resumen */
const TEXTO_POR_TEMA: Record<string, string> = {
  caucho: "Cauchos",
  freno: "Frenos",
  bateria: "Batería",
  refrigerante: "Refrigerante",
  filtro: "Filtros",
  papeles: "Papeles",
  luces: "Luces",
  vidrios: "Vidrios",
  aceite: "Aceite",
};

/** Día de la semana legible para `YYYY-MM-DD` (mediodía local, es-VE). */
function weekdayFromDateInputValue(yyyyMmDd: string): string {
  if (!yyyyMmDd || !/^\d{4}-\d{2}-\d{2}$/.test(yyyyMmDd)) return "";
  const d = new Date(`${yyyyMmDd}T12:00:00`);
  if (Number.isNaN(d.getTime())) return "";
  const w = d.toLocaleDateString("es-VE", { weekday: "long" });
  return w ? w.charAt(0).toUpperCase() + w.slice(1) : "";
}

function formatDue(iso: string) {
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

function RecordatoriosScreenInner() {
  const searchParams = useSearchParams();
  const [items, setItems] = useState<ReminderEntry[]>(() => loadReminders());
  const {
    dueDate: dueAt,
    setDueDate: setDueAt,
    datePreset: dueDatePreset,
    setDatePreset: setDueDatePreset,
    onDatePresetChange: onDueDatePresetChange,
    onDateChange: onDueDateChange,
  } = useFutureDatePresetState("nextWeek");
  const [text, setText] = useState("");
  const [location, setLocation] = useState<LocationOsmValue>({
    locationLabel: "",
    locationLat: null,
    locationLon: null,
  });
  const [estimatedCostBs, setEstimatedCostBs] = useState("");
  const [contactId, setContactId] = useState<string | null>(null);

  const qsKey = searchParams.toString();

  useEffect(() => {
    const textoParam = searchParams.get("texto")?.trim();
    const temaParam = searchParams.get("tema")?.trim();
    const fromTema =
      temaParam && TEXTO_POR_TEMA[temaParam] ? TEXTO_POR_TEMA[temaParam] : "";
    const prefill =
      textoParam && textoParam.length > 0 ? textoParam : fromTema;
    if (prefill) setText(prefill);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- `qsKey` refleja cambios de URL sin depender de la referencia de `searchParams`.
  }, [qsKey]);

  function persist(next: ReminderEntry[]) {
    saveReminders(next);
    setItems(next);
  }

  function onAdd(e: React.FormEvent) {
    e.preventDefault();
    const t = text.trim();
    if (!t) return;
    const day = new Date(`${dueAt}T12:00:00`);
    const row: ReminderEntry = {
      id: makeId(),
      dueAt: day.toISOString(),
      text: t,
      done: false,
      locationLabel: location.locationLabel.trim().slice(0, 500),
      locationLat: location.locationLat,
      locationLon: location.locationLon,
      estimatedCostBs: estimatedCostBs.trim().slice(0, 64),
      contactId,
    };
    persist([row, ...items]);
    void pushReminderEntryRemote(row);
    setText("");
    setEstimatedCostBs("");
    setContactId(null);
    setLocation({ locationLabel: "", locationLat: null, locationLon: null });
    setDueDatePreset("nextWeek");
    setDueAt(toDateInputValue(dateForFuturePreset("nextWeek")));
  }

  function toggle(id: string) {
    persist(
      items.map((x) => (x.id === id ? { ...x, done: !x.done } : x))
    );
  }

  function remove(id: string) {
    if (!window.confirm("¿Quitar este recordatorio?")) return;
    persist(items.filter((x) => x.id !== id));
  }

  const dueWeekdayLabel = weekdayFromDateInputValue(dueAt);

  return (
    <VehicleSetupGate>
      <p className="m-0 text-pretty">
        Añade un recordatorio para un mantenimiento en específico.
      </p>
      <form onSubmit={onAdd} className="win98-inset">
        <FutureDatePresetField
          presetSelectId="rec-fecha-preset"
          dateInputId="rec-fecha"
          label="Fecha objetivo"
          dueDate={dueAt}
          datePreset={dueDatePreset}
          onDatePresetChange={onDueDatePresetChange}
          onDateChange={onDueDateChange}
          footer={
            dueWeekdayLabel ? (
              <span
                className="win98-muted text-[0.82rem] leading-snug"
                aria-live="polite"
              >
                {dueWeekdayLabel}
              </span>
            ) : null
          }
        />
        <div className="win98-form-row">
          <label className="win98-label" htmlFor="rec-texto">
            Texto
          </label>
          <textarea
            id="rec-texto"
            className="win98-textarea"
            value={text}
            onChange={(e) => setText(e.target.value)}
            required
            placeholder="ej. Vencer póliza"
            maxLength={2000}
          />
        </div>
        <div className="win98-form-row">
          <label className="win98-label" htmlFor="rec-costo">
            Costo estimado
          </label>
          <input
            id="rec-costo"
            className="win98-input"
            type="text"
            inputMode="text"
            value={estimatedCostBs}
            onChange={(e) => setEstimatedCostBs(e.target.value)}
            placeholder="Opcional — ej. 80 $ · 1200 Bs"
            maxLength={64}
            autoComplete="off"
          />
        </div>
        <ContactPickerField idPrefix="rec" value={contactId} onChange={setContactId} />
        <LocationOsmField idPrefix="rec-loc" value={location} onChange={setLocation} />
        <div className="win98-form-actions">
          <button type="submit" className="win98-btn win98-btn--accent-blue">
            Añadir
          </button>
        </div>
      </form>

      {items.length === 0 ? (
        <p className="win98-muted m-0">No hay recordatorios.</p>
      ) : (
        <ul className="win98-list">
          {items.map((r) => (
            <li key={r.id} className="win98-list-item">
              <label className="flex cursor-pointer flex-wrap items-start gap-2">
                <input
                  type="checkbox"
                  className="mt-1 h-5 w-5 shrink-0"
                  checked={r.done}
                  onChange={() => toggle(r.id)}
                />
                <span className="min-w-0">
                  <strong>{formatDue(r.dueAt)}</strong>
                  <div className={r.done ? "line-through opacity-70" : ""}>
                    {r.text}
                  </div>
                  {r.estimatedCostBs.trim() ? (
                    <div
                      className={
                        r.done
                          ? "win98-muted mt-0.5 text-[0.82rem] line-through opacity-70"
                          : "win98-muted mt-0.5 text-[0.82rem]"
                      }
                    >
                      ~ {r.estimatedCostBs.trim()} (estim.)
                    </div>
                  ) : null}
                  {r.contactId ? (
                    <div
                      className={
                        r.done
                          ? "win98-muted mt-0.5 text-[0.82rem] line-through opacity-70"
                          : "win98-muted mt-0.5 text-[0.82rem]"
                      }
                    >
                      {formatContactOneLine(r.contactId) || "Contacto (sin datos en agenda)"}
                    </div>
                  ) : null}
                  {r.locationLabel.trim() ? (
                    <div
                      className={
                        r.done
                          ? "win98-muted mt-0.5 text-[0.82rem] line-through opacity-70"
                          : "win98-muted mt-0.5 text-[0.82rem]"
                      }
                    >
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
                            onClick={(e) => e.stopPropagation()}
                          >
                            Mapa
                          </a>
                        </>
                      ) : null}
                    </div>
                  ) : null}
                </span>
              </label>
              <div className="win98-form-actions mt-2">
                <button
                  type="button"
                  className="win98-btn"
                  onClick={() => remove(r.id)}
                >
                  Quitar
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </VehicleSetupGate>
  );
}

export function RecordatoriosScreen() {
  return (
    <Suspense fallback={<p className="win98-muted m-0">Cargando…</p>}>
      <RecordatoriosScreenInner />
    </Suspense>
  );
}
