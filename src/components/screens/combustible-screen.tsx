"use client";

import { useMemo, useState } from "react";
import { appendFuel, loadFuelLog } from "@/lib/local-storage-data";

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

export function CombustibleScreen() {
  const now = useMemo(() => new Date(), []);
  const [at, setAt] = useState(toDatetimeLocalValue(now));
  const [liters, setLiters] = useState("");
  const [amountBs, setAmountBs] = useState("");
  const [note, setNote] = useState("");
  const [, bump] = useState(0);
  const recent = loadFuelLog().slice(0, 12);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const iso = new Date(at).toISOString();
    appendFuel({
      at: iso,
      liters: liters.trim(),
      amountBs: amountBs.trim(),
      note: note.trim(),
    });
    setLiters("");
    setAmountBs("");
    setNote("");
    bump((n) => n + 1);
  }

  return (
    <>
      <p className="m-0 text-pretty">
        Registra cada vez que echas gasolina o gas. Monto en bolívares (Bs) como tú lo
        tengas a mano.
      </p>
      <form onSubmit={onSubmit} className="win98-inset">
        <div className="win98-form-row">
          <label className="win98-label" htmlFor="comb-fecha">
            Fecha y hora
          </label>
          <input
            id="comb-fecha"
            className="win98-input"
            type="datetime-local"
            value={at}
            onChange={(e) => setAt(e.target.value)}
            required
          />
        </div>
        <div className="win98-form-row">
          <label className="win98-label" htmlFor="comb-litros">
            Litros
          </label>
          <input
            id="comb-litros"
            className="win98-input"
            inputMode="decimal"
            value={liters}
            onChange={(e) => setLiters(e.target.value)}
            required
            placeholder="ej. 40"
          />
        </div>
        <div className="win98-form-row">
          <label className="win98-label" htmlFor="comb-bs">
            Monto (Bs)
          </label>
          <input
            id="comb-bs"
            className="win98-input"
            inputMode="decimal"
            value={amountBs}
            onChange={(e) => setAmountBs(e.target.value)}
            placeholder="opcional"
          />
        </div>
        <div className="win98-form-row">
          <label className="win98-label" htmlFor="comb-nota">
            Nota
          </label>
          <textarea
            id="comb-nota"
            className="win98-textarea"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Estación, octanaje, etc."
            maxLength={2000}
          />
        </div>
        <div className="win98-form-actions">
          <button type="submit" className="win98-btn win98-btn--accent-blue">
            Guardar carga
          </button>
        </div>
      </form>

      <div>
        <p className="win98-label">Últimas cargas</p>
        {recent.length === 0 ? (
          <p className="win98-muted m-0">Todavía no hay registros.</p>
        ) : (
          <ul className="win98-list">
            {recent.map((r) => (
              <li key={r.id} className="win98-list-item">
                <strong>{formatDisplayAt(r.at)}</strong>
                <div className="win98-muted">
                  {[r.liters && `${r.liters} L`, r.amountBs && `${r.amountBs} Bs`, r.note]
                    .filter(Boolean)
                    .join(" · ") || "—"}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}
