"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ComponentType } from "react";
import {
  IconHistorial,
  IconMantenimiento,
  IconOpciones,
  IconRecordatorios,
  IconRegistrar,
  IconResumen,
  IconVehiculo,
} from "@/components/grid-action-icons";

function IconInicio({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      className={className}
      aria-hidden
    >
      <path fill="currentColor" d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8h5z" />
    </svg>
  );
}

type PageAction = {
  href: string;
  label: string;
  Icon: ComponentType<{ className?: string }>;
  accent?: "blue" | "green";
};

function contextActionForPath(pathname: string): PageAction {
  const path = pathname.endsWith("/") && pathname.length > 1 ? pathname.slice(0, -1) : pathname;

  switch (path) {
    case "/":
      return {
        href: "/registrar-uso",
        label: "Registrar uso",
        Icon: IconRegistrar,
        accent: "blue",
      };
    case "/registrar-uso":
      return {
        href: "/historial",
        label: "Ver historial",
        Icon: IconHistorial,
        accent: "green",
      };
    case "/historial":
      return {
        href: "/registrar-uso",
        label: "Registrar uso",
        Icon: IconRegistrar,
        accent: "blue",
      };
    case "/resumen":
      return {
        href: "/historial",
        label: "Historial",
        Icon: IconHistorial,
        accent: "green",
      };
    case "/combustible":
      return {
        href: "/resumen",
        label: "Resumen",
        Icon: IconResumen,
        accent: "green",
      };
    case "/mantenimiento":
      return {
        href: "/recordatorios",
        label: "Recordatorios",
        Icon: IconRecordatorios,
        accent: "green",
      };
    case "/recordatorios":
      return {
        href: "/mantenimiento",
        label: "Mantenimiento",
        Icon: IconMantenimiento,
        accent: "green",
      };
    case "/opciones":
      return {
        href: "/datos-vehiculo",
        label: "Datos del vehículo",
        Icon: IconVehiculo,
        accent: "blue",
      };
    case "/datos-vehiculo":
      return {
        href: "/opciones",
        label: "Opciones",
        Icon: IconOpciones,
        accent: "blue",
      };
    default:
      return {
        href: "/historial",
        label: "Historial",
        Icon: IconHistorial,
        accent: "green",
      };
  }
}

function btnClass(accent?: "blue" | "green") {
  if (accent === "blue") {
    return "win98-btn-square win98-btn-square--vehicle !min-h-[2.65rem] !min-w-[2.65rem] !p-1";
  }
  if (accent === "green") {
    return "win98-btn-square win98-btn-square--motor !min-h-[2.65rem] !min-w-[2.65rem] !p-1";
  }
  return "win98-btn-square !min-h-[2.65rem] !min-w-[2.65rem] !p-1";
}

export function FloatingNav() {
  const pathname = usePathname() ?? "/";
  const ctx = contextActionForPath(pathname);
  const ContextIcon = ctx.Icon;

  return (
    <nav
      aria-label="Acceso rápido"
      className="fixed bottom-[max(0.75rem,env(safe-area-inset-bottom,0px))] right-[max(0.75rem,env(safe-area-inset-right,0px))] z-[90] flex flex-col gap-0.5 rounded-sm border-2 border-[#808080] bg-[#c0c0c0] p-1 shadow-[2px_2px_0_#000]"
    >
      <Link
        href="/"
        title="Inicio"
        aria-label="Ir al inicio"
        className={btnClass()}
      >
        <IconInicio className="h-[1.35rem] w-[1.35rem]" />
      </Link>
      <Link
        href={ctx.href}
        title={ctx.label}
        aria-label={ctx.label}
        className={btnClass(ctx.accent)}
      >
        <ContextIcon className="h-[1.35rem] w-[1.35rem]" />
      </Link>
    </nav>
  );
}
