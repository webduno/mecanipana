"use client";

import dynamic from "next/dynamic";
import { useCallback, useId, useState } from "react";
import { openStreetMapMarkerUrl } from "@/lib/osm";

export type LocationOsmValue = {
  locationLabel: string;
  locationLat: number | null;
  locationLon: number | null;
};

const LocationMapPicker = dynamic(
  () =>
    import("@/components/location-map-picker").then((m) => m.LocationMapPicker),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[min(16rem,45vh)] items-center justify-center border-2 border-[#808080] bg-[#f0f0f0] text-[0.9rem] text-[#505050]">
        Cargando mapa…
      </div>
    ),
  }
);

type Props = {
  idPrefix: string;
  value: LocationOsmValue;
  onChange: (v: LocationOsmValue) => void;
};

type SearchHit = { display_name: string; lat: number; lon: number };

export function LocationOsmField({ idPrefix, value, onChange }: Props) {
  const [searchDraft, setSearchDraft] = useState("");
  const [results, setResults] = useState<SearchHit[]>([]);
  const [loading, setLoading] = useState(false);
  const [reverseLoading, setReverseLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  const labelTextareaId = `${idPrefix}-label`;
  const mapInstrId = `${idPrefix}-map-instr`;
  const searchInputId = `${idPrefix}-search-q`;
  const searchRegionId = useId();

  const onSearch = useCallback(async () => {
    const q = searchDraft.trim();
    if (q.length < 2) {
      setSearchError("Escribe al menos 2 caracteres en la búsqueda.");
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
  }, [searchDraft]);

  async function handleMapClick(lat: number, lon: number) {
    setSearchError(null);
    onChange({
      ...value,
      locationLat: lat,
      locationLon: lon,
    });
    setReverseLoading(true);
    try {
      const res = await fetch(
        `/api/osm/reverse?lat=${encodeURIComponent(String(lat))}&lon=${encodeURIComponent(String(lon))}`,
        { credentials: "same-origin" }
      );
      const data = (await res.json()) as {
        ok?: boolean;
        display_name?: string;
      };
      if (res.ok && data.ok && typeof data.display_name === "string") {
        onChange({
          locationLabel: data.display_name.trim().slice(0, 500),
          locationLat: lat,
          locationLon: lon,
        });
        return;
      }
      onChange({
        locationLabel: `${lat.toFixed(5)}, ${lon.toFixed(5)}`,
        locationLat: lat,
        locationLon: lon,
      });
    } catch {
      onChange({
        locationLabel: `${lat.toFixed(5)}, ${lon.toFixed(5)}`,
        locationLat: lat,
        locationLon: lon,
      });
    } finally {
      setReverseLoading(false);
    }
  }

  function pickHit(hit: SearchHit) {
    onChange({
      locationLabel: hit.display_name.trim().slice(0, 500),
      locationLat: hit.lat,
      locationLon: hit.lon,
    });
    setResults([]);
    setSearchError(null);
    setSearchDraft("");
  }

  function clearLocation() {
    onChange({ locationLabel: "", locationLat: null, locationLon: null });
    setResults([]);
    setSearchError(null);
    setSearchDraft("");
  }

  const hasCoords =
    value.locationLat != null &&
    value.locationLon != null &&
    Number.isFinite(value.locationLat) &&
    Number.isFinite(value.locationLon);

  const hasAny =
    value.locationLabel.trim() !== "" ||
    value.locationLat != null ||
    value.locationLon != null;

  return (
    <div className="win98-form-row flex-col items-stretch sm:flex-row sm:items-start">
      <label className="win98-label shrink-0" htmlFor={labelTextareaId}>
        Ubicación (opcional)
      </label>
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <p id={mapInstrId} className="win98-muted m-0 text-[0.82rem] leading-snug">
          <strong>Elegir en el mapa:</strong> toca o haz clic donde esté el lugar. Luego
          puedes afinar el texto abajo.
        </p>
        <LocationMapPicker
          labelledBy={mapInstrId}
          lat={value.locationLat}
          lon={value.locationLon}
          onMapClick={handleMapClick}
        />
        {reverseLoading ? (
          <p className="m-0 text-[0.82rem] text-[#303030]" aria-live="polite">
            Buscando nombre del lugar…
          </p>
        ) : null}

        <label className="win98-label m-0" htmlFor={labelTextareaId}>
          Texto del lugar (editable)
        </label>
        <textarea
          id={labelTextareaId}
          className="win98-textarea"
          value={value.locationLabel}
          onChange={(e) =>
            onChange({
              ...value,
              locationLabel: e.target.value.slice(0, 500),
            })
          }
          placeholder="Se rellena al elegir en el mapa o al buscar; puedes editarlo."
          maxLength={500}
          rows={2}
        />

        <div className="flex flex-wrap items-center gap-2 border-t border-[#c0c0c0] pt-3">
          {(hasAny || searchDraft.trim()) ? (
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

        <div
          id={searchRegionId}
          className="mt-1 border border-[#b0b0b0] bg-[#f5f5f5] p-2"
          role="region"
          aria-label="Búsqueda alternativa por texto"
        >
          <p className="m-0 mb-2 text-[0.82rem] font-bold text-[#303030]">
            O buscar por texto
          </p>
          <div className="flex flex-wrap items-stretch gap-2">
            <input
              id={searchInputId}
              className="win98-input min-w-[10rem] flex-1"
              type="text"
              value={searchDraft}
              onChange={(e) => setSearchDraft(e.target.value)}
              placeholder="Dirección o nombre del lugar"
              maxLength={200}
              autoComplete="off"
            />
            <button
              type="button"
              className="win98-btn shrink-0"
              onClick={() => void onSearch()}
              disabled={loading}
            >
              {loading ? "Buscando…" : "Buscar"}
            </button>
          </div>
        </div>

        <p className="win98-muted m-0 text-[0.72rem] leading-snug">
          Mapa y datos ©{" "}
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
