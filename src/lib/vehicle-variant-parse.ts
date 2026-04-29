/** Etiqueta persistida: `motor · año` (ej. `1.4 · 2008`). */
export function formatVariantLabel(engine: string, year: number): string {
  return `${engine} · ${year}`;
}

export function parseVariantLabel(label: string): { engine: string; year: number } | null {
  const parts = label.split(/\s*·\s*/).map((s) => s.trim());
  if (parts.length < 2) return null;
  const yearPart = parts[parts.length - 1]!;
  const year = Number.parseInt(yearPart, 10);
  if (!Number.isFinite(year) || year < 1900 || year > 2100) return null;
  const engine = parts.slice(0, -1).join(" · ");
  if (!engine) return null;
  return { engine, year };
}
