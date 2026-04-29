"use client";

import Link from "next/link";
import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { IconResumen, IconVehiculo } from "@/components/grid-action-icons";
import {
  loadAppOptions,
  loadFuelLog,
  loadMaintenanceLog,
  loadMaintenanceWhatCustom,
  loadReminders,
  loadUsageLog,
  loadVehicleNotes,
  readSelectedVehicle,
} from "@/lib/local-storage-data";
import { STORAGE_KEYS } from "@/lib/storage-keys";

type TabId = "car" | "datos";

function mecanipanaStorageApproxChars(): number {
  if (typeof window === "undefined") return 0;
  let n = 0;
  for (const k of Object.values(STORAGE_KEYS)) {
    const raw = window.localStorage.getItem(k);
    if (raw) n += raw.length;
  }
  return n;
}

export function ContainerShortcuts() {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [portalReady, setPortalReady] = useState(false);
  const [tick, setTick] = useState(0);
  const [tab, setTab] = useState<TabId>("car");
  const baseId = useId();
  const panelCarId = `${baseId}-panel-car`;
  const panelDatosId = `${baseId}-panel-datos`;

  const refresh = useCallback(() => setTick((t) => t + 1), []);

  useEffect(() => {
    setPortalReady(true);
  }, []);

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key?.startsWith("mecanipana:")) refresh();
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [refresh]);

  useEffect(() => {
    const onFocus = () => refresh();
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [refresh]);

  const vehicle = useMemo(() => readSelectedVehicle(), [tick]);
  const summary = useMemo(() => {
    const uso = loadUsageLog().length;
    const comb = loadFuelLog().length;
    const mant = loadMaintenanceLog().length;
    const rec = loadReminders().length;
    const customWhat = loadMaintenanceWhatCustom().length;
    const notesLen = loadVehicleNotes().length;
    const opts = loadAppOptions();
    const approxChars = mecanipanaStorageApproxChars();
    return {
      uso,
      comb,
      mant,
      rec,
      customWhat,
      notesLen,
      opts,
      approxChars,
    };
  }, [tick]);

  const openModal = () => {
    refresh();
    setTab("car");
    dialogRef.current?.showModal();
  };

  const closeModalIfBackdrop = useCallback((e: React.MouseEvent<HTMLDialogElement>) => {
    if (e.target === e.currentTarget) {
      dialogRef.current?.close();
    }
  }, []);

  const tabBtnClass = (active: boolean) =>
    [
      "min-h-[2.35rem] flex-1 border-2 px-2 py-1 text-[0.82rem] font-extrabold tracking-wide uppercase",
      active
        ? "relative z-[1] -mb-[2px] border-[#ffffff] border-b-[#c0c0c0] bg-[#c0c0c0] text-[#000080]"
        : "cursor-pointer border-[#808080] bg-[#d4d0c8] text-[#303030] hover:bg-[#dcdad5]",
    ].join(" ");

  const modalDialog = (
    <dialog
      ref={dialogRef}
      className="mp-overlay-dialog"
      onClick={closeModalIfBackdrop}
      onClose={refresh}
    >
      <div
        className="win98-window flex max-h-[min(92vh,38rem)] w-[min(100vw-2rem,28rem)] max-w-[min(100vw-2rem,28rem)] flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="win98-titlebar shrink-0 text-[clamp(0.95rem,3.5vw,1.15rem)]">
          Este equipo
        </div>

        <div
          role="tablist"
          aria-label="Secciones"
          className="flex shrink-0 gap-1 border-b-2 border-[#808080] bg-[#c0c0c0] px-2 pt-2"
        >
          <button
            type="button"
            role="tab"
            id={`${baseId}-tab-car`}
            aria-selected={tab === "car"}
            aria-controls={panelCarId}
            tabIndex={tab === "car" ? 0 : -1}
            className={tabBtnClass(tab === "car")}
            onClick={() => setTab("car")}
          >
            <span className="inline-flex items-center justify-center gap-1">
              <IconVehiculo className="h-[1rem] w-[1rem] shrink-0" aria-hidden />
              Carro
            </span>
          </button>
          <button
            type="button"
            role="tab"
            id={`${baseId}-tab-datos`}
            aria-selected={tab === "datos"}
            aria-controls={panelDatosId}
            tabIndex={tab === "datos" ? 0 : -1}
            className={tabBtnClass(tab === "datos")}
            onClick={() => setTab("datos")}
          >
            <span className="inline-flex items-center justify-center gap-1">
              <IconResumen className="h-[1rem] w-[1rem] shrink-0" aria-hidden />
              Datos
            </span>
          </button>
        </div>

        <div className="win98-body flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto">
          <div
            id={panelCarId}
            role="tabpanel"
            aria-labelledby={`${baseId}-tab-car`}
            hidden={tab !== "car"}
            className={tab === "car" ? "flex min-h-0 flex-col gap-3" : "hidden"}
          >
            <p className="m-0 font-bold">
              {vehicle.line.trim() || "(sin nombre)"}{" "}
              <span className="font-semibold text-[#303030]">
                {vehicle.variant.trim() || ""}
              </span>
            </p>
            <p className="m-0 text-[0.95rem] leading-snug text-[#404040]">
              Es la combinación guardada en este navegador para registros y resúmenes.
            </p>
            <Link
              href="/datos-vehiculo"
              className="win98-btn inline-flex w-auto self-start no-underline"
            >
              Ir a datos del vehículo
            </Link>
          </div>

          <div
            id={panelDatosId}
            role="tabpanel"
            aria-labelledby={`${baseId}-tab-datos`}
            hidden={tab !== "datos"}
            className={tab === "datos" ? "flex min-h-0 flex-col gap-3" : "hidden"}
          >
            <p className="m-0 text-[0.92rem] leading-snug text-[#404040]">
              Resumen de lo guardado en{" "}
              <span className="font-semibold">localStorage</span> (clave{" "}
              <code className="text-[0.85rem]">mecanipana:*</code>).
            </p>

            <div className="grid grid-cols-2 gap-2">
              <div className="flex min-h-[4.25rem] flex-col justify-between border-2 border-[#808080] bg-[#ffffcc] p-2 pt-2 shadow-[inset_1px_1px_0_#fff,inset_-1px_-1px_0_#404040]">
                <span className="text-[0.72rem] font-extrabold leading-tight tracking-wide text-[#505050] uppercase">
                  Registros de uso
                </span>
                <span className="text-end text-[1.35rem] font-bold tabular-nums leading-none">
                  {summary.uso}
                </span>
              </div>
              <div className="flex min-h-[4.25rem] flex-col justify-between border-2 border-[#808080] bg-white p-2 pt-2 shadow-[inset_1px_1px_0_#fff,inset_-1px_-1px_0_#404040]">
                <span className="text-[0.72rem] font-extrabold leading-tight tracking-wide text-[#505050] uppercase">
                  Combustible
                </span>
                <span className="text-end text-[1.35rem] font-bold tabular-nums leading-none">
                  {summary.comb}
                </span>
              </div>
              <div className="flex min-h-[4.25rem] flex-col justify-between border-2 border-[#808080] bg-white p-2 pt-2 shadow-[inset_1px_1px_0_#fff,inset_-1px_-1px_0_#404040]">
                <span className="text-[0.72rem] font-extrabold leading-tight tracking-wide text-[#505050] uppercase">
                  Mantenimiento
                </span>
                <span className="text-end text-[1.35rem] font-bold tabular-nums leading-none">
                  {summary.mant}
                </span>
              </div>
              <div className="flex min-h-[4.25rem] flex-col justify-between border-2 border-[#808080] bg-white p-2 pt-2 shadow-[inset_1px_1px_0_#fff,inset_-1px_-1px_0_#404040]">
                <span className="text-[0.72rem] font-extrabold leading-tight tracking-wide text-[#505050] uppercase">
                  Recordatorios
                </span>
                <span className="text-end text-[1.35rem] font-bold tabular-nums leading-none">
                  {summary.rec}
                </span>
              </div>
            </div>

            <dl className="m-0 grid gap-0 overflow-hidden border-2 border-[#808080] bg-white shadow-[inset_1px_1px_0_#fff,inset_-1px_-1px_0_#404040]">
              <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 border-b border-[#808080] px-2.5 py-2 text-[0.92rem] leading-snug">
                <dt className="m-0 min-w-0 font-semibold">
                  Tipos de mantenimiento personalizados
                </dt>
                <dd className="m-0 shrink-0 tabular-nums text-right text-[1.05rem] font-bold">
                  {summary.customWhat}
                </dd>
              </div>
              <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 border-b border-[#808080] px-2.5 py-2 text-[0.92rem] leading-snug">
                <dt className="m-0 min-w-0 font-semibold">Notas del vehículo</dt>
                <dd className="m-0 shrink-0 whitespace-nowrap tabular-nums text-right text-[1.05rem] font-bold">
                  {summary.notesLen}{" "}
                  <span className="text-[0.78rem] font-semibold text-[#505050]">
                    car.
                  </span>
                </dd>
              </div>
              <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 px-2.5 py-2 text-[0.92rem] leading-snug">
                <dt className="m-0 min-w-0 font-semibold">Fuentes grandes</dt>
                <dd className="m-0 shrink-0 text-right text-[1.05rem] font-bold">
                  {summary.opts.fuentesGrandes ? "Sí" : "No"}
                </dd>
              </div>
            </dl>

            <p className="m-0 rounded-sm border-2 border-[#808080] bg-[#ffffcc] px-2.5 py-2 text-[0.88rem] leading-snug text-[#404040] shadow-[inset_1px_1px_0_#fff,inset_-1px_-1px_0_#404040]">
              <span className="font-semibold">Tamaño total (aprox.):</span>{" "}
              <strong className="tabular-nums">{summary.approxChars}</strong> caracteres UTF-16 en
              claves <code className="text-[0.82rem]">mecanipana:*</code>.
            </p>
          </div>

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
      <div className="flex shrink-0 justify-end">
        <button
          type="button"
          className="win98-btn-square win98-btn-square--vehicle !min-h-[2.65rem] !min-w-[3.35rem] !gap-0.5 !py-1 !text-[0.65rem]"
          title="Vehículo actual y resumen de datos en este equipo"
          aria-label="Abrir información del vehículo y datos guardados"
          onClick={openModal}
        >
          <span className="flex items-center gap-0.5" aria-hidden>
            <IconVehiculo className="h-[1rem] w-[1rem]" />
            <IconResumen className="h-[1rem] w-[1rem]" />
          </span>
          <span className="win98-btn-square-caption !mt-0 !text-[0.5rem]">Info</span>
        </button>
      </div>

      {portalReady ? createPortal(modalDialog, document.body) : null}
    </>
  );
}
