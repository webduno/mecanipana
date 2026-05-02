"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  loadVehicleNotes,
  readSelectedVehicle,
  saveVehicleNotes,
} from "@/lib/local-storage-data";
import { VehicleSetupGate } from "@/components/vehicle-setup-gate";

export function DatosVehiculoScreen() {
  const [line, setLine] = useState("");
  const [variant, setVariant] = useState("");
  const [notes, setNotes] = useState("");

  function refreshFromStorage() {
    const v = readSelectedVehicle();
    setLine(v.line);
    setVariant(v.variant);
    setNotes(loadVehicleNotes());
  }

  useEffect(() => {
    refreshFromStorage();
    const onVehicle = () => refreshFromStorage();
    window.addEventListener("mecanipana:vehicle", onVehicle as EventListener);
    return () => {
      window.removeEventListener("mecanipana:vehicle", onVehicle as EventListener);
    };
  }, []);

  useEffect(() => {
    const t = window.setTimeout(() => {
      saveVehicleNotes(notes);
    }, 400);
    return () => window.clearTimeout(t);
  }, [notes]);

  const vehicleLine = [line.trim(), variant.trim()].filter(Boolean).join(" · ");

  return (
    <VehicleSetupGate>
      <div className="flex flex-col gap-2">
        <p className="m-0 text-pretty font-semibold">Tu modelo y tus notas</p>
        <p className="m-0 text-pretty">
          El modelo lo eliges en la barra azul con <strong>Mi Info</strong> →{" "}
          <strong>Este equipo</strong> → pestaña <strong>Carro</strong>. Aquí solo se muestra
          esa elección (línea y versión). Las notas son libres: placa, color, lo que quieras
          recordar. Todo se guarda solo en este navegador.
        </p>
      </div>

      <div className="win98-inset">
        <p className="win98-label m-0">Modelo (Mi Info → Carro)</p>
        {vehicleLine !== "" ? (
          <p className="m-2 mb-0 text-lg font-bold">{vehicleLine}</p>
        ) : (
          <div className="m-2 mb-0 space-y-2">
            <p className="m-0 text-pretty">
              Pulsa <strong>Mi Info</strong> (arriba a la derecha en la barra azul), abre{" "}
              <strong>Este equipo</strong> y en la pestaña <strong>Carro</strong> elige línea y
              versión.
            </p>
            <p className="m-0">
              <Link href="/" className="font-semibold underline underline-offset-2">
                Ir al tablero principal
              </Link>
              <span className="text-[#505050]"> — ahí también está el botón Mi Info.</span>
            </p>
          </div>
        )}
        <div className="m-2 mt-3 flex flex-wrap items-baseline gap-x-2 gap-y-1 text-sm">
          <button
            type="button"
            className="m-0 cursor-pointer border-0 bg-transparent p-0 text-[0.82rem] text-[#505050] underline underline-offset-2 hover:text-[#000080]"
            onClick={refreshFromStorage}
          >
            Volver a leer lo guardado
          </button>
          <span className="win98-muted m-0 text-[0.78rem]">
            Úsalo si cambiaste marca o versión en Mi Info y esta pantalla no se ha actualizado.
          </span>
        </div>
      </div>

      {notes.trim() === "" ? (
        <div className="win98-inset">
          <p className="m-0 text-pretty font-semibold">Estado del carro (opcional)</p>
          <p className="win98-muted mt-1 mb-2 text-[0.95rem]">
            Si todavía no escribiste nada, puedes contestar 8 preguntas breves (sin repetir modelo ni
            año) y te lo volcamos a las notas.
          </p>
          <Link
            href="/datos-vehiculo/cuestionario"
            className="win98-btn inline-flex max-w-full items-center justify-center text-center"
          >
            Rellenar cuestionario rápido (8 preguntas)
          </Link>
        </div>
      ) : null}

      <div className="win98-form-row">
        <label className="win98-label" htmlFor="veh-notas">
          Notas del vehículo
        </label>
        <textarea
          id="veh-notas"
          className="win98-textarea"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Ej.: placa, nombre que le pusiste al carro, detalles del Siena…"
          maxLength={8000}
        />
        <p className="win98-muted m-0">
          Se guarda solo en este navegador, unos instantes después de escribir.
        </p>
      </div>
    </VehicleSetupGate>
  );
}
