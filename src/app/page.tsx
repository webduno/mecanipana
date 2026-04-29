import { AppWindowShell } from "@/components/app-window-shell";
import {
  IconCombustible,
  IconCuenta,
  IconHistorial,
  IconMantenimiento,
  IconOpciones,
  IconRecordatorios,
  IconRegistrar,
  IconResumen,
  IconVehiculo,
} from "@/components/grid-action-icons";
import Link from "next/link";

export default function Home() {
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
            grandes. En pantallas grandes puedes usar el espacio extra para leer
            ayuda o recordatorios mientras armamos el resto.
          </p>
        </aside>
      }
    >
      <div className="flex flex-col gap-3">
        <p className="m-0 flex items-start gap-2.5 text-pretty text-[clamp(1rem,3.6vw,1.12rem)] leading-snug">
          <IconVehiculo className="win98-label-icon mt-0.5 shrink-0" aria-hidden />
          <span>
            Pulsa <strong className="font-bold">Info</strong> en la barra azul para
            vehículo superior, para <b>cambiar tu vehículo seleccionado</b>.
          </span>
        </p>
        <p className="m-0 flex items-start gap-2.5 text-pretty text-[clamp(1rem,3.6vw,1.12rem)] leading-snug">
          <IconRegistrar
            className="win98-label-icon mt-0.5 shrink-0"
            aria-hidden
          />
          <span>Anota uso del carro (viajes, combustible, mantenimiento).</span>
        </p>
        <p className="m-0 flex items-start gap-2.5 text-pretty text-[clamp(1rem,3.6vw,1.12rem)] leading-snug">
          <IconOpciones className="win98-label-icon mt-0.5 shrink-0" aria-hidden />
          <span>
            Todo queda guardado; más adelante, con cuentas para sincronizar.
          </span>
        </p>
      </div>

      <nav
        aria-label="Acciones principales"
        className="grid grid-cols-3 gap-2 sm:gap-3"
      >
        <Link href="/resumen" className="win98-btn win98-btn-tile">
          <IconResumen className="win98-btn-icon" />
          Resumen
        </Link>
        <Link href="/datos-vehiculo" className="win98-btn win98-btn-tile">
          <IconVehiculo className="win98-btn-icon" />
          Datos del vehículo
        </Link>
        <button type="button" className="win98-btn win98-btn-tile" disabled>
          <IconCuenta className="win98-btn-icon" />
          Cuenta — próximamente
        </button>
        <Link
          href="/combustible"
          className="win98-btn win98-btn-tile win98-btn-tile--mid-frame-combustible"
        >
          <IconCombustible className="win98-btn-icon" />
          Combustible
        </Link>
        <Link
          href="/mantenimiento"
          className="win98-btn win98-btn-tile win98-btn-tile--mid-frame-mantenimiento"
        >
          <IconMantenimiento className="win98-btn-icon" />
          Mantenimiento
        </Link>
        <Link
          href="/recordatorios"
          className="win98-btn win98-btn-tile win98-btn-tile--mid-frame-recordatorios"
        >
          <IconRecordatorios className="win98-btn-icon" />
          Recordatorios
        </Link>
        <Link
          href="/opciones"
          className="win98-btn win98-btn-tile win98-btn--accent-red"
        >
          <IconOpciones className="win98-btn-icon" />
          Opciones (este equipo)
        </Link>
        <Link
          href="/historial"
          className="win98-btn win98-btn-tile win98-btn--accent-green"
        >
          <IconHistorial className="win98-btn-icon" />
          Ver historial
        </Link>
        <Link
          href="/registrar-uso"
          className="win98-btn win98-btn-tile win98-btn--accent-blue"
        >
          <IconRegistrar className="win98-btn-icon" />
          Agregar Info
        </Link>
      </nav>
    </AppWindowShell>
  );
}
