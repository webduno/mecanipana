"use client";

import { useMemo, useState } from "react";
import { appendMaintenance, loadMaintenanceLog } from "@/lib/local-storage-data";

function toDatetimeLocalValue(d: Date) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
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
  const [what, setWhat] = useState("");
  const [note, setNote] = useState("");
  const [, bump] = useState(0);
  const recent = loadMaintenanceLog().slice(0, 12);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const iso = new Date(at).toISOString();
    appendMaintenance({
      at: iso,
      what: what.trim() || "Mantenimiento",
      note: note.trim(),
    });
    setWhat("");
    setNote("");
    bump((n) => n + 1);
  }

  return (
    <>
      <p className="m-0 text-pretty">
        Cambio de aceite, caucho, frenos, taller, etc.
      </p>
      <form onSubmit={onSubmit} className="win98-inset">
        <div className="win98-form-row">
          <label className="win98-label" htmlFor="mant-fecha">
            Fecha
          </label>
          <input
            id="mant-fecha"
            className="win98-input"
            type="datetime-local"
            value={at}
            onChange={(e) => setAt(e.target.value)}
            required
          />
        </div>
        <div className="win98-form-row">
          <label className="win98-label" htmlFor="mant-que">
            ¿Qué se hizo?
          </label>
          <input
            id="mant-que"
            className="win98-input"
            value={what}
            onChange={(e) => setWhat(e.target.value)}
            required
            placeholder="ej. Cambio de aceite"
            maxLength={500}
          />
        </div>
        <div className="win98-form-row">
          <label className="win98-label" htmlFor="mant-nota">
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
        <p className="win98-label">Últimos registros</p>
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
