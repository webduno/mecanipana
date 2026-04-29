"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ComponentType } from "react";
import { useEffect, useRef, useState } from "react";
import {
  IconCombustible,
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

type NavEntry = {
  href: string;
  label: string;
  Icon: ComponentType<{ className?: string }>;
};

const MAIN_NAV: NavEntry[] = [
  { href: "/", label: "Inicio", Icon: IconInicio },
  { href: "/resumen", label: "Resumen", Icon: IconResumen },
  { href: "/datos-vehiculo", label: "Datos del vehículo", Icon: IconVehiculo },
  { href: "/combustible", label: "Combustible", Icon: IconCombustible },
  { href: "/mantenimiento", label: "Mantenimiento", Icon: IconMantenimiento },
  { href: "/recordatorios", label: "Recordatorios", Icon: IconRecordatorios },
  { href: "/opciones", label: "Opciones", Icon: IconOpciones },
  { href: "/historial", label: "Historial", Icon: IconHistorial },
  { href: "/registrar-uso", label: "Registrar uso", Icon: IconRegistrar },
];

function normalizePath(path: string) {
  if (path.endsWith("/") && path.length > 1) return path.slice(0, -1);
  return path;
}

export function MecanipanaNavbarBrand() {
  const pathname = usePathname() ?? "/";
  const active = normalizePath(pathname);
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onDocPointerDown(e: MouseEvent) {
      const el = rootRef.current;
      if (!el?.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDocPointerDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocPointerDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative flex min-w-0 shrink-0 items-center gap-2">
      <Link
        href="/"
        className="flex shrink-0 items-center"
        title="Ir al inicio"
        aria-label="Ir al inicio"
      >
        <img
          src="/mecanipanalogo.png"
          alt=""
          width={22}
          height={22}
          className="h-[1.35rem] w-[1.35rem] object-contain"
          aria-hidden
        />
      </Link>
      <button
        type="button"
        id="mecanipana-brand-trigger"
        className="flex shrink-0 cursor-pointer items-center gap-0.5 border-0 bg-transparent p-0 font-bold text-inherit underline decoration-[currentColor] decoration-2 underline-offset-2"
        aria-expanded={open}
        aria-haspopup="true"
        aria-controls="mecanipana-main-nav-menu"
        onClick={() => setOpen((v) => !v)}
      >
        Mecanipana
        <svg
          className={`h-3 w-3 shrink-0 opacity-90 transition-transform ${open ? "rotate-180" : ""}`}
          viewBox="0 0 12 12"
          aria-hidden
        >
          <path fill="currentColor" d="M2 4l4 4 4-4H2z" />
        </svg>
      </button>
      {open ? (
        <nav
          id="mecanipana-main-nav-menu"
          role="navigation"
          aria-label="Páginas principales"
          className="absolute left-0 top-full z-[100] mt-0.5 min-w-[min(18rem,calc(100vw-2rem))] border-2 border-[#808080] bg-[#c0c0c0] py-0.5 shadow-[2px_2px_0_#000] text-[clamp(0.85rem,3.2vw,1rem)] font-bold text-[#000080]"
        >
          <ul className="m-0 list-none p-0">
            {MAIN_NAV.map(({ href, label, Icon }) => {
              const isActive =
                href === "/"
                  ? active === "/"
                  : active === href || active.startsWith(`${href}/`);
              return (
                <li key={href} className="m-0">
                  <Link
                    href={href}
                    className={`group flex items-center gap-2 px-2 py-1.5 no-underline transition-colors ${
                      isActive
                        ? "bg-[#000080] text-white"
                        : "text-[#000080] hover:bg-[#000080] hover:text-white"
                    }`}
                    onClick={() => setOpen(false)}
                  >
                    <span
                      className={`flex h-7 w-7 shrink-0 items-center justify-center ${
                        isActive
                          ? "text-white"
                          : "text-[#000080] group-hover:text-white"
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                    </span>
                    <span className="min-w-0 flex-1">{label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      ) : null}
    </div>
  );
}
