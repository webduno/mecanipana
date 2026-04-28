"use client";

import { useMemo, useState } from "react";
import { appendUsage } from "@/lib/local-storage-data";

function toDatetimeLocalValue(d: Date) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

const KINDS = ["Viaje", "Trabajo", "Recado", "Otro"];

export function RegistroUsoScreen() {
  const now = useMemo(() => new Date(), []);
  const [at, setAt] = useState(toDatetimeLocalValue(now));
  const [kind, setKind] = useState(KINDS[0]!);
  const [odometerKm, setOdometerKm] = useState("");
  const [note, setNote] = useState("");
  const [ok, setOk] = useState<string | null>(null);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const iso = new Date(at).toISOString();
    appendUsage({ at: iso, kind, note: note.trim(), odometerKm: odometerKm.trim() });
    setOk("Guardado en este equipo.");
    setNote("");
    setOdometerKm("");
    setTimeout(() => setOk(null), 3500);
  }

  return (
    <>
      <p className="m-0 text-pretty">
        Anota un uso del carro: viaje al trabajo, recado, etc. Todo queda solo en este
        navegador.
      </p>
      <form onSubmit={onSubmit} className="win98-inset">
        <div className="win98-form-row">
          <label className="win98-label" htmlFor="uso-fecha">
            Fecha y hora
          </label>
          <input
            id="uso-fecha"
            className="win98-input"
            type="datetime-local"
            value={at}
            onChange={(e) => setAt(e.target.value)}
            required
          />
        </div>
        <div className="win98-form-row">
          <label className="win98-label" htmlFor="uso-tipo">
            Tipo
          </label>
          <select
            id="uso-tipo"
            className="win98-select"
            value={kind}
            onChange={(e) => setKind(e.target.value)}
          >
            {KINDS.map((k) => (
              <option key={k} value={k}>
                {k}
              </option>
            ))}
          </select>
        </div>
        <div className="win98-form-row">
          <label className="win98-label" htmlFor="uso-km">
            Kilometraje (opcional)
          </label>
          <input
            id="uso-km"
            className="win98-input"
            inputMode="decimal"
            autoComplete="off"
            value={odometerKm}
            onChange={(e) => setOdometerKm(e.target.value)}
            placeholder="ej. 125000"
          />
        </div>
        <div className="win98-form-row">
          <label className="win98-label" htmlFor="uso-nota">
            Nota
          </label>
          <textarea
            id="uso-nota"
            className="win98-textarea"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Destino, detalle, etc."
            maxLength={2000}
          />
        </div>
        <div className="win98-form-actions">
          <button type="submit" className="win98-btn win98-btn--accent-blue">
            Guardar uso
          </button>
        </div>
      </form>
      {ok ? <p className="win98-banner-ok">{ok}</p> : null}
    </>
  );
}
