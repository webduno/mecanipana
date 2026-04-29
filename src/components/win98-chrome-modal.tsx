"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";

export type Win98ChromeModalProps = {
  /** Texto o contenido del botón cuadrado (p. ej. ícono SVG). */
  triggerLabel: ReactNode;
  /** Leyenda bajo el ícono (mayúsculas cortas, estilo Win98). */
  triggerCaption?: string;
  /** Título azul del modal. */
  modalTitle: string;
  /** Variante visual del botón (`vehicle` = azul, `motor` = verde). */
  accent?: "vehicle" | "motor";
  children: ReactNode;
};

/**
 * Botón en barra de título + `<dialog>` en portal (`document.body`),
 * mismas clases que «Este equipo» (`mp-overlay-dialog`, clic fuera cierra).
 * Pasar como `headerActionsExtra={<TuModal />} />` en `AppWindowShell` / `PageShell`.
 */
export function Win98ChromeModal({
  triggerLabel,
  triggerCaption,
  modalTitle,
  accent = "motor",
  children,
}: Win98ChromeModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [portalReady, setPortalReady] = useState(false);

  useEffect(() => {
    setPortalReady(true);
  }, []);

  const closeBackdrop = useCallback((e: React.MouseEvent<HTMLDialogElement>) => {
    if (e.target === e.currentTarget) {
      dialogRef.current?.close();
    }
  }, []);

  const btnClass =
    accent === "vehicle"
      ? "win98-btn-square win98-btn-square--vehicle !min-h-[2.35rem] !min-w-[3rem] !gap-0.5 !py-0.5 !text-[0.65rem]"
      : "win98-btn-square win98-btn-square--motor !min-h-[2.35rem] !min-w-[3rem] !gap-0.5 !py-0.5 !text-[0.65rem]";

  const modal = (
    <dialog
      ref={dialogRef}
      className="mp-overlay-dialog"
      onClick={closeBackdrop}
    >
      <div
        className="win98-window flex max-h-[min(92vh,40rem)] w-[min(100vw-1.25rem,30rem)] max-w-[min(100vw-1.25rem,30rem)] flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="win98-titlebar shrink-0 text-[clamp(0.95rem,3.5vw,1.15rem)]">
          {modalTitle}
        </div>
        <div className="win98-body flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto">
          {children}
          <button
            type="button"
            className="win98-btn mt-auto shrink-0"
            onClick={() => dialogRef.current?.close()}
          >
            Cerrar
          </button>
        </div>
      </div>
    </dialog>
  );

  return (
    <>
      <button
        type="button"
        className={btnClass}
        onClick={() => dialogRef.current?.showModal()}
      >
        <span className="flex flex-col items-center justify-center gap-0.5">
          {triggerLabel}
          {triggerCaption ? (
            <span className="win98-btn-square-caption !mt-0 !max-w-[4rem] !text-[0.5rem] !leading-tight">
              {triggerCaption}
            </span>
          ) : null}
        </span>
      </button>
      {portalReady ? createPortal(modal, document.body) : null}
    </>
  );
}
