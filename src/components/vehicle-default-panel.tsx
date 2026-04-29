"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import vehicleCatalog from "@/data/defaults/vehicle-catalog.json";
import { STORAGE_KEYS } from "@/lib/storage-keys";

/** Marcas del catálogo ordenadas por nombre descendente en longitud (coincidencia tipo «Land Rover» antes que «Land»). */
const BRANDS_LONGEST_FIRST = [...vehicleCatalog.brands].sort(
  (a, b) => b.name.length - a.name.length || a.name.localeCompare(b.name)
);

function parseVehicleLine(line: string): { brand: string; model: string } {
  const trimmed = line.trim();
  if (!trimmed) return { brand: "", model: "" };
  for (const b of BRANDS_LONGEST_FIRST) {
    if (trimmed === b.name) return { brand: b.name, model: "" };
    const prefix = `${b.name} `;
    if (trimmed.startsWith(prefix)) {
      return { brand: b.name, model: trimmed.slice(prefix.length).trim() };
    }
  }
  const parts = trimmed.split(/\s+/);
  if (parts.length === 1) return { brand: parts[0]!, model: "" };
  return { brand: parts[0]!, model: parts.slice(1).join(" ") };
}

function formatVehicleLine(brand: string, model: string): string {
  const b = brand.trim();
  const m = model.trim();
  if (!b && !m) return "";
  if (!m) return b;
  return `${b} ${m}`;
}

function brandsFromVehicleLines(lines: string[]): string[] {
  const s = new Set<string>();
  for (const line of lines) {
    const { brand } = parseVehicleLine(line);
    if (brand) s.add(brand);
  }
  return [...s].sort((a, b) => a.localeCompare(b));
}

function modelsForBrand(lines: string[], brand: string): string[] {
  const m = new Set<string>();
  for (const line of lines) {
    const p = parseVehicleLine(line);
    if (p.brand === brand && p.model) m.add(p.model);
  }
  return [...m].sort((a, b) =>
    a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" })
  );
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

/** Etiqueta persistida: `motor · año` (ej. `1.4 · 2008`). */
function formatVariantLabel(engine: string, year: number): string {
  return `${engine} · ${year}`;
}

/** Años mostrados en el selector: desde aquí hasta el año civil actual (y años futuros si hay en catálogo/extras). */
const MIN_VEHICLE_YEAR = 1944;

function parseVariantLabel(label: string): { engine: string; year: number } | null {
  const parts = label.split(/\s*·\s*/).map((s) => s.trim());
  if (parts.length < 2) return null;
  const yearPart = parts[parts.length - 1]!;
  const year = Number.parseInt(yearPart, 10);
  if (!Number.isFinite(year) || year < 1900 || year > 2100) return null;
  const engine = parts.slice(0, -1).join(" · ");
  if (!engine) return null;
  return { engine, year };
}

function compareEngines(a: string, b: string): number {
  return a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" });
}

function sortVariantLabels(labels: string[]): string[] {
  return [...labels].sort((a, b) => {
    const pa = parseVariantLabel(a);
    const pb = parseVariantLabel(b);
    if (!pa && !pb) return a.localeCompare(b);
    if (!pa) return 1;
    if (!pb) return -1;
    if (pa.year !== pb.year) return pa.year - pb.year;
    return compareEngines(pa.engine, pb.engine);
  });
}

function catalogVariantLabels(): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const b of vehicleCatalog.brands) {
    for (const m of b.models) {
      for (const v of m.variants) {
        const label = formatVariantLabel(v.engine, v.year);
        if (seen.has(label)) continue;
        seen.add(label);
        out.push(label);
      }
    }
  }
  return sortVariantLabels(out);
}

function uniqueYearsFromLabels(labels: string[]): number[] {
  const ys = new Set<number>();
  for (const lab of labels) {
    const p = parseVariantLabel(lab);
    if (p) ys.add(p.year);
  }
  return [...ys].sort((x, y) => x - y);
}

/** 1944 … max(año actual del sistema, último año en lista); si hay variantes anteriores a 1944, el rango baja para incluirlas. */
function yearSelectRange(labels: string[]): number[] {
  const now = new Date().getFullYear();
  const variantYears = uniqueYearsFromLabels(labels);
  const maxCatalog =
    variantYears.length > 0 ? Math.max(...variantYears) : now;
  const maxY = Math.max(now, maxCatalog);
  const minCatalogLow =
    variantYears.length > 0 ? Math.min(...variantYears) : MIN_VEHICLE_YEAR;
  const minY = Math.min(MIN_VEHICLE_YEAR, minCatalogLow);
  const out: number[] = [];
  for (let y = minY; y <= maxY; y++) out.push(y);
  return out;
}

function enginesForYear(labels: string[], year: number): string[] {
  const engines = new Set<string>();
  for (const lab of labels) {
    const p = parseVariantLabel(lab);
    if (p && p.year === year) engines.add(p.engine);
  }
  return [...engines].sort(compareEngines);
}

function catalogDefaults() {
  const b = vehicleCatalog.brands[0];
  const m = b?.models[0];
  const v = m?.variants[0];
  const defaultLine = `${b?.name ?? ""} ${m?.name ?? ""}`.trim();
  const defaultVariant = v ? formatVariantLabel(v.engine, v.year) : "";
  return { defaultLine, defaultVariant };
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
    const variants = sortVariantLabels(mergeUnique(catalogVarLabels, extraVariants));

    setVehicleLines(lines);
    setVariantLabels(variants);

    const savedLine = window.localStorage.getItem(STORAGE_KEYS.selectedVehicleLine);
    const savedVariant = window.localStorage.getItem(STORAGE_KEYS.selectedVariant);

    const candidate =
      savedVariant && variants.includes(savedVariant) ? savedVariant : defaultVariant;
    const nextVariant = parseVariantLabel(candidate)
      ? candidate
      : (variants.find((v) => parseVariantLabel(v)) ?? defaultVariant);

    setSelectedLine(savedLine && lines.includes(savedLine) ? savedLine : defaultLine);
    setSelectedVariant(nextVariant);
    setHydrated(true);
  }, [catalogLines, catalogVarLabels, defaultLine, defaultVariant]);

  const persistLine = useCallback((line: string) => {
    window.localStorage.setItem(STORAGE_KEYS.selectedVehicleLine, line);
  }, []);

  const persistVariant = useCallback((v: string) => {
    window.localStorage.setItem(STORAGE_KEYS.selectedVariant, v);
  }, []);

  const parsedVehicle = useMemo(
    () => parseVehicleLine(selectedLine),
    [selectedLine]
  );

  const brandOptions = useMemo(
    () => brandsFromVehicleLines(vehicleLines),
    [vehicleLines]
  );

  const modelOptions = useMemo(
    () => modelsForBrand(vehicleLines, parsedVehicle.brand),
    [vehicleLines, parsedVehicle.brand]
  );

  const onBrandChange = useCallback(
    (brand: string) => {
      const ms = modelsForBrand(vehicleLines, brand);
      if (ms.length === 0) return;
      const prev = parseVehicleLine(selectedLine);
      const model =
        brand === prev.brand && ms.includes(prev.model) ? prev.model : ms[0]!;
      const line = formatVehicleLine(brand, model);
      setSelectedLine(line);
      persistLine(line);
    },
    [vehicleLines, selectedLine, persistLine]
  );

  const onModelChange = useCallback(
    (model: string) => {
      const { brand } = parseVehicleLine(selectedLine);
      if (!brand) return;
      const line = formatVehicleLine(brand, model);
      setSelectedLine(line);
      persistLine(line);
    },
    [selectedLine, persistLine]
  );

  const parsedVariant = useMemo(
    () => parseVariantLabel(selectedVariant),
    [selectedVariant]
  );

  const yearOptions = useMemo(
    () => yearSelectRange(variantLabels),
    [variantLabels]
  );

  const yearsWithVariants = useMemo(
    () => new Set(uniqueYearsFromLabels(variantLabels)),
    [variantLabels]
  );

  const motorOptions = useMemo(() => {
    if (!parsedVariant) return [];
    return enginesForYear(variantLabels, parsedVariant.year);
  }, [variantLabels, parsedVariant]);

  const onYearChange = useCallback(
    (yearStr: string) => {
      const year = Number.parseInt(yearStr, 10);
      if (!Number.isFinite(year)) return;
      const motors = enginesForYear(variantLabels, year);
      if (motors.length === 0) return;
      const prev = parseVariantLabel(selectedVariant);
      const engine =
        prev && prev.year === year && motors.includes(prev.engine)
          ? prev.engine
          : motors[0]!;
      const label = formatVariantLabel(engine, year);
      setSelectedVariant(label);
      persistVariant(label);
    },
    [variantLabels, selectedVariant, persistVariant]
  );

  const onMotorChange = useCallback(
    (engine: string) => {
      const p = parseVariantLabel(selectedVariant);
      if (!p) return;
      const label = formatVariantLabel(engine, p.year);
      setSelectedVariant(label);
      persistVariant(label);
    },
    [selectedVariant, persistVariant]
  );

  const addVehicleLine = useCallback(() => {
    const brandRaw = window.prompt("Marca (ej. Fiat):")?.trim();
    const modelRaw = window.prompt("Modelo (ej. Siena):")?.trim();
    if (!brandRaw || !modelRaw) return;
    const next = formatVehicleLine(brandRaw, modelRaw);
    if (!next) return;

    const stored = readJsonArray(STORAGE_KEYS.extraVehicleLines);
    if (catalogLines.includes(next) || stored.includes(next)) {
      setSelectedLine(next);
      persistLine(next);
      return;
    }

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
    if (!next) return;
    if (!parseVariantLabel(next)) {
      window.alert("Usa el formato: cilindraje · año (ej. 1.4 · 2008).");
      return;
    }

    const stored = readJsonArray(STORAGE_KEYS.extraVariantLabels);
    if (catalogVarLabels.includes(next) || stored.includes(next)) {
      setSelectedVariant(next);
      persistVariant(next);
      return;
    }

    const newExtras = [...stored, next];
    writeJsonArray(STORAGE_KEYS.extraVariantLabels, newExtras);
    setVariantLabels(sortVariantLabels(mergeUnique(catalogVarLabels, newExtras)));
    setSelectedVariant(next);
    persistVariant(next);
  }, [catalogVarLabels, persistVariant]);

  return (
    <div className="win98-inset win98-inset-vehicle">
      <div className="win98-field-group win98-field-group--vehicle">
        <div className="win98-field-head">
          <div className="win98-field-head-text">
            <p className="win98-field-label" id="vehiculo-defecto-vehiculo-grupo">
              1 · Marca y modelo
            </p>
            <p className="win98-field-hint">
              Dos listas: marca (ej. Fiat) y modelo (ej. Siena). La combinación se guarda como una sola línea.
            </p>
          </div>
          <button
            type="button"
            className="win98-btn-square win98-btn-square--vehicle"
            onClick={addVehicleLine}
            title="Añadir otro vehículo (marca y modelo)"
            aria-label="Añadir otro vehículo marca y modelo"
          >
            <span className="win98-btn-square-plus" aria-hidden>
              +
            </span>
            <span className="win98-btn-square-caption">Carro</span>
          </button>
        </div>
        <div
          role="group"
          aria-labelledby="vehiculo-defecto-vehiculo-grupo"
          className="flex w-full min-w-0 flex-row flex-nowrap gap-2"
        >
          <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-0.5">
            <label
              className="text-[0.72rem] font-extrabold leading-tight tracking-wide text-[#505050]"
              htmlFor="vehiculo-defecto-marca"
            >
              Marca
            </label>
            <select
              id="vehiculo-defecto-marca"
              className="win98-select win98-select--vehicle min-w-0 flex-1"
              value={
                brandOptions.includes(parsedVehicle.brand)
                  ? parsedVehicle.brand
                  : (brandOptions[0] ?? "")
              }
              disabled={!hydrated || brandOptions.length === 0}
              onChange={(e) => onBrandChange(e.target.value)}
            >
              {brandOptions.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-0.5">
            <label
              className="text-[0.72rem] font-extrabold leading-tight tracking-wide text-[#505050]"
              htmlFor="vehiculo-defecto-modelo"
            >
              Modelo
            </label>
            <select
              id="vehiculo-defecto-modelo"
              className="win98-select win98-select--vehicle min-w-0 flex-1"
              value={
                modelOptions.includes(parsedVehicle.model)
                  ? parsedVehicle.model
                  : (modelOptions[0] ?? "")
              }
              disabled={
                !hydrated || modelOptions.length === 0 || !parsedVehicle.brand
              }
              onChange={(e) => onModelChange(e.target.value)}
            >
              {modelOptions.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="win98-field-group win98-field-group--motor">
        <div className="win98-field-head">
          <div className="win98-field-head-text">
            <p className="win98-field-label" id="vehiculo-defecto-motor-grupo">
              2 · Selecciona el año y el motor
            </p>
            <p className="win98-field-hint">
              Años desde {MIN_VEHICLE_YEAR} hasta el año actual; primero el año y luego el cilindraje (ej.
              2008 y 1.4). Va aparte del nombre del carro.
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
        <div
          role="group"
          aria-labelledby="vehiculo-defecto-motor-grupo"
          className="flex w-full min-w-0 flex-row flex-nowrap gap-2"
        >
          <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-0.5">
            <label
              className="text-[0.72rem] font-extrabold leading-tight tracking-wide text-[#505050]"
              htmlFor="vehiculo-defecto-anio"
            >
              Año
            </label>
            <select
              id="vehiculo-defecto-anio"
              className="win98-select win98-select--motor min-w-0 flex-1"
              value={parsedVariant ? String(parsedVariant.year) : ""}
              disabled={!hydrated || yearOptions.length === 0}
              onChange={(e) => onYearChange(e.target.value)}
            >
              {yearOptions.map((y) => (
                <option
                  key={y}
                  value={String(y)}
                  disabled={!yearsWithVariants.has(y)}
                >
                  {y}
                </option>
              ))}
            </select>
          </div>
          <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-0.5">
            <label
              className="text-[0.72rem] font-extrabold leading-tight tracking-wide text-[#505050]"
              htmlFor="vehiculo-defecto-motor-select"
            >
              Motor
            </label>
            <select
              id="vehiculo-defecto-motor-select"
              className="win98-select win98-select--motor min-w-0 flex-1"
              value={parsedVariant?.engine ?? ""}
              disabled={!hydrated || motorOptions.length === 0 || !parsedVariant}
              onChange={(e) => onMotorChange(e.target.value)}
            >
              {motorOptions.map((eng) => (
                <option key={eng} value={eng}>
                  {eng}
                </option>
              ))}
            </select>
          </div>
        </div>
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
