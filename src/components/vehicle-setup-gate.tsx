"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { isVehicleProfileComplete } from "@/lib/local-storage-data";

/** Client-only: después de hidratar, refleja `localStorage` y eventos `mecanipana:vehicle`. */
export function useVehicleSetupReady() {
  const [mounted, setMounted] = useState(false);
  const [complete, setComplete] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const sync = () => setComplete(isVehicleProfileComplete());
    sync();
    const handler = () => sync();
    window.addEventListener("mecanipana:vehicle", handler);
    window.addEventListener("storage", handler as (e: StorageEvent) => void);
    window.addEventListener("focus", handler);
    return () => {
      window.removeEventListener("mecanipana:vehicle", handler);
      window.removeEventListener("storage", handler as (e: StorageEvent) => void);
      window.removeEventListener("focus", handler);
    };
  }, [mounted]);

  return { mounted, complete };
}

export function VehicleSetupBlocked() {
  return (
    <div className="flex flex-col gap-3">
      <div className="win98-inset">
        <p className="m-0 font-bold text-[#000080]">Primero tu carro</p>
        <p className="mt-2 mb-0 text-pretty">
          Abre{" "}
          <strong className="font-semibold">Mi Info</strong>{" "}
          (arriba a la derecha, el botón con el ícono que destaca cuando falta configurar).
          Dentro ve a la pestaña <strong>Carro</strong> y elige{" "}
          <strong>marca</strong>, <strong>modelo</strong>,{" "}
          <strong>año</strong> y <strong>motor/cilindraje</strong>.
        </p>
        <p className="mb-0 text-pretty">
          Así todas las pantallas pueden guardar registros coherentes para{" "}
          <em>este</em> vehículo. Los datos siguen solo en este navegador.
        </p>
      </div>
      <p className="m-0">
        <Link
          href="/"
          className="font-semibold underline underline-offset-2 text-[#000080]"
        >
          Volver al tablero principal
        </Link>
      </p>
    </div>
  );
}

export function VehicleSetupGate({ children }: { children: ReactNode }) {
  const { mounted, complete } = useVehicleSetupReady();

  if (!mounted) {
    return <p className="win98-muted m-0 text-sm">Cargando…</p>;
  }

  if (!complete) {
    return <VehicleSetupBlocked />;
  }

  return <>{children}</>;
}
