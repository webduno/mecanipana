"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { appendQuestionnaireParagraphToVehicleNotes, readSelectedVehicle } from "@/lib/local-storage-data";
import { VehicleSetupGate } from "@/components/vehicle-setup-gate";

type KM = "" | "<50k" | "50-120k" | "120-200k" | "200k+";

type FormState = {
  kmBanda: KM;
  odometro: string;
  uso: string;
  frenos: string;
  luces: string;
  ruidos: string;
  cauchos: string;
  aceite: string;
  climaArranque: string;
};

const EMPTY_FORM: FormState = {
  kmBanda: "",
  odometro: "",
  uso: "",
  frenos: "",
  luces: "",
  ruidos: "",
  cauchos: "",
  aceite: "",
  climaArranque: "",
};

function buildBody(f: FormState): string {
  const lines = [
    "1 · Kilometraje (rango rápido): " + (f.kmBanda || "—"),
    f.odometro.trim()
      ? "2 · Odómetro/referencia en km si lo tienes: " + f.odometro.trim()
      : "2 · Odómetro exacto: —",
    "3 · Uso principal: " + (f.uso || "—"),
    "4 · Frenos (sensación al frenar): " + (f.frenos || "—"),
    "5 · Luces/check en tablero: " + (f.luces || "—"),
    "6 · Ruidos o vibraciones raras nuevas: " + (f.ruidos.trim() || "—"),
    "7 · Llantas/cauchos percibidos: " + (f.cauchos || "—"),
    "8 · Último aceite o última revisión importante (fecha aprox.): " + (f.aceite.trim() || "—"),
    "9 · Climatización y arranque/batería hoy (frío/calor, síntomas…): " + (f.climaArranque.trim() || "—"),
  ];
  return lines.join("\n");
}

export function CuestionarioVehiculoScreen() {
  const router = useRouter();
  const vehicle = readSelectedVehicle();
  const modeloLine = [vehicle.line.trim(), vehicle.variant.trim()].filter(Boolean).join(" · ");
  const [form, setForm] = useState<FormState>(EMPTY_FORM);

  function submit(e: FormEvent) {
    e.preventDefault();
    appendQuestionnaireParagraphToVehicleNotes(buildBody(form));
    router.push("/datos-vehiculo");
  }

  const labelClass =
    "text-[0.75rem] font-extrabold uppercase tracking-wide text-[#505050]";

  return (
    <VehicleSetupGate>
      <form className="flex flex-col gap-4" onSubmit={submit}>
        <div className="win98-inset">
          <p className="win98-muted m-0 text-sm font-semibold">Tu carro (ya configurado)</p>
          <p className="m-2 mb-0 text-lg font-bold leading-snug text-pretty">
            {modeloLine}
          </p>
          <p className="win98-muted m-0 text-sm leading-snug">
            No repetimos marca, modelo ni año: vienen de <strong>Mi Info</strong>. Este cuestionario
            solo registra cómo anda el vehículo ahora.
          </p>
        </div>

          <div className="win98-field-group">
            <label className={labelClass} htmlFor="q-km">
              1. Kilometraje aproximado (elige una banda)
            </label>
            <select
              id="q-km"
              className="win98-select mt-1 w-full max-w-md"
              value={form.kmBanda}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  kmBanda: e.target.value as KM,
                }))
              }
            >
              <option value="">— Elige —</option>
              <option value="<50k">Menos de 50 000 km</option>
              <option value="50-120k">50 000 a 120 000 km</option>
              <option value="120-200k">120 000 a 200 000 km</option>
              <option value="200k+">Más de 200 000 km</option>
            </select>
          </div>

          <div className="win98-field-group">
            <label className={labelClass} htmlFor="q-odo">
              2. Si tienes kilometraje exacto del odómetro, escribe aquí (opcional)
            </label>
            <input
              id="q-odo"
              type="text"
              className="win98-input mt-1 max-w-md"
              autoComplete="off"
              placeholder="Ej. 187 420 km — o déjalo vacío"
              maxLength={80}
              value={form.odometro}
              onChange={(e) => setForm((f) => ({ ...f, odometro: e.target.value }))}
            />
          </div>

          <div className="win98-field-group">
            <label className={labelClass} htmlFor="q-uso">
              3. Uso principal del día a día
            </label>
            <select
              id="q-uso"
              className="win98-select mt-1 max-w-xl w-full"
              value={form.uso}
              onChange={(e) => setForm((f) => ({ ...f, uso: e.target.value }))}
            >
              <option value="">— Elige —</option>
              <option value="Sobre todo ciudad corta">Sobre todo ciudad corta</option>
              <option value="Ciudad + algo de carretera">Ciudad + algo de carretera</option>
              <option value="Mucha carretera o viajes largos">
                Mucha carretera o viajes largos
              </option>
            </select>
          </div>

          <div className="win98-field-group">
            <label className={labelClass} htmlFor="q-fren">
              4. ¿Cómo sientes los frenos al frenar?
            </label>
            <select
              id="q-fren"
              className="win98-select mt-1 max-w-xl w-full"
              value={form.frenos}
              onChange={(e) => setForm((f) => ({ ...f, frenos: e.target.value }))}
            >
              <option value="">— Elige —</option>
              <option value="Normales">Normales</option>
              <option value="Algo raro (ruido o pedal…)">Algo raro (ruido o pedal…)</option>
              <option value="Mejor revisarlos ya">Mejor revisarlos ya</option>
            </select>
          </div>

          <div className="win98-field-group">
            <label className={labelClass} htmlFor="q-luces">
              5. ¿Luces/check encendidas en tablero?
            </label>
            <select
              id="q-luces"
              className="win98-select mt-1 max-w-xl w-full"
              value={form.luces}
              onChange={(e) => setForm((f) => ({ ...f, luces: e.target.value }))}
            >
              <option value="">— Elige —</option>
              <option value="Nada encendido">Nada encendido</option>
              <option value="Sí, algo encendido o intermitente">Sí, algo encendido o intermitente</option>
              <option value="No sé / no revisé">No sé / no revisé</option>
            </select>
          </div>

          <div className="win98-field-group">
            <label className={labelClass} htmlFor="q-ruidos">
              6. Ruidos o vibraciones nuevas que no pasaban antes
            </label>
            <textarea
              id="q-ruidos"
              className="win98-textarea mt-1 min-h-[4.5rem]"
              maxLength={800}
              value={form.ruidos}
              placeholder="Ej. cruje solo al girar derecha — o ninguno"
              onChange={(e) => setForm((f) => ({ ...f, ruidos: e.target.value }))}
            />
          </div>

          <div className="win98-field-group">
            <label className={labelClass} htmlFor="q-cauchos">
              7. Estado general percibido de llantas/cauchos
            </label>
            <select
              id="q-cauchos"
              className="win98-select mt-1 max-w-xl w-full"
              value={form.cauchos}
              onChange={(e) => setForm((f) => ({ ...f, cauchos: e.target.value }))}
            >
              <option value="">— Elige —</option>
              <option value="En buen estado">En buen estado</option>
              <option value="Desgaste visible">Desgaste visible</option>
              <option value="Conviene cambiar pronto">Conviene cambiar pronto</option>
            </select>
          </div>

          <div className="win98-field-group">
            <label className={labelClass} htmlFor="q-ace">
              8. Último aceite motor o última revisión importante (fecha aproximada si la recuerdas)
            </label>
            <textarea
              id="q-ace"
              className="win98-textarea mt-1 min-h-[4rem]"
              maxLength={800}
              value={form.aceite}
              placeholder="Ej. aceite mayo 2024 — taller X — o no recuerdo"
              onChange={(e) => setForm((f) => ({ ...f, aceite: e.target.value }))}
            />
          </div>

          <div className="win98-field-group">
            <label className={labelClass} htmlFor="q-clima">
              9. Climatización (calor/frío) y cómo anda el arranque o la batería últimamente
            </label>
            <textarea
              id="q-clima"
              className="win98-textarea mt-1 min-h-[5rem]"
              maxLength={1200}
              value={form.climaArranque}
              placeholder="Ej. A/C enfría poco desde hace meses; arranque rápido; batería con 3 años"
              onChange={(e) => setForm((f) => ({ ...f, climaArranque: e.target.value }))}
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button type="submit" className="win98-btn">
              Guardar en notas del vehículo y volver
            </button>
            <Link
              href="/datos-vehiculo"
              className="win98-muted text-[0.95rem] font-semibold underline underline-offset-2"
            >
              Cancelar sin guardar
            </Link>
          </div>

          <p className="win98-muted m-0 text-[0.9rem] leading-snug">
            Se guarda al final solo en este navegador, debajo del texto libre que ya tenías en notas del
            vehículo.
          </p>
        </form>
    </VehicleSetupGate>
  );
}
