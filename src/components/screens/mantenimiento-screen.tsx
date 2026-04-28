"use client";

import { useEffect, useMemo, useState } from "react";
import {
  IconCalendario,
  IconHistorial,
  IconMantenimiento,
  IconNota,
} from "@/components/grid-action-icons";
import {
  appendMaintenance,
  appendMaintenanceWhatCustom,
  loadMaintenanceLog,
  loadMaintenanceWhatCustom,
} from "@/lib/local-storage-data";

const PREDEFINED_MAINTENANCE_WHAT = [
  "Cambio de aceite",
  "Cambio de filtro de aceite",
  "Cambio de frenos",
  "Cambio de cauchos",
  "Alineación y balanceo",
  "Batería",
  "Revisión en taller",
] as const;

function toDatetimeLocalValue(d: Date) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

type DatePresetId =
  | "today"
  | "yesterday"
  | "lastWeek"
  | "last2Weeks"
  | "lastMonth"
  | "last3Months"
  | "custom";

const DATE_PRESET_OPTIONS: { id: DatePresetId; label: string }[] = [
  { id: "today", label: "Hoy" },
  { id: "yesterday", label: "Ayer" },
  { id: "lastWeek", label: "Hace 1 semana" },
  { id: "last2Weeks", label: "Hace 2 semanas" },
  { id: "lastMonth", label: "Hace 1 mes" },
  { id: "last3Months", label: "Hace 3 meses" },
  { id: "custom", label: "Otra fecha y hora…" },
];

function dateForPreset(id: Exclude<DatePresetId, "custom">): Date {
  const d = new Date();
  switch (id) {
    case "today":
      return d;
    case "yesterday":
      d.setDate(d.getDate() - 1);
      return d;
    case "lastWeek":
      d.setDate(d.getDate() - 7);
      return d;
    case "last2Weeks":
      d.setDate(d.getDate() - 14);
      return d;
    case "lastMonth":
      d.setMonth(d.getMonth() - 1);
      return d;
    case "last3Months":
      d.setMonth(d.getMonth() - 3);
      return d;
  }
}

function formatDisplayAt(iso: string) {
  try {
    const d = new Date(iso);
    return d.toLocaleString("es-VE", { dateStyle: "short", timeStyle: "short" });
  } catch {
    return iso;
  }
}

export function MantenimientoScreen() {
  const now = useMemo(() => new Date(), []);
  const [at, setAt] = useState(toDatetimeLocalValue(now));
  const [datePreset, setDatePreset] = useState<DatePresetId>("today");
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

  useEffect(() => {
    setCustomWhat(loadMaintenanceWhatCustom());
  }, []);

  useEffect(() => {
    if (!whatOptions.includes(what) && whatOptions[0]) {
      setWhat(whatOptions[0]!);
    }
  }, [whatOptions, what]);

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
    appendMaintenance({
      at: iso,
      what: what.trim() || "Mantenimiento",
      note: note.trim(),
    });
    setWhat(PREDEFINED_MAINTENANCE_WHAT[0]!);
    setNote("");
    bump((n) => n + 1);
  }

  function onDatePresetChange(id: DatePresetId) {
    if (id === "custom") {
      setDatePreset("custom");
      return;
    }
    setAt(toDatetimeLocalValue(dateForPreset(id)));
    setDatePreset(id);
  }

  return (
    <>
      <p className="m-0 text-pretty">
        Cambio de aceite, caucho, frenos, taller, etc.
      </p>
      <form onSubmit={onSubmit} className="win98-inset">
        <div className="win98-form-row">
          <label
            className="win98-label win98-label--with-icon"
            htmlFor="mant-fecha-preset"
          >
            <IconCalendario className="win98-label-icon" aria-hidden />
            Fecha
          </label>
          <select
            id="mant-fecha-preset"
            className="win98-select"
            value={datePreset}
            onChange={(e) => onDatePresetChange(e.target.value as DatePresetId)}
          >
            {DATE_PRESET_OPTIONS.map((opt) => (
              <option key={opt.id} value={opt.id}>
                {opt.label}
              </option>
            ))}
          </select>
          <input
            id="mant-fecha"
            className="win98-input"
            type="datetime-local"
            value={at}
            onChange={(e) => {
              setAt(e.target.value);
              setDatePreset("custom");
            }}
            required
            aria-label="Fecha y hora exacta"
          />
        </div>
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
              value={what}
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
                {r.note ? <div className="win98-muted">{r.note}</div> : null}
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}
