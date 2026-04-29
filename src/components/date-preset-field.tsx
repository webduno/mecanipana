"use client";

import { useCallback, useState, type ReactNode } from "react";

export function toDatetimeLocalValue(d: Date) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export type DatePresetId =
  | "today"
  | "yesterday"
  | "lastWeek"
  | "last2Weeks"
  | "lastMonth"
  | "last3Months"
  | "custom";

export const DATE_PRESET_OPTIONS: { id: DatePresetId; label: string }[] = [
  { id: "today", label: "Hoy" },
  { id: "yesterday", label: "Ayer" },
  { id: "lastWeek", label: "Hace 1 semana" },
  { id: "last2Weeks", label: "Hace 2 semanas" },
  { id: "lastMonth", label: "Hace 1 mes" },
  { id: "last3Months", label: "Hace 3 meses" },
  { id: "custom", label: "Otra fecha y hora…" },
];

export function dateForPreset(id: Exclude<DatePresetId, "custom">): Date {
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

/** Estado + handlers para combinar select de atajo con `datetime-local` (Mantenimiento, Combustible, etc.). */
export function useDatePresetState(initialDate: Date = new Date()) {
  const [at, setAt] = useState(() => toDatetimeLocalValue(initialDate));
  const [datePreset, setDatePreset] = useState<DatePresetId>("today");

  const onDatePresetChange = useCallback((id: DatePresetId) => {
    if (id === "custom") {
      setDatePreset("custom");
      return;
    }
    setAt(toDatetimeLocalValue(dateForPreset(id)));
    setDatePreset(id);
  }, []);

  const onDatetimeChange = useCallback((value: string) => {
    setAt(value);
    setDatePreset("custom");
  }, []);

  return {
    at,
    setAt,
    datePreset,
    setDatePreset,
    onDatePresetChange,
    onDatetimeChange,
  };
}

export type DatePresetFieldProps = {
  presetSelectId: string;
  datetimeId: string;
  /** Contenido del `<label>` (texto o texto + ícono). */
  label: ReactNode;
  /** Por defecto `win98-label`; usar `win98-label win98-label--with-icon` si incluyes ícono. */
  labelClassName?: string;
  at: string;
  datePreset: DatePresetId;
  onDatePresetChange: (id: DatePresetId) => void;
  onDatetimeChange: (value: string) => void;
};

export function DatePresetField({
  presetSelectId,
  datetimeId,
  label,
  labelClassName = "win98-label",
  at,
  datePreset,
  onDatePresetChange,
  onDatetimeChange,
}: DatePresetFieldProps) {
  return (
    <div className="win98-form-row">
      <label className={labelClassName} htmlFor={presetSelectId}>
        {label}
      </label>
      <select
        id={presetSelectId}
        className="win98-select"
        value={datePreset}
        onChange={(e) =>
          onDatePresetChange(e.target.value as DatePresetId)
        }
      >
        {DATE_PRESET_OPTIONS.map((opt) => (
          <option key={opt.id} value={opt.id}>
            {opt.label}
          </option>
        ))}
      </select>
      <input
        id={datetimeId}
        className="win98-input"
        type="datetime-local"
        value={at}
        onChange={(e) => onDatetimeChange(e.target.value)}
        required
        aria-label="Fecha y hora exacta"
      />
    </div>
  );
}
