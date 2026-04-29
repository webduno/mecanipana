"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ComponentType } from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  IconCombustible,
  IconCuenta,
  IconHistorial,
  IconMantenimiento,
  IconNota,
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

type SubEntry = {
  href: string;
  label: string;
  Icon: ComponentType<{ className?: string }>;
};

type NavEntry = {
  href: string;
  label: string;
  Icon: ComponentType<{ className?: string }>;
  children?: SubEntry[];
};

const MAIN_NAV: NavEntry[] = [
  {
    href: "/",
    label: "Inicio",
    Icon: IconInicio,
    children: [
      { href: "/resumen", label: "Resumen", Icon: IconResumen },
      { href: "/registrar-uso", label: "Registrar uso", Icon: IconRegistrar },
      { href: "/historial", label: "Historial", Icon: IconHistorial },
    ],
  },
  {
    href: "/resumen",
    label: "Resumen",
    Icon: IconResumen,
    children: [
      { href: "/recordatorios", label: "Recordatorios", Icon: IconRecordatorios },
      { href: "/mantenimiento", label: "Mantenimiento", Icon: IconMantenimiento },
      { href: "/combustible", label: "Combustible", Icon: IconCombustible },
    ],
  },
  {
    href: "/datos-vehiculo",
    label: "Datos del vehículo",
    Icon: IconVehiculo,
    children: [
      {
        href: "/datos-vehiculo/cuestionario",
        label: "Cuestionario",
        Icon: IconNota,
      },
      { href: "/opciones", label: "Opciones de tema", Icon: IconOpciones },
    ],
  },
  {
    href: "/combustible",
    label: "Combustible",
    Icon: IconCombustible,
    children: [
      { href: "/resumen", label: "Resumen", Icon: IconResumen },
      { href: "/historial", label: "Historial", Icon: IconHistorial },
    ],
  },
  {
    href: "/mantenimiento",
    label: "Mantenimiento",
    Icon: IconMantenimiento,
    children: [
      { href: "/recordatorios", label: "Recordatorios", Icon: IconRecordatorios },
      { href: "/resumen", label: "Resumen", Icon: IconResumen },
    ],
  },
  {
    href: "/recordatorios",
    label: "Recordatorios",
    Icon: IconRecordatorios,
    children: [
      { href: "/mantenimiento", label: "Mantenimiento", Icon: IconMantenimiento },
      { href: "/combustible", label: "Combustible", Icon: IconCombustible },
    ],
  },
  {
    href: "/opciones",
    label: "Opciones",
    Icon: IconOpciones,
    children: [
      { href: "/datos-vehiculo", label: "Datos del vehículo", Icon: IconVehiculo },
      { href: "/login", label: "Entrar", Icon: IconCuenta },
    ],
  },
  {
    href: "/historial",
    label: "Historial",
    Icon: IconHistorial,
    children: [
      { href: "/registrar-uso", label: "Registrar uso", Icon: IconRegistrar },
      { href: "/resumen", label: "Resumen", Icon: IconResumen },
    ],
  },
  {
    href: "/registrar-uso",
    label: "Registrar uso",
    Icon: IconRegistrar,
    children: [
      { href: "/historial", label: "Ver historial", Icon: IconHistorial },
      { href: "/combustible", label: "Combustible", Icon: IconCombustible },
    ],
  },
];

function normalizePath(path: string) {
  if (path.endsWith("/") && path.length > 1) return path.slice(0, -1);
  return path;
}

function isPathActive(active: string, href: string) {
  if (href === "/") return active === "/";
  return active === href || active.startsWith(`${href}/`);
}

function subMenuDomId(sectionHref: string) {
  if (sectionHref === "/") return "mecanipana-sub-inicio";
  return `mecanipana-sub-${sectionHref.slice(1).replace(/\//g, "-")}`;
}

export function MecanipanaNavbarBrand() {
  const pathname = usePathname() ?? "/";
  const active = normalizePath(pathname);
  const [open, setOpen] = useState(false);
  /** Hover-opens flyout when pointer-capable devices hover the row */
  const [hoverFlyout, setHoverFlyout] = useState<string | null>(null);
  /** Toggle from ▸ for touch / explicit control */
  const [clickFlyout, setClickFlyout] = useState<string | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const hoverCloseTimerRef = useRef<number | null>(null);

  const clearHoverCloseTimer = useCallback(() => {
    if (hoverCloseTimerRef.current != null) {
      window.clearTimeout(hoverCloseTimerRef.current);
      hoverCloseTimerRef.current = null;
    }
  }, []);

  const scheduleHoverClose = useCallback(() => {
    clearHoverCloseTimer();
    hoverCloseTimerRef.current = window.setTimeout(() => {
      setHoverFlyout(null);
    }, 140);
  }, [clearHoverCloseTimer]);

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

  useEffect(() => {
    if (!open) {
      setHoverFlyout(null);
      setClickFlyout(null);
      clearHoverCloseTimer();
    }
  }, [open, clearHoverCloseTimer]);

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
            {MAIN_NAV.map((entry) => {
              const { href, label, Icon, children } = entry;
              const kids = children?.length ? children : undefined;
              const isActive = isPathActive(active, href);
              const flyoutVisible =
                !!kids &&
                (hoverFlyout === href || clickFlyout === href);
              const subPanelId = subMenuDomId(href);

              return (
                <li
                  key={href}
                  className="relative m-0"
                  onMouseEnter={() => {
                    if (!kids) return;
                    clearHoverCloseTimer();
                    setHoverFlyout(href);
                  }}
                  onMouseLeave={() => {
                    if (!kids) return;
                    scheduleHoverClose();
                  }}
                >
                  <div className="flex min-w-0 items-stretch">
                    <Link
                      href={href}
                      className={`group flex min-w-0 flex-1 items-center gap-2 px-2 py-1.5 no-underline transition-colors ${
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
                    {kids ? (
                      <button
                        type="button"
                        className={`shrink-0 border-0 px-2 py-1.5 leading-none hover:bg-[#000080] hover:text-white ${
                          flyoutVisible
                            ? "bg-[#000080] text-white"
                            : "bg-transparent text-[#000080]"
                        }`}
                        aria-label={`Más: ${label}`}
                        aria-expanded={flyoutVisible}
                        aria-controls={subPanelId}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          clearHoverCloseTimer();
                          setHoverFlyout(null);
                          setClickFlyout((c) =>
                            c === href ? null : href
                          );
                        }}
                      >
                        <span aria-hidden className="text-[0.75rem]">
                          ▸
                        </span>
                      </button>
                    ) : null}
                  </div>
                  {kids && flyoutVisible ? (
                    <div
                      id={subPanelId}
                      className="absolute left-full top-0 z-[110] ml-[-2px] min-w-[min(16rem,calc(100vw-3rem))] border-2 border-[#808080] bg-[#c0c0c0] py-0.5 shadow-[2px_2px_0_#000]"
                      role="navigation"
                      aria-label={`Enlaces relacionados: ${label}`}
                      onMouseEnter={() => {
                        clearHoverCloseTimer();
                        setHoverFlyout(href);
                      }}
                      onMouseLeave={() => scheduleHoverClose()}
                    >
                      <ul className="m-0 max-h-[min(65vh,24rem)] list-none overflow-y-auto p-0">
                        {kids.map(({ href: subHref, label: subLabel, Icon: SubIcon }) => {
                          const subActive = isPathActive(active, subHref);
                          return (
                            <li key={subHref} className="m-0">
                              <Link
                                href={subHref}
                                className={`group flex items-center gap-2 px-2 py-1.5 no-underline transition-colors ${
                                  subActive
                                    ? "bg-[#000080] text-white"
                                    : "text-[#000080] hover:bg-[#000080] hover:text-white"
                                }`}
                                onClick={() => {
                                  setOpen(false);
                                  setHoverFlyout(null);
                                  setClickFlyout(null);
                                }}
                              >
                                <span
                                  className={`flex h-6 w-6 shrink-0 items-center justify-center ${
                                    subActive
                                      ? "text-white"
                                      : "text-[#000080] group-hover:text-white"
                                  }`}
                                >
                                  <SubIcon className="h-[1.15rem] w-[1.15rem]" />
                                </span>
                                <span className="min-w-0 flex-1 text-[0.94em]">
                                  {subLabel}
                                </span>
                              </Link>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  ) : null}
                </li>
              );
            })}
          </ul>
        </nav>
      ) : null}
    </div>
  );
}
