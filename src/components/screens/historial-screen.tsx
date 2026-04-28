"use client";

import type { HistoryRow } from "@/lib/mecanipana-types";
import { buildHistoryRows } from "@/lib/local-storage-data";

function formatDisplayAt(iso: string) {
  try {
    const d = new Date(iso);
    return d.toLocaleString("es-VE", { dateStyle: "short", timeStyle: "short" });
  } catch {
    return iso;
  }
}

function badgeClass(kind: HistoryRow["kind"]) {
  if (kind === "uso") return "win98-badge win98-badge--uso";
  if (kind === "combustible") return "win98-badge win98-badge--combustible";
  return "win98-badge win98-badge--mantenimiento";
}

function badgeLabel(kind: HistoryRow["kind"]) {
  if (kind === "uso") return "Uso";
  if (kind === "combustible") return "Gas";
  return "Taller";
}

export function HistorialScreen() {
  const rows = buildHistoryRows();

  return (
    <>
      <p className="m-0 text-pretty">
        Lista mezclada por fecha: usos del carro, gasolina y mantenimiento.
      </p>
      {rows.length === 0 ? (
        <p className="win98-inset m-0">Todavía no hay nada guardado.</p>
      ) : (
        <ul className="win98-list">
          {rows.map((r) => (
            <li key={r.id} className="win98-list-item">
              <span className={badgeClass(r.kind)}>{badgeLabel(r.kind)}</span>
              <strong>{formatDisplayAt(r.at)}</strong>
              <div className="win98-muted">
                <strong>{r.title}</strong>
                {r.detail ? ` — ${r.detail}` : ""}
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
