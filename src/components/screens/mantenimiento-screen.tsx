"use client";

import { useEffect, useMemo, useState } from "react";
import {
  IconCalendario,
  IconHistorial,
  IconMantenimiento,
  IconNota,
} from "@/components/grid-action-icons";
import {
  type UrgenciaPreset,
  urgenciaFromForm,
  UrgenciaField,
} from "@/components/urgencia-field";
import { useToast } from "@/components/toast-provider";
import {
  appendMaintenance,
  appendMaintenanceWhatCustom,
  loadMaintenanceLog,
  loadMaintenanceWhatCustom,
} from "@/lib/local-storage-data";
import { pushMaintenanceEntryRemote } from "@/lib/remote/sync-log-entries-remote";
import { DatePresetField, useDatePresetState } from "@/components/date-preset-field";

const PREDEFINED_MAINTENANCE_WHAT = [
  "Cambio de aceite",
  "Cambio de filtro de aceite",
  "Cambio de frenos",
  "Cambio de cauchos",
  "Alineación y balanceo",
  "Batería",
  "Revisión en taller",
] as const;

function formatDisplayAt(iso: string) {
  try {
    const d = new Date(iso);
    return d.toLocaleString("es-VE", { dateStyle: "short", timeStyle: "short" });
  } catch {
    return iso;
  }
}

export function MantenimientoScreen() {
  const { showToast } = useToast();
  const now = useMemo(() => new Date(), []);
  const [urgenciaPreset, setUrgenciaPreset] = useState<UrgenciaPreset>("50");
  const [urgenciaCustom, setUrgenciaCustom] = useState(50);
  const { at, datePreset, onDatePresetChange, onDatetimeChange } =
    useDatePresetState(now);
  const [customWhat, setCustomWhat] = useState<string[]>([]);
  const [what, setWhat] = useState<string>(PREDEFINED_MAINTENANCE_WHAT[0]!);
  const [note, setNote] = useState("");
  const [, bump] = useState(0);
  const recent = loadMaintenanceLog().slice(0, 12);

  const whatOptions = useMemo(() => {
    const seen = new Set<string>();
    const out: string[] = [];
    for (const label of [...PREDEFINED_MAINTENANCE_WHAT, ...customWhat]) {
      const key = label.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      out.push(label);
    }
    return out;
  }, [customWhat]);

  const whatForSelect = useMemo(
    () => (whatOptions.includes(what) ? what : (whatOptions[0] ?? "")),
    [whatOptions, what]
  );

  useEffect(() => {
    queueMicrotask(() => {
      setCustomWhat(loadMaintenanceWhatCustom());
    });
  }, []);

  function addCustomWhat() {
    const raw = window.prompt("¿Qué mantenimiento quieres añadir a la lista?", "");
    const trimmed = raw?.trim();
    if (!trimmed) return;
    if (whatOptions.some((x) => x.toLowerCase() === trimmed.toLowerCase())) return;
    const next = appendMaintenanceWhatCustom(trimmed);
    setCustomWhat(next);
    setWhat(trimmed);
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const iso = new Date(at).toISOString();
    const whatSaved =
      (whatOptions.includes(what) ? what : whatOptions[0] ?? "").trim() || "Mantenimiento";
    const row = appendMaintenance({
      urgencia: urgenciaFromForm(urgenciaPreset, urgenciaCustom),
      at: iso,
      what: whatSaved,
      note: note.trim(),
    });
    void pushMaintenanceEntryRemote(row);
    setWhat(PREDEFINED_MAINTENANCE_WHAT[0]!);
    setNote("");
    bump((n) => n + 1);
    showToast("Guardado en este equipo.");
  }

  return (
    <>
      <p className="m-0 text-pretty">
        Cambio de aceite, caucho, frenos, taller, etc.
      </p>
      <form onSubmit={onSubmit} className="win98-inset">
        <UrgenciaField
          id="mant-urgencia"
          preset={urgenciaPreset}
          custom={urgenciaCustom}
          onPreset={setUrgenciaPreset}
          onCustom={setUrgenciaCustom}
        />
        <DatePresetField
          presetSelectId="mant-fecha-preset"
          datetimeId="mant-fecha"
          labelClassName="win98-label win98-label--with-icon"
          label={
            <>
              <IconCalendario className="win98-label-icon" aria-hidden />
              Fecha
            </>
          }
          at={at}
          datePreset={datePreset}
          onDatePresetChange={onDatePresetChange}
          onDatetimeChange={onDatetimeChange}
        />
        <div className="win98-form-row">
          <label className="win98-label win98-label--with-icon" htmlFor="mant-que">
            <IconMantenimiento className="win98-label-icon" aria-hidden />
            ¿Qué se hizo?
          </label>
          <div
            style={{
              display: "flex",
              gap: "0.5rem",
              alignItems: "stretch",
            }}
          >
            <select
              id="mant-que"
              className="win98-select"
              style={{ flex: 1, minWidth: 0 }}
              value={whatForSelect}
              onChange={(e) => setWhat(e.target.value)}
              required
            >
              {whatOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
            <button
              type="button"
              className="win98-btn-square"
              onClick={addCustomWhat}
              aria-label="Añadir tipo de mantenimiento personalizado"
              title="Añadir opción"
            >
              <span className="win98-btn-square-plus" aria-hidden>
                +
              </span>
            </button>
          </div>
        </div>
        <div className="win98-form-row">
          <label className="win98-label win98-label--with-icon" htmlFor="mant-nota">
            <IconNota className="win98-label-icon" aria-hidden />
            Nota
          </label>
          <textarea
            id="mant-nota"
            className="win98-textarea"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Taller, repuestos, etc."
            maxLength={2000}
          />
        </div>
        <div className="win98-form-actions">
          <button type="submit" className="win98-btn win98-btn--accent-blue">
            Guardar
          </button>
        </div>
      </form>

      <div>
        <p className="win98-label win98-label--with-icon mb-1 mt-0">
          <IconHistorial className="win98-label-icon" aria-hidden />
          Últimos registros
        </p>
        {recent.length === 0 ? (
          <p className="win98-muted m-0">Todavía no hay registros.</p>
        ) : (
          <ul className="win98-list">
            {recent.map((r) => (
              <li key={r.id} className="win98-list-item">
                <strong>{formatDisplayAt(r.at)}</strong> — {r.what}
                <div className="win98-muted">
                  Urg. {r.urgencia}
                  {r.note ? ` · ${r.note}` : ""}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}
