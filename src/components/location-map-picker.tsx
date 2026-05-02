"use client";

import { useEffect } from "react";
import L from "leaflet";
import { MapContainer, Marker, TileLayer, useMap, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";

/** Centro visible por defecto (Venezuela / Caracas). */
const DEFAULT_CENTER: [number, number] = [10.48, -66.9036];
const DEFAULT_ZOOM_NO_POINT = 6;
const DEFAULT_ZOOM_WITH_POINT = 15;

function useLeafletIconFix() {
  useEffect(() => {
    const proto = L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown };
    delete proto._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl:
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
      iconUrl:
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
      shadowUrl:
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
    });
  }, []);
}

function MapClickHandler({ onPick }: { onPick: (lat: number, lon: number) => void }) {
  useMapEvents({
    click(e) {
      onPick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

function SyncMapView({
  lat,
  lon,
}: {
  lat: number | null;
  lon: number | null;
}) {
  const map = useMap();
  useEffect(() => {
    if (
      lat != null &&
      lon != null &&
      Number.isFinite(lat) &&
      Number.isFinite(lon)
    ) {
      map.setView([lat, lon], Math.max(map.getZoom(), DEFAULT_ZOOM_WITH_POINT));
    }
  }, [lat, lon, map]);
  return null;
}

export type LocationMapPickerProps = {
  /** Para `aria-labelledby` desde el padre */
  labelledBy?: string;
  lat: number | null;
  lon: number | null;
  onMapClick: (lat: number, lon: number) => void;
};

export function LocationMapPicker({
  labelledBy,
  lat,
  lon,
  onMapClick,
}: LocationMapPickerProps) {
  useLeafletIconFix();

  const hasPoint =
    lat != null &&
    lon != null &&
    Number.isFinite(lat) &&
    Number.isFinite(lon);

  const center: [number, number] = hasPoint ? [lat!, lon!] : DEFAULT_CENTER;
  const zoom = hasPoint ? DEFAULT_ZOOM_WITH_POINT : DEFAULT_ZOOM_NO_POINT;

  return (
    <div
      className="relative h-[min(16rem,45vh)] w-full max-w-full overflow-hidden rounded border-2 border-[#808080] bg-[#e8e8e8]"
      role="group"
      aria-labelledby={labelledBy}
    >
      <MapContainer
        center={center}
        zoom={zoom}
        className="location-map-picker z-[1] h-full w-full"
        scrollWheelZoom
        attributionControl
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={19}
        />
        <MapClickHandler onPick={onMapClick} />
        <SyncMapView lat={lat} lon={lon} />
        {hasPoint ? <Marker position={[lat!, lon!]} /> : null}
      </MapContainer>
    </div>
  );
}
