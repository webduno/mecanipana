"use client";

import type { ReactNode } from "react";
import { EsteEquipoModalControl } from "@/components/este-equipo-modal";

export type HeaderToolbarProps = {
  /**
   * Botones adicionales en la barra azul, después de «Mi Info».
   * Cada uno puede ser un botón que abre su propio `<dialog>` (p. ej. con portal a `document.body`
   * y clase `mp-overlay-dialog` como en `EsteEquipoModalControl`).
   */
  extra?: ReactNode;
};

/**
 * Barra de acciones del titlebar: siempre incluye «Mi Info» + modal Este equipo;
 * opcionalmente `extra` para más controles/modales.
 */
export function HeaderToolbar({ extra }: HeaderToolbarProps) {
  return (
    <div
      className="flex shrink-0 items-center gap-1"
      aria-label="Acciones de la ventana"
    >
      <EsteEquipoModalControl />
      {extra}
    </div>
  );
}
