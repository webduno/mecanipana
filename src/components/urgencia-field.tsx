"use client";

export type UrgenciaPreset = "75" | "50" | "25" | "custom";

export function urgenciaFromForm(
  preset: UrgenciaPreset,
  customRaw: number | string
): number {
  if (preset !== "custom") return Number(preset);
  const n =
    typeof customRaw === "number"
      ? customRaw
      : Number(String(customRaw).trim().replace(",", "."));
  if (!Number.isFinite(n)) return 50;
  return Math.min(100, Math.max(1, Math.round(n)));
}

type UrgenciaFieldProps = {
  id: string;
  label?: string;
  preset: UrgenciaPreset;
  custom: number;
  onPreset: (p: UrgenciaPreset) => void;
  onCustom: (n: number) => void;
};

/** Campo principal de prioridad 1–100 (para tablero por orden). */
export function UrgenciaField({
  id,
  label = "Urgencia",
  preset,
  custom,
  onPreset,
  onCustom,
}: UrgenciaFieldProps) {
  return (
    <div className="win98-form-row">
      <label className="win98-label" htmlFor={id}>
        {label}
      </label>
      <select
        id={id}
        className="win98-select"
        value={preset}
        onChange={(e) => onPreset(e.target.value as UrgenciaPreset)}
        required
      >
        <option value="75">Urgente (75)</option>
        <option value="50">Importante (50)</option>
        <option value="25">Pendiente (25)</option>
        <option value="custom">Personalizado</option>
      </select>
      {preset === "custom" ? (
        <input
          id={`${id}-custom`}
          className="win98-input box-border max-w-[10rem]"
          type="number"
          inputMode="numeric"
          min={1}
          max={100}
          autoComplete="off"
          aria-label={`${label}: valor entre 1 y 100`}
          value={custom}
          onChange={(e) => {
            const v = Number(e.target.value);
            if (!Number.isFinite(v)) {
              onCustom(custom);
              return;
            }
            onCustom(Math.min(100, Math.max(1, Math.round(v))));
          }}
          required={preset === "custom"}
        />
      ) : null}
      {preset === "custom" ? (
        <span className="win98-muted text-[clamp(0.85rem,2.9vw,0.98rem)]">
          Número del 1 al 100 para ordenar después en tableros.
        </span>
      ) : null}
    </div>
  );
}
