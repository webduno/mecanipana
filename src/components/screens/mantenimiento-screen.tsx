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
  formatContactOneLine,
  loadMaintenanceLog,
  loadMaintenanceWhatCustom,
} from "@/lib/local-storage-data";
import { openStreetMapMarkerUrl } from "@/lib/osm";
import { pushMaintenanceEntryRemote } from "@/lib/remote/sync-log-entries-remote";
import { DatePresetField, useDatePresetState } from "@/components/date-preset-field";
import { LocationOsmField, type LocationOsmValue } from "@/components/location-osm-field";
import { ContactPickerField } from "@/components/contact-picker-field";
import { VehicleSetupGate } from "@/components/vehicle-setup-gate";

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
  const [paidBs, setPaidBs] = useState("");
  const [location, setLocation] = useState<LocationOsmValue>({
    locationLabel: "",
    locationLat: null,
    locationLon: null,
  });
  const [contactId, setContactId] = useState<string | null>(null);
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
      locationLabel: location.locationLabel.trim().slice(0, 500),
      locationLat: location.locationLat,
      locationLon: location.locationLon,
      paidBs: paidBs.trim().slice(0, 64),
      contactId,
    });
    void pushMaintenanceEntryRemote(row);
    setWhat(PREDEFINED_MAINTENANCE_WHAT[0]!);
    setNote("");
    setPaidBs("");
    setContactId(null);
    setLocation({ locationLabel: "", locationLat: null, locationLon: null });
    bump((n) => n + 1);
    showToast("Guardado en este equipo.");
  }

  return (
    <VehicleSetupGate>
      <p className="m-0 text-pretty">
        Registra un mantenimiento realizado.
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
        <div className="win98-form-row">
          <label className="win98-label" htmlFor="mant-pago">
            Pagado
          </label>
          <input
            id="mant-pago"
            className="win98-input"
            type="text"
            inputMode="text"
            value={paidBs}
            onChange={(e) => setPaidBs(e.target.value)}
            placeholder="Opcional — monto y moneda (ej. 45 $ · 900)"
            maxLength={64}
            autoComplete="off"
          />
        </div>
        <ContactPickerField idPrefix="mant" value={contactId} onChange={setContactId} />
        <LocationOsmField idPrefix="mant-loc" value={location} onChange={setLocation} />
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
                  {r.paidBs.trim() ? ` · pagado ${r.paidBs.trim()}` : ""}
                  {r.locationLabel.trim()
                    ? ` · ${r.locationLabel.trim()}`
                    : ""}
                </div>
                {r.contactId ? (
                  <div className="win98-muted text-[0.82rem] leading-snug">
                    {formatContactOneLine(r.contactId) || "Contacto (sin datos en agenda)"}
                  </div>
                ) : null}
                {r.locationLat != null &&
                r.locationLon != null &&
                Number.isFinite(r.locationLat) &&
                Number.isFinite(r.locationLon) ? (
                  <a
                    className="inline-block text-[0.82rem] font-semibold text-[#0000cc] underline underline-offset-2"
                    href={openStreetMapMarkerUrl(r.locationLat, r.locationLon)}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Ver en OpenStreetMap
                  </a>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </div>
    </VehicleSetupGate>
  );
}
