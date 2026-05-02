/** Enlace al visor de OpenStreetMap (punto). */
export function openStreetMapMarkerUrl(lat: number, lon: number, zoom = 16): string {
  const z = Math.min(19, Math.max(1, Math.round(zoom)));
  return `https://www.openstreetmap.org/?mlat=${encodeURIComponent(String(lat))}&mlon=${encodeURIComponent(String(lon))}&zoom=${z}`;
}

export type NominatimSearchHit = {
  display_name: string;
  lat: number;
  lon: number;
};
