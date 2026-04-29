"use client";

import type { ReactNode } from "react";
import { HeaderAuth } from "@/components/auth/header-auth";
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
      className="flex shrink-0 items-center gap-2"
      aria-label="Acciones de la ventana"
    >
      <HeaderAuth />
      <EsteEquipoModalControl />
      {extra}
    </div>
  );
}
