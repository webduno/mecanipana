import Link from "next/link";
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
import { VehicleDefaultPanel } from "@/components/vehicle-default-panel";

export default function Home() {
  return (
    <div className="flex min-h-full flex-1 flex-col p-3 sm:p-6 lg:p-8">
      <div className="win98-window mx-auto flex w-full max-w-lg flex-col lg:max-w-4xl lg:flex-row lg:gap-0">
        <div className="flex min-w-0 flex-1 flex-col">
          <header className="win98-titlebar shrink-0 rounded-none">
            <span className="truncate">Mecanipana</span>
          </header>
          <div className="win98-body flex flex-col gap-4">
            <p className="m-0 text-pretty text-[clamp(1rem,3.6vw,1.2rem)]">
              Registro sencillo del uso del carro. Pensado para uso en Venezuela. Los
              datos quedan en este equipo; más adelante, sincronización con una
              cuenta.
            </p>

            <VehicleDefaultPanel />

            <nav
              aria-label="Acciones principales"
              className="grid grid-cols-3 gap-2 sm:gap-3"
            >
              <Link
                href="/registrar-uso"
                className="win98-btn win98-btn-tile win98-btn--accent-blue"
              >
                <IconRegistrar className="win98-btn-icon" />
                Registrar uso
              </Link>
              <Link
                href="/historial"
                className="win98-btn win98-btn-tile win98-btn--accent-green"
              >
                <IconHistorial className="win98-btn-icon" />
                Ver historial
              </Link>
              <Link href="/resumen" className="win98-btn win98-btn-tile">
                <IconResumen className="win98-btn-icon" />
                Resumen
              </Link>
              <Link href="/combustible" className="win98-btn win98-btn-tile">
                <IconCombustible className="win98-btn-icon" />
                Combustible
              </Link>
              <Link href="/mantenimiento" className="win98-btn win98-btn-tile">
                <IconMantenimiento className="win98-btn-icon" />
                Mantenimiento
              </Link>
              <Link href="/recordatorios" className="win98-btn win98-btn-tile">
                <IconRecordatorios className="win98-btn-icon" />
                Recordatorios
              </Link>
              <Link href="/opciones" className="win98-btn win98-btn-tile">
                <IconOpciones className="win98-btn-icon" />
                Opciones (este equipo)
              </Link>
              <Link href="/datos-vehiculo" className="win98-btn win98-btn-tile">
                <IconVehiculo className="win98-btn-icon" />
                Datos del vehículo
              </Link>
              <button type="button" className="win98-btn win98-btn-tile" disabled>
                <IconCuenta className="win98-btn-icon" />
                Cuenta — próximamente
              </button>
            </nav>
          </div>
        </div>

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
      </div>
    </div>
  );
}
