"use client";

import { useCallback, useEffect, useState } from "react";
import usageNotePresets from "@/data/defaults/usage-note-presets.json";
import { urgenciaFromForm, type UrgenciaPreset, UrgenciaField } from "@/components/urgencia-field";
import { useToast } from "@/components/toast-provider";
import { appendUsage } from "@/lib/local-storage-data";
import { pushUsageEntryRemote } from "@/lib/remote/sync-log-entries-remote";
import { STORAGE_KEYS } from "@/lib/storage-keys";

const NOTE_MAX = 2000;
const CATALOG_PRESETS = usageNotePresets.presets;

function toDatetimeLocalValue(d: Date) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function mergeUnique(base: string[], extra: string[]) {
  const inBase = new Set(base);
  return [...base, ...extra.filter((x) => !inBase.has(x))];
}

function readJsonArray(key: string): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((x): x is string => typeof x === "string" && x.trim() !== "");
  } catch {
    return [];
  }
}

function writeJsonArray(key: string, value: string[]) {
  window.localStorage.setItem(key, JSON.stringify(value));
}

function appendToNote(prev: string, addition: string, maxLen: number) {
  const a = addition.trim();
  if (!a) return prev.slice(0, maxLen);
  const p = prev.trim();
  const next = p ? `${p}\n${a}` : a;
  return next.slice(0, maxLen);
}

const KINDS = ["Viaje", "Trabajo", "Recado", "Otro"];

export function RegistroUsoScreen() {
  const { showToast } = useToast();
  const [urgenciaPreset, setUrgenciaPreset] = useState<UrgenciaPreset>("50");
  const [urgenciaCustom, setUrgenciaCustom] = useState(50);
  const [at, setAt] = useState(() => toDatetimeLocalValue(new Date()));
  const [kind, setKind] = useState(KINDS[0]!);
  const [odometerKm, setOdometerKm] = useState("");
  const [note, setNote] = useState("");
  const [phrases, setPhrases] = useState<string[]>(() => [...CATALOG_PRESETS]);
  const [hydrated, setHydrated] = useState(false);
  const [phrasePick, setPhrasePick] = useState("");

  useEffect(() => {
    queueMicrotask(() => {
      const extra = readJsonArray(STORAGE_KEYS.extraUsageNotePresets);
      setPhrases(mergeUnique([...CATALOG_PRESETS], extra));
      setHydrated(true);
    });
  }, []);

  const addCustomPreset = useCallback(() => {
    const raw = window.prompt("Frase nueva para la lista (ej. ir al gimnasio):", "");
    const next = raw?.trim();
    if (!next) return;
    if (phrases.includes(next)) return;

    const stored = readJsonArray(STORAGE_KEYS.extraUsageNotePresets);
    if (stored.includes(next)) return;

    const newExtras = [...stored, next];
    writeJsonArray(STORAGE_KEYS.extraUsageNotePresets, newExtras);
    setPhrases(mergeUnique([...CATALOG_PRESETS], newExtras));
  }, [phrases]);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const iso = new Date(at).toISOString();
    const row = appendUsage({
      urgencia: urgenciaFromForm(urgenciaPreset, urgenciaCustom),
      at: iso,
      kind,
      note: note.trim(),
      odometerKm: odometerKm.trim(),
    });
    void pushUsageEntryRemote(row);
    showToast("Guardado en este equipo.");
    setNote("");
    setOdometerKm("");
  }

  return (
    <>
      <p className="m-0 text-pretty">
        Anota un uso del carro: viaje al trabajo, recado, etc. Todo queda solo en este
        navegador.
      </p>
      <form onSubmit={onSubmit} className="win98-inset">
        <UrgenciaField
          id="uso-urgencia"
          preset={urgenciaPreset}
          custom={urgenciaCustom}
          onPreset={setUrgenciaPreset}
          onCustom={setUrgenciaCustom}
        />
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
          <div className="win98-field-head">
            <label className="win98-label m-0 win98-field-head-text" htmlFor="uso-nota">
              Nota
            </label>
            <div className="flex max-w-full flex-wrap items-center justify-end gap-1.5">
              <select
                id="uso-nota-frases"
                className="win98-select min-h-[2.65rem] max-w-[min(100%,13rem)] shrink-0 text-[0.95rem]"
                disabled={!hydrated}
                value={phrasePick}
                aria-label="Insertar frase predefinida en la nota"
                title="Elegir una frase y agregarla al texto"
                onChange={(e) => {
                  const v = e.target.value;
                  if (!v) return;
                  setNote((prev) => appendToNote(prev, v, NOTE_MAX));
                  setPhrasePick("");
                }}
              >
                <option value="">Frases rápidas</option>
                {phrases.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
              <button
                type="button"
                className="win98-btn-square win98-btn-square--vehicle shrink-0"
                onClick={addCustomPreset}
                title="Guardar una frase nueva en este equipo"
                aria-label="Guardar una frase nueva en este equipo para usar después"
              >
                <span className="win98-btn-square-plus" aria-hidden>
                  +
                </span>
                <span className="win98-btn-square-caption">Frase</span>
              </button>
            </div>
          </div>
          <textarea
            id="uso-nota"
            className="win98-textarea"
            value={note}
            onChange={(e) => setNote(e.target.value.slice(0, NOTE_MAX))}
            placeholder="Destino, detalle, etc."
            maxLength={NOTE_MAX}
          />
        </div>
        <div className="win98-form-actions">
          <button type="submit" className="win98-btn win98-btn--accent-blue">
            Guardar uso
          </button>
        </div>
      </form>
    </>
  );
}
