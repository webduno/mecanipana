"use client";

import { AppWindowShell } from "@/components/app-window-shell";
import { useSupabaseAuth } from "@/components/auth/supabase-session";
import {
  IconCombustible,
  IconCuenta,
  IconHistorial,
  IconMantenimiento,
  IconOpciones,
  IconRecordatorios,
  IconNota,
  IconRegistrar,
  IconResumen,
  IconVehiculo,
} from "@/components/grid-action-icons";
import {
  loadFuelLog,
  loadMaintenanceLog,
  loadUsageLog,
} from "@/lib/local-storage-data";
import { OPEN_MI_INFO_EVENT } from "@/components/este-equipo-modal";
import { useVehicleSetupReady } from "@/components/vehicle-setup-gate";
import { isPlatformAdminEmail } from "@/lib/auth-constants";
import Link from "next/link";
import type { ReactNode } from "react";

/** Ficha navegable o bloqueada hasta configurar Mi Info → Carro. */
function LandingTile(props: {
  href: string;
  complete: boolean;
  className?: string;
  children: ReactNode;
}) {
  const base = props.className
    ? `win98-btn win98-btn-tile ${props.className}`
    : "win98-btn win98-btn-tile";

  if (props.complete) {
    return (
      <Link href={props.href} className={base}>
        {props.children}
      </Link>
    );
  }

  return (
    <button
      type="button"
      className={`${base} cursor-not-allowed opacity-[0.72]`}
      title="Primero elige marca, modelo, año y motor en Mi Info → Este equipo → Carro"
    >
      {props.children}
    </button>
  );
}

export function HomePageClient() {
  const { user, loading } = useSupabaseAuth();
  const { mounted, complete } = useVehicleSetupReady();
  const showAdminBtn = Boolean(
    user?.email && !loading && isPlatformAdminEmail(user.email)
  );

  const canGo = mounted && complete;
  const usageLog = loadUsageLog();
  const fuelLog = loadFuelLog();
  const maintLog = loadMaintenanceLog();
  const onlyVehicleNoLogs =
    canGo &&
    usageLog.length === 0 &&
    fuelLog.length === 0 &&
    maintLog.length === 0;

  return (
    <AppWindowShell
      variant="landing"
      aside={
        <aside className="win98-body hidden border-t-2 border-[#808080] bg-[#c0c0c0] lg:flex lg:w-[min(40%,20rem)] lg:flex-col lg:border-t-0 lg:border-l-2 lg:border-l-[#808080]">
          <p className="m-0 text-sm font-bold text-[#000080] lg:text-base">
            Pantalla ancha
          </p>
          <p className="mt-2 mb-0 text-pretty text-[0.95rem] leading-snug lg:text-[1.05rem]">
            En el teléfono la cuadrícula sigue siendo de tres columnas con íconos
            grandes. En pantallas grandes puedes usar el espacio extra para leer ayuda o
            recordatorios mientras armamos el resto.
          </p>
        </aside>
      }
    >
      <div className="flex flex-col gap-3">
        {!canGo ? (
          <button
            type="button"
            className="win98-btn win98-btn--accent-amber flex min-h-[3.25rem] w-full max-w-md items-center justify-center gap-3 text-[clamp(1rem,3.5vw,1.15rem)] font-extrabold"
            onClick={() => {
              window.dispatchEvent(new CustomEvent(OPEN_MI_INFO_EVENT));
            }}
            aria-label="Abrir Mi Info para escoger marca, modelo, año y motor"
          >
            <IconVehiculo className="h-7 w-7 shrink-0" aria-hidden />
            Escoger mi carro
          </button>
        ) : onlyVehicleNoLogs ? (
          <Link
            href="/datos-vehiculo/cuestionario"
            className="win98-btn win98-btn--accent-amber flex min-h-[3.25rem] w-full max-w-md items-center justify-center gap-3 text-[clamp(1rem,3.5vw,1.15rem)] font-extrabold no-underline"
            aria-label="Empezar el Quiz de estado del vehículo"
          >
            <IconNota className="h-7 w-7 shrink-0" aria-hidden />
            Empezar Quiz (9 preguntas)
          </Link>
        ) : null}
        <p className="m-0 flex items-start gap-2.5 text-pretty text-[clamp(1rem,3.6vw,1.12rem)] leading-snug">
          <IconVehiculo className="win98-label-icon mt-0.5 shrink-0" aria-hidden />
          <span>
            <strong className="font-semibold text-[#000080]">Tu carro.</strong>{" "}
            Escoge tu carro en {" "}
            <strong className="font-semibold">Mi Info</strong> →{" "}
            <strong className="font-semibold">Carro</strong>: marca, modelo, año, motor.
            {!canGo ? (
              <>
                {" "}
                O usa el atajo: botón naranja «Escoger mi carro».
              </>
            ) : onlyVehicleNoLogs ? (
              <>
                {" "}
                O el atajo: botón naranja «Empezar Quiz».
              </>
            ) : (
              <>
                {" "}
                ¿Otro carro? Cambias ahí mismo.
              </>
            )}
          </span>
        </p>
        <p className="m-0 flex items-start gap-2.5 text-pretty text-[clamp(1rem,3.6vw,1.12rem)] leading-snug">
          <IconRegistrar
            className="win98-label-icon mt-0.5 shrink-0"
            aria-hidden
          />
          <span>
            <strong className="font-semibold text-[#000080]">Tus registros por categoría:</strong>
            viajes, gasolina, taller, recordatorios… un toque, un dato.
          </span>
        </p>
        <p className="m-0 flex items-start gap-2.5 text-pretty text-[clamp(1rem,3.6vw,1.12rem)] leading-snug">
          <IconOpciones className="win98-label-icon mt-0.5 shrink-0" aria-hidden />
          <span>
            <strong className="font-semibold text-[#000080]">Este equipo primero.</strong> Todo vive primero offline y luego se sincroniza con el servidor. Letra y tema en{" "}
            <strong className="font-semibold">Opciones</strong>. 
          </span>
        </p>
      </div>

      <div className="flex flex-col gap-2 sm:gap-3">
        <nav
          aria-label="Acciones principales"
          className="grid grid-cols-3 gap-2 sm:gap-3"
        >
          <LandingTile href="/resumen" complete={canGo}>
            <IconResumen className="win98-btn-icon" />
            Resumen
          </LandingTile>
          <LandingTile href="/datos-vehiculo" complete={canGo}>
            <IconVehiculo className="win98-btn-icon" />
            Datos del vehículo
          </LandingTile>
          <button type="button" className="win98-btn win98-btn-tile" disabled>
            <IconCuenta className="win98-btn-icon" />
            Cuenta — próximamente
          </button>
          <LandingTile
            href="/combustible"
            complete={canGo}
            className="win98-btn-tile--mid-frame-combustible"
          >
            <IconCombustible className="win98-btn-icon" />
            Combustible
          </LandingTile>
          <LandingTile
            href="/mantenimiento"
            complete={canGo}
            className="win98-btn-tile--mid-frame-mantenimiento"
          >
            <IconMantenimiento className="win98-btn-icon" />
            Mantenimiento
          </LandingTile>
          <LandingTile
            href="/recordatorios"
            complete={canGo}
            className="win98-btn-tile--mid-frame-recordatorios"
          >
            <IconRecordatorios className="win98-btn-icon" />
            Recordatorios
          </LandingTile>
          <Link href="/opciones" className="win98-btn win98-btn-tile win98-btn--accent-red">
            <IconOpciones className="win98-btn-icon" />
            Opciones de Tema
          </Link>
          <LandingTile
            href="/historial"
            complete={canGo}
            className="win98-btn--accent-green"
          >
            <IconHistorial className="win98-btn-icon" />
            Ver historial
          </LandingTile>
          <LandingTile href="/registrar-uso" complete={canGo} className="win98-btn--accent-blue">
            <IconRegistrar className="win98-btn-icon" />
            Agregar Info
          </LandingTile>
        </nav>

        {showAdminBtn ? (
          <Link href="/admin" className="win98-btn win98-btn-tile font-semibold">
            <IconCuenta className="win98-btn-icon" />
            Administración
          </Link>
        ) : null}
      </div>
    </AppWindowShell>
  );
}
