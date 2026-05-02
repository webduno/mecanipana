"use client";

import { useCallback, useState } from "react";
import { openStreetMapMarkerUrl } from "@/lib/osm";

export type LocationOsmValue = {
  locationLabel: string;
  locationLat: number | null;
  locationLon: number | null;
};

type Props = {
  idPrefix: string;
  value: LocationOsmValue;
  onChange: (v: LocationOsmValue) => void;
};

type SearchHit = { display_name: string; lat: number; lon: number };

export function LocationOsmField({ idPrefix, value, onChange }: Props) {
  const [results, setResults] = useState<SearchHit[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  const inputId = `${idPrefix}-label`;
  const searchLabelId = `${idPrefix}-search-status`;

  const onSearch = useCallback(async () => {
    const q = value.locationLabel.trim();
    if (q.length < 2) {
      setSearchError("Escribe al menos 2 caracteres.");
      setResults([]);
      return;
    }
    setSearchError(null);
    setLoading(true);
    setResults([]);
    try {
      const res = await fetch(
        `/api/osm/search?q=${encodeURIComponent(q.slice(0, 200))}`,
        { credentials: "same-origin" }
      );
      const data = (await res.json()) as {
        ok?: boolean;
        results?: SearchHit[];
        error?: string;
      };
      if (!res.ok || !data.ok) {
        setSearchError("No se pudo buscar. Intenta de nuevo.");
        return;
      }
      setResults(Array.isArray(data.results) ? data.results : []);
      if (!data.results?.length) {
        setSearchError("Sin resultados. Prueba otra redacción.");
      }
    } catch {
      setSearchError("Error de red.");
    } finally {
      setLoading(false);
    }
  }, [value.locationLabel]);

  function pickHit(hit: SearchHit) {
    onChange({
      locationLabel: hit.display_name,
      locationLat: hit.lat,
      locationLon: hit.lon,
    });
    setResults([]);
    setSearchError(null);
  }

  function clearLocation() {
    onChange({ locationLabel: "", locationLat: null, locationLon: null });
    setResults([]);
    setSearchError(null);
  }

  const hasCoords =
    value.locationLat != null &&
    value.locationLon != null &&
    Number.isFinite(value.locationLat) &&
    Number.isFinite(value.locationLon);

  return (
    <div className="win98-form-row flex-col items-stretch sm:flex-row sm:items-start">
      <label className="win98-label shrink-0" htmlFor={inputId}>
        Ubicación (opcional)
      </label>
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <textarea
          id={inputId}
          className="win98-textarea"
          value={value.locationLabel}
          onChange={(e) =>
            onChange({
              ...value,
              locationLabel: e.target.value,
              locationLat: null,
              locationLon: null,
            })
          }
          placeholder="Taller, dirección o lugar — «Buscar en mapa» para enlazar en OpenStreetMap"
          maxLength={500}
          rows={2}
          aria-describedby={searchLabelId}
        />
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            className="win98-btn"
            onClick={() => void onSearch()}
            disabled={loading}
          >
            {loading ? "Buscando…" : "Buscar en mapa"}
          </button>
          {(value.locationLabel.trim() ||
            value.locationLat != null ||
            value.locationLon != null) ? (
            <button type="button" className="win98-btn" onClick={clearLocation}>
              Quitar ubicación
            </button>
          ) : null}
          {hasCoords ? (
            <a
              className="text-[0.88rem] font-semibold text-[#0000cc] underline underline-offset-2"
              href={openStreetMapMarkerUrl(value.locationLat!, value.locationLon!)}
              target="_blank"
              rel="noopener noreferrer"
            >
              Ver en OpenStreetMap
            </a>
          ) : null}
        </div>
        <p id={searchLabelId} className="win98-muted m-0 text-[0.72rem] leading-snug">
          Datos de lugares ©{" "}
          <a
            href="https://www.openstreetmap.org/copyright"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#0000cc] underline underline-offset-2"
          >
            OpenStreetMap
          </a>{" "}
          colaboradores.
        </p>
        {searchError ? (
          <p className="m-0 text-[0.82rem] text-[#8b0000]" role="alert">
            {searchError}
          </p>
        ) : null}
        {results.length > 0 ? (
          <ul className="win98-list m-0 max-h-48 overflow-auto border border-[#808080] bg-[#fff] p-0">
            {results.map((hit, i) => (
              <li key={`${hit.lat}-${hit.lon}-${i}`} className="win98-list-item">
                <button
                  type="button"
                  className="w-full cursor-pointer bg-transparent p-1 text-left text-[0.9rem] leading-snug hover:bg-[#000080] hover:text-white"
                  onClick={() => pickHit(hit)}
                >
                  {hit.display_name}
                </button>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </div>
  );
}
