"use client";

import { useState } from "react";
import type { ReminderEntry } from "@/lib/mecanipana-types";
import {
  loadReminders,
  makeId,
  saveReminders,
} from "@/lib/local-storage-data";

function toDateInputValue(d: Date) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
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

export function RecordatoriosScreen() {
  const [items, setItems] = useState<ReminderEntry[]>(() => loadReminders());
  const [dueAt, setDueAt] = useState(toDateInputValue(new Date()));
  const [text, setText] = useState("");

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
    };
    persist([row, ...items]);
    setText("");
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

  return (
    <>
      <p className="m-0 text-pretty">
        Fechas importantes: revisión, papeles, repuesto pendiente, etc.
      </p>
      <form onSubmit={onAdd} className="win98-inset">
        <div className="win98-form-row">
          <label className="win98-label" htmlFor="rec-fecha">
            Fecha objetivo
          </label>
          <input
            id="rec-fecha"
            className="win98-input"
            type="date"
            value={dueAt}
            onChange={(e) => setDueAt(e.target.value)}
            required
          />
        </div>
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
    </>
  );
}
