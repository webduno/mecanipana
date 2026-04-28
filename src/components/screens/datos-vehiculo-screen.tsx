"use client";

import { useEffect, useState } from "react";
import {
  loadVehicleNotes,
  readSelectedVehicle,
  saveVehicleNotes,
} from "@/lib/local-storage-data";

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
  }, []);

  useEffect(() => {
    const t = window.setTimeout(() => {
      saveVehicleNotes(notes);
    }, 400);
    return () => window.clearTimeout(t);
  }, [notes]);

  return (
    <>
      <p className="m-0 text-pretty">
        Lo que elegiste en el inicio y notas tuyas (placa, color, detalles). Se guarda
        en este navegador.
      </p>

      <div className="win98-inset">
        <p className="win98-label m-0">Carro (desde inicio)</p>
        <p className="m-2 mb-0 text-lg font-bold">
          {line || "—"} {variant ? `· ${variant}` : ""}
        </p>
        <div className="win98-form-actions">
          <button type="button" className="win98-btn" onClick={refreshFromStorage}>
            Actualizar desde inicio
          </button>
        </div>
      </div>

      <div className="win98-form-row">
        <label className="win98-label" htmlFor="veh-notas">
          Notas del carro
        </label>
        <textarea
          id="veh-notas"
          className="win98-textarea"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Placa, nombre del carro, detalles del Siena, etc."
          maxLength={8000}
        />
        <p className="win98-muted m-0">Se guarda solo al escribir (un momentico).</p>
      </div>
    </>
  );
}
