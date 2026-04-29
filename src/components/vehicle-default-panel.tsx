"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import vehicleCatalog from "@/data/defaults/vehicle-catalog.json";
import { STORAGE_KEYS } from "@/lib/storage-keys";

function catalogDefaults() {
  const b = vehicleCatalog.brands[0];
  const m = b?.models[0];
  const v = m?.variants[0];
  const defaultLine = `${b?.name ?? ""} ${m?.name ?? ""}`.trim();
  const defaultVariant = v ? `${v.engine} · ${v.year}` : "";
  return { defaultLine, defaultVariant };
}

function catalogVehicleLines(): string[] {
  const out: string[] = [];
  for (const b of vehicleCatalog.brands) {
    for (const m of b.models) {
      out.push(`${b.name} ${m.name}`.trim());
    }
  }
  return out;
}

function catalogVariantLabels(): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const b of vehicleCatalog.brands) {
    for (const m of b.models) {
      for (const v of m.variants) {
        const label = `${v.engine} · ${v.year}`;
        if (seen.has(label)) continue;
        seen.add(label);
        out.push(label);
      }
    }
  }
  return out;
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

export function VehicleDefaultPanel() {
  const { defaultLine, defaultVariant } = useMemo(() => catalogDefaults(), []);
  const catalogLines = useMemo(() => catalogVehicleLines(), []);
  const catalogVarLabels = useMemo(() => catalogVariantLabels(), []);

  const [vehicleLines, setVehicleLines] = useState<string[]>(catalogLines);
  const [variantLabels, setVariantLabels] = useState<string[]>(catalogVarLabels);
  const [selectedLine, setSelectedLine] = useState(defaultLine);
  const [selectedVariant, setSelectedVariant] = useState(defaultVariant);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const extraLines = readJsonArray(STORAGE_KEYS.extraVehicleLines);
    const extraVariants = readJsonArray(STORAGE_KEYS.extraVariantLabels);

    const lines = mergeUnique(catalogLines, extraLines);
    const variants = mergeUnique(catalogVarLabels, extraVariants);

    setVehicleLines(lines);
    setVariantLabels(variants);

    const savedLine = window.localStorage.getItem(STORAGE_KEYS.selectedVehicleLine);
    const savedVariant = window.localStorage.getItem(STORAGE_KEYS.selectedVariant);
    setSelectedLine(savedLine && lines.includes(savedLine) ? savedLine : defaultLine);
    setSelectedVariant(
      savedVariant && variants.includes(savedVariant) ? savedVariant : defaultVariant
    );
    setHydrated(true);
  }, [catalogLines, catalogVarLabels, defaultLine, defaultVariant]);

  const persistLine = useCallback((line: string) => {
    window.localStorage.setItem(STORAGE_KEYS.selectedVehicleLine, line);
  }, []);

  const persistVariant = useCallback((v: string) => {
    window.localStorage.setItem(STORAGE_KEYS.selectedVariant, v);
  }, []);

  const addVehicleLine = useCallback(() => {
    const raw = window.prompt(
      "Nombre del vehículo (marca y modelo, ej. Fiat Siena):",
      ""
    );
    const next = raw?.trim();
    if (!next || catalogLines.includes(next)) return;
    const stored = readJsonArray(STORAGE_KEYS.extraVehicleLines);
    if (stored.includes(next)) return;

    const newExtras = [...stored, next];
    writeJsonArray(STORAGE_KEYS.extraVehicleLines, newExtras);
    setVehicleLines(mergeUnique(catalogLines, newExtras));
    setSelectedLine(next);
    persistLine(next);
  }, [catalogLines, persistLine]);

  const addVariant = useCallback(() => {
    const raw = window.prompt(
      "Motor y año (ej. 1.4 · 2008):",
      ""
    );
    const next = raw?.trim();
    if (!next || catalogVarLabels.includes(next)) return;
    const stored = readJsonArray(STORAGE_KEYS.extraVariantLabels);
    if (stored.includes(next)) return;

    const newExtras = [...stored, next];
    writeJsonArray(STORAGE_KEYS.extraVariantLabels, newExtras);
    setVariantLabels(mergeUnique(catalogVarLabels, newExtras));
    setSelectedVariant(next);
    persistVariant(next);
  }, [catalogVarLabels, persistVariant]);

  return (
    <div className="win98-inset win98-inset-vehicle">
      <div className="win98-field-group win98-field-group--vehicle">
        <div className="win98-field-head">
          <div className="win98-field-head-text">
            <label className="win98-field-label" htmlFor="vehiculo-defecto-linea">
              1 · Selecciona tu vehículo
            </label>
            <p className="win98-field-hint">
              Marca y modelo (ej. Fiat Siena). Aquí eliges cuál carro usas más.
            </p>
          </div>
          <button
            type="button"
            className="win98-btn-square win98-btn-square--vehicle"
            onClick={addVehicleLine}
            title="Añadir otro vehículo a la lista"
            aria-label="Añadir otro vehículo a la lista"
          >
            <span className="win98-btn-square-plus" aria-hidden>
              +
            </span>
            <span className="win98-btn-square-caption">Carro</span>
          </button>
        </div>
        <select
          id="vehiculo-defecto-linea"
          className="win98-select win98-select--vehicle"
          value={selectedLine}
          disabled={!hydrated}
          onChange={(e) => {
            const v = e.target.value;
            setSelectedLine(v);
            persistLine(v);
          }}
        >
          {vehicleLines.map((line) => (
            <option key={line} value={line}>
              {line}
            </option>
          ))}
        </select>
      </div>

      <div className="win98-field-group win98-field-group--motor">
        <div className="win98-field-head">
          <div className="win98-field-head-text">
            <label className="win98-field-label" htmlFor="vehiculo-defecto-version">
              2 · Selecciona el motor y año
            </label>
            <p className="win98-field-hint">
              Cilindraje y año (ej. 1.4 · 2008). Va aparte del nombre del carro.
            </p>
          </div>
          <button
            type="button"
            className="win98-btn-square win98-btn-square--motor"
            onClick={addVariant}
            title="Añadir otra versión motor · año"
            aria-label="Añadir otra versión motor · año"
          >
            <span className="win98-btn-square-plus" aria-hidden>
              +
            </span>
            <span className="win98-btn-square-caption">Motor</span>
          </button>
        </div>
        <select
          id="vehiculo-defecto-version"
          className="win98-select win98-select--motor"
          value={selectedVariant}
          disabled={!hydrated}
          onChange={(e) => {
            const v = e.target.value;
            setSelectedVariant(v);
            persistVariant(v);
          }}
        >
          {variantLabels.map((label) => (
            <option key={label} value={label}>
              {label}
            </option>
          ))}
        </select>
      </div>

      <div className="win98-vehicle-resumen-box">
        <p className="win98-vehicle-resumen-label">Combinación ahora</p>
        <p className="win98-vehicle-resumen" aria-live="polite">
          {selectedLine} {selectedVariant}
        </p>
      </div>
    </div>
  );
}
