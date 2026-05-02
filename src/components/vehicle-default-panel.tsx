"use client";

import { useCallback, useEffect, useId, useMemo, useState } from "react";
import vehicleCatalog from "@/data/defaults/vehicle-catalog.json";
import { STORAGE_KEYS } from "@/lib/storage-keys";
import { formatVariantLabel, parseVariantLabel } from "@/lib/vehicle-variant-parse";

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

/** Años mostrados en el selector: desde aquí hasta el año civil actual (y años futuros si hay en catálogo/extras). */
const MIN_VEHICLE_YEAR = 1944;

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
  for (let y = maxY; y >= minY; y--) out.push(y);
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

type VehicleDefaultPanelProps = {
  /** Llamado tras guardar marca/modelo/motor con éxito (p. ej. cerrar el modal). */
  onAfterSave?: () => void;
};

export function VehicleDefaultPanel({ onAfterSave }: VehicleDefaultPanelProps) {
  const catalogLines = useMemo(() => catalogVehicleLines(), []);
  const catalogVarLabels = useMemo(() => catalogVariantLabels(), []);

  const [vehicleLines, setVehicleLines] = useState<string[]>(catalogLines);
  const [variantLabels, setVariantLabels] = useState<string[]>(catalogVarLabels);
  const [selectedLine, setSelectedLine] = useState("");
  const [selectedVariant, setSelectedVariant] = useState("");
  /** Coincide con localStorage tras «Guardar» (no con cada cambio del select). */
  const [committedLine, setCommittedLine] = useState("");
  const [committedVariant, setCommittedVariant] = useState("");
  const [hydrated, setHydrated] = useState(false);
  /** Formularios inline: `window.prompt` falla mucho en móvil (Safari/PWA). */
  const [addCarroOpen, setAddCarroOpen] = useState(false);
  const [addMotorOpen, setAddMotorOpen] = useState(false);
  const [draftBrand, setDraftBrand] = useState("");
  const [draftModel, setDraftModel] = useState("");
  const [carroDraftError, setCarroDraftError] = useState("");
  const [draftVariantLabel, setDraftVariantLabel] = useState("");
  const [variantDraftError, setVariantDraftError] = useState("");
  const extrasFormId = useId();
  const extrasLabelCls =
    "text-[0.72rem] font-extrabold leading-tight tracking-wide text-[#505050]";
  useEffect(() => {
    const extraLines = readJsonArray(STORAGE_KEYS.extraVehicleLines);
    const extraVariants = readJsonArray(STORAGE_KEYS.extraVariantLabels);

    const lines = mergeUnique(catalogLines, extraLines);
    const variants = sortVariantLabels(mergeUnique(catalogVarLabels, extraVariants));

    setVehicleLines(lines);
    setVariantLabels(variants);

    const savedLine = window.localStorage.getItem(STORAGE_KEYS.selectedVehicleLine);
    const savedVariant = window.localStorage.getItem(STORAGE_KEYS.selectedVariant);

    const nextLine =
      savedLine && lines.includes(savedLine) ? savedLine : "";

    const variantCandidate =
      savedVariant && variants.includes(savedVariant) ? savedVariant : "";
    const nextVariant =
      variantCandidate && parseVariantLabel(variantCandidate)
        ? variantCandidate
        : "";

    setSelectedLine(nextLine);
    setSelectedVariant(nextVariant);
    setCommittedLine(nextLine);
    setCommittedVariant(nextVariant);

    setHydrated(true);
  }, [catalogLines, catalogVarLabels]);

  const persistLine = useCallback((line: string) => {
    window.localStorage.setItem(STORAGE_KEYS.selectedVehicleLine, line);
    window.dispatchEvent(new CustomEvent("mecanipana:vehicle"));
  }, []);

  const persistVariant = useCallback((v: string) => {
    window.localStorage.setItem(STORAGE_KEYS.selectedVariant, v);
    window.dispatchEvent(new CustomEvent("mecanipana:vehicle"));
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
      if (!brand.trim()) return;
      const ms = modelsForBrand(vehicleLines, brand);
      if (ms.length === 0) return;
      const prev = parseVehicleLine(selectedLine);
      const model =
        brand === prev.brand && ms.includes(prev.model) ? prev.model : ms[0]!;
      const line = formatVehicleLine(brand, model);
      setSelectedLine(line);
    },
    [vehicleLines, selectedLine]
  );

  const onModelChange = useCallback(
    (model: string) => {
      if (!model.trim()) return;
      const { brand } = parseVehicleLine(selectedLine);
      if (!brand) return;
      const line = formatVehicleLine(brand, model);
      setSelectedLine(line);
    },
    [selectedLine]
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
    },
    [variantLabels, selectedVariant]
  );

  const onMotorChange = useCallback(
    (engine: string) => {
      if (!engine.trim()) return;
      const p = parseVariantLabel(selectedVariant);
      if (!p) return;
      const label = formatVariantLabel(engine, p.year);
      setSelectedVariant(label);
    },
    [selectedVariant]
  );

  const selectionDirty =
    selectedLine !== committedLine || selectedVariant !== committedVariant;

  const canSaveSelection =
    selectedLine.trim() !== "" && parseVariantLabel(selectedVariant) !== null;

  const saveVehicleSelection = useCallback(() => {
    if (!canSaveSelection) return;
    persistLine(selectedLine);
    persistVariant(selectedVariant);
    setCommittedLine(selectedLine);
    setCommittedVariant(selectedVariant);
    onAfterSave?.();
  }, [
    canSaveSelection,
    selectedLine,
    selectedVariant,
    persistLine,
    persistVariant,
    onAfterSave,
  ]);

  const cancelVehicleSelection = useCallback(() => {
    setSelectedLine(committedLine);
    setSelectedVariant(committedVariant);
  }, [committedLine, committedVariant]);

  const selectionSavedSuccess =
    !selectionDirty &&
    committedLine.trim() !== "" &&
    parseVariantLabel(committedVariant) !== null;

  const confirmAddVehicleLine = useCallback(() => {
    setCarroDraftError("");
    const brandTrim = draftBrand.trim();
    const modelTrim = draftModel.trim();
    if (!brandTrim || !modelTrim) {
      setCarroDraftError("Escribe marca y modelo.");
      return;
    }
    const next = formatVehicleLine(brandTrim, modelTrim);
    if (!next) return;

    const stored = readJsonArray(STORAGE_KEYS.extraVehicleLines);
    if (catalogLines.includes(next) || stored.includes(next)) {
      setSelectedLine(next);
      setAddCarroOpen(false);
      setDraftBrand("");
      setDraftModel("");
      return;
    }

    const newExtras = [...stored, next];
    writeJsonArray(STORAGE_KEYS.extraVehicleLines, newExtras);
    setVehicleLines(mergeUnique(catalogLines, newExtras));
    setSelectedLine(next);
    setAddCarroOpen(false);
    setDraftBrand("");
    setDraftModel("");
  }, [catalogLines, draftBrand, draftModel]);

  const cancelAddVehicleLine = useCallback(() => {
    setAddCarroOpen(false);
    setDraftBrand("");
    setDraftModel("");
    setCarroDraftError("");
  }, []);

  const confirmAddVariant = useCallback(() => {
    setVariantDraftError("");
    const next = draftVariantLabel.trim();
    if (!next) {
      setVariantDraftError("Escribe cilindraje y año.");
      return;
    }
    if (!parseVariantLabel(next)) {
      setVariantDraftError("Usa el formato: cilindraje · año (ej. 1.4 · 2008).");
      return;
    }

    const stored = readJsonArray(STORAGE_KEYS.extraVariantLabels);
    if (catalogVarLabels.includes(next) || stored.includes(next)) {
      setSelectedVariant(next);
      setAddMotorOpen(false);
      setDraftVariantLabel("");
      return;
    }

    const newExtras = [...stored, next];
    writeJsonArray(STORAGE_KEYS.extraVariantLabels, newExtras);
    setVariantLabels(sortVariantLabels(mergeUnique(catalogVarLabels, newExtras)));
    setSelectedVariant(next);
    setAddMotorOpen(false);
    setDraftVariantLabel("");
  }, [catalogVarLabels, draftVariantLabel]);

  const cancelAddVariant = useCallback(() => {
    setAddMotorOpen(false);
    setDraftVariantLabel("");
    setVariantDraftError("");
  }, []);
  return (
    <div className="win98-inset win98-inset-vehicle">
      <div className="win98-field-group win98-field-group--vehicle">
        <div className="win98-field-head">
          <div className="win98-field-head-text">
            <p className="win98-field-label" id="vehiculo-defecto-vehiculo-grupo">
              1 · Marca y modelo
            </p>
          </div>
          <button
            type="button"
            className="win98-btn-square win98-btn-square--vehicle"
            aria-expanded={addCarroOpen}
            onClick={() => {
              setAddMotorOpen(false);
              setVariantDraftError("");
              setAddCarroOpen((prev) => {
                const next = !prev;
                if (next) {
                  setCarroDraftError("");
                } else {
                  setDraftBrand("");
                  setDraftModel("");
                  setCarroDraftError("");
                }
                return next;
              });
            }}
            title="Añadir combinación marca y modelo fuera del catálogo"
            aria-label="Añadir combinación marca y modelo fuera del catálogo"
          >
            <span className="win98-btn-square-plus" aria-hidden>
              +
            </span>
            <span className="win98-btn-square-caption">Carro</span>
          </button>
        </div>
        {addCarroOpen ? (
          <div className="mb-3 rounded-sm border-2 border-[#808080] bg-white p-3 shadow-[inset_1px_1px_0_#fff,inset_-1px_-1px_0_#404040]">
            <p className="m-0 text-[0.88rem] font-semibold text-[#000080]" id={`${extrasFormId}-carro-leg`}>
              Nuevo marca + modelo
            </p>
            <form
              className="mt-2 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-end"
              onSubmit={(e) => {
                e.preventDefault();
                confirmAddVehicleLine();
              }}
            >
              <div className="min-w-[8rem] flex-1 space-y-0.5">
                <label className={extrasLabelCls} htmlFor={`${extrasFormId}-brand`}>
                  Marca nueva
                </label>
                <input
                  id={`${extrasFormId}-brand`}
                  className="win98-input w-full"
                  autoComplete="off"
                  placeholder="Ej. Toyota"
                  value={draftBrand}
                  onChange={(e) => setDraftBrand(e.target.value)}
                />
              </div>
              <div className="min-w-[8rem] flex-1 space-y-0.5">
                <label className={extrasLabelCls} htmlFor={`${extrasFormId}-model`}>
                  Modelo
                </label>
                <input
                  id={`${extrasFormId}-model`}
                  className="win98-input w-full"
                  autoComplete="off"
                  placeholder="Ej. Corolla"
                  value={draftModel}
                  onChange={(e) => setDraftModel(e.target.value)}
                />
              </div>
              <div className="flex flex-wrap gap-2 pb-0.5">
                <button type="submit" className="win98-btn shrink-0">
                  Añadir a la lista
                </button>
                <button type="button" className="win98-btn shrink-0" onClick={cancelAddVehicleLine}>
                  Cerrar
                </button>
              </div>
            </form>
            {carroDraftError !== "" ? (
              <p className="win98-muted m-0 mt-2 text-[0.85rem] text-[#800000]" role="alert">
                {carroDraftError}
              </p>
            ) : null}
          </div>
        ) : null}
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
                parsedVehicle.brand && brandOptions.includes(parsedVehicle.brand)
                  ? parsedVehicle.brand
                  : ""
              }
              disabled={!hydrated || brandOptions.length === 0}
              onChange={(e) => onBrandChange(e.target.value)}
            >
              <option value="">— Elige marca —</option>
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
                parsedVehicle.model && modelOptions.includes(parsedVehicle.model)
                  ? parsedVehicle.model
                  : ""
              }
              disabled={
                !hydrated || modelOptions.length === 0 || !parsedVehicle.brand
              }
              onChange={(e) => onModelChange(e.target.value)}
            >
              <option value="">
                {parsedVehicle.brand ? "— Elige modelo —" : "— Marca primero —"}
              </option>
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
          </div>
          <button
            type="button"
            className="win98-btn-square win98-btn-square--motor"
            aria-expanded={addMotorOpen}
            onClick={() => {
              setAddCarroOpen(false);
              setCarroDraftError("");
              setAddMotorOpen((prev) => {
                const next = !prev;
                if (next) setVariantDraftError("");
                else {
                  setDraftVariantLabel("");
                  setVariantDraftError("");
                }
                return next;
              });
            }}
            title="Añadir cilindraje · año fuera del catálogo"
            aria-label="Añadir combinación cilindraje y año fuera del catálogo"
          >
            <span className="win98-btn-square-plus" aria-hidden>
              +
            </span>
            <span className="win98-btn-square-caption">Motor</span>
          </button>
        </div>
        {addMotorOpen ? (
          <div className="mb-3 rounded-sm border-2 border-[#808080] bg-white p-3 shadow-[inset_1px_1px_0_#fff,inset_-1px_-1px_0_#404040]">
            <p className="m-0 text-[0.88rem] font-semibold text-[#000080]" id={`${extrasFormId}-motor-leg`}>
              Nuevo motor · año
            </p>
            <form
              className="mt-2 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end"
              onSubmit={(e) => {
                e.preventDefault();
                confirmAddVariant();
              }}
            >
              <div className="min-w-0 flex-[1_1_12rem] space-y-0.5">
                <label className={extrasLabelCls} htmlFor={`${extrasFormId}-variant-all`}>
                  Texto único <span className="font-normal lowercase">cilindraje</span>
                  {" · "}
                  <span className="font-normal lowercase">año</span>
                </label>
                <input
                  id={`${extrasFormId}-variant-all`}
                  className="win98-input w-full font-mono"
                  autoComplete="off"
                  placeholder="1.4 · 2008"
                  value={draftVariantLabel}
                  onChange={(e) => setDraftVariantLabel(e.target.value)}
                  maxLength={80}
                  aria-describedby={
                    variantDraftError !== "" ? `${extrasFormId}-motor-err` : undefined
                  }
                />
              </div>
              <div className="flex flex-wrap gap-2 pb-0.5">
                <button type="submit" className="win98-btn shrink-0">
                  Añadir a la lista
                </button>
                <button
                  type="button"
                  className="win98-btn shrink-0"
                  onClick={() => cancelAddVariant()}
                >
                  Cerrar
                </button>
              </div>
            </form>
            {variantDraftError !== "" ? (
              <p
                className="win98-muted m-0 mt-2 text-[0.85rem] text-[#800000]"
                id={`${extrasFormId}-motor-err`}
                role="alert"
              >
                {variantDraftError}
              </p>
            ) : null}
          </div>
        ) : null}
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
              {!parsedVariant ? <option value="">— Elige año —</option> : null}
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
              value={
                parsedVariant?.engine &&
                motorOptions.includes(parsedVariant.engine)
                  ? parsedVariant.engine
                  : ""
              }
              disabled={!hydrated || motorOptions.length === 0 || !parsedVariant}
              onChange={(e) => onMotorChange(e.target.value)}
            >
              {motorOptions.length > 0 ? (
                <option value="">— Elige cilindraje —</option>
              ) : (
                <option value="">
                  {!parsedVariant ? "(elige año arriba)" : "Sin motores"}
                </option>
              )}
              {motorOptions.map((eng) => (
                <option key={eng} value={eng}>
                  {eng}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {selectionDirty ? (
        <div className="flex flex-wrap justify-end gap-2 pt-1">
          <button
            type="button"
            className="win98-btn !w-auto shrink-0 px-4 py-2 min-h-0"
            disabled={!canSaveSelection}
            onClick={saveVehicleSelection}
          >
            <span className="font-semibold text-[#006400]">Guardar</span>
          </button>
          <button
            type="button"
            className="win98-btn !w-auto shrink-0 px-4 py-2 min-h-0"
            onClick={cancelVehicleSelection}
          >
            Cancelar
          </button>
        </div>
      ) : null}

      <div
        className={
          selectionSavedSuccess
            ? "win98-vehicle-resumen-box win98-vehicle-resumen-box--saved"
            : "win98-vehicle-resumen-box"
        }
      >
        <p className="win98-vehicle-resumen-label">Carro seleccionado</p>
        <p className="win98-vehicle-resumen" aria-live="polite">
          {[selectedLine.trim(), selectedVariant.trim()].filter(Boolean).join(" ") ||
            "— Todavía no elegiste carro ni versión —"}
        </p>
      </div>
    </div>
  );
}
