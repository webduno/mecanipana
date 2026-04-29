import type { ThemeId } from "@/lib/mecanipana-types";

/** Aplica tema en `<html>`: Win98 = sin atributo (usa `:root` en CSS). */
export function applyThemeToDocument(theme: ThemeId): void {
  if (typeof document === "undefined") return;
  if (theme === "win98") {
    document.documentElement.removeAttribute("data-theme");
    return;
  }
  document.documentElement.setAttribute("data-theme", theme);
}

export function themeDisplayLabel(theme: ThemeId): string {
  switch (theme) {
    case "win98":
      return "Windows 98 (clásico)";
    case "neumorphism":
      return "Neumorfismo";
    case "facephism":
      return "Facephism (tipo red social)";
    default:
      return theme;
  }
}
