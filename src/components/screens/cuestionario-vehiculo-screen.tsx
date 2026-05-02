"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import {
  appendMaintenance,
  appendQuestionnaireParagraphToVehicleNotes,
  readSelectedVehicle,
} from "@/lib/local-storage-data";
import { pushMaintenanceEntryRemote } from "@/lib/remote/sync-log-entries-remote";
import { VehicleSetupGate } from "@/components/vehicle-setup-gate";

/** Valor interno de la última opción (captura abierta tipo “Other”); la etiqueta visible es {@link OPT_OTHER_LABEL}. */
const OPT_TEXT = "__mp_text__";
/** Equivalente habitual en español a “Other (please specify)” en formularios y encuestas. */
const OPT_OTHER_LABEL = "Otro (especificar)";

type KM = "" | "<50k" | "50-120k" | "120-200k" | "200k+" | typeof OPT_TEXT;

type FormState = {
  kmBanda: KM;
  kmLibre: string;
  uso: string;
  usoLibre: string;
  frenos: string;
  frenosLibre: string;
  luces: string;
  lucesLibre: string;
  ruidos: string;
  ruidosLibre: string;
  cauchos: string;
  cauchosLibre: string;
  aceite: string;
  aceiteLibre: string;
  climaArranque: string;
  climaLibre: string;
};

const EMPTY_FORM: FormState = {
  kmBanda: "",
  kmLibre: "",
  uso: "",
  usoLibre: "",
  frenos: "",
  frenosLibre: "",
  luces: "",
  lucesLibre: "",
  ruidos: "",
  ruidosLibre: "",
  cauchos: "",
  cauchosLibre: "",
  aceite: "",
  aceiteLibre: "",
  climaArranque: "",
  climaLibre: "",
};

function lineTextoOEleccion(choice: string, libre: string): string {
  if (choice === OPT_TEXT) return libre.trim() || "—";
  return choice || "—";
}

/** Nota del mantenimiento; el campo `what` en submit usa texto que encaja con la heurística de aceite en local-storage-data. */
function aceiteQuestionnaireMaintenanceNote(f: FormState): string {
  const detail =
    f.aceite === OPT_TEXT
      ? f.aceiteLibre.trim() || "(sin detalle)"
      : f.aceite.trim();
  return `Cuestionario vehículo · último aceite/revisión: ${detail}`;
}

function buildBody(f: FormState): string {
  const lines = [
    "1 · Kilometraje (rango rápido): " + lineTextoOEleccion(f.kmBanda || "", f.kmLibre),
    "2 · Uso principal: " + lineTextoOEleccion(f.uso || "", f.usoLibre),
    "3 · Frenos (sensación al frenar): " + lineTextoOEleccion(f.frenos || "", f.frenosLibre),
    "4 · Luces/check en tablero: " + lineTextoOEleccion(f.luces || "", f.lucesLibre),
    "5 · Ruidos o vibraciones raras nuevas: " + lineTextoOEleccion(f.ruidos || "", f.ruidosLibre),
    "6 · Llantas/cauchos percibidos: " + lineTextoOEleccion(f.cauchos || "", f.cauchosLibre),
    "7 · Último aceite o última revisión importante (fecha aprox.): " +
      lineTextoOEleccion(f.aceite || "", f.aceiteLibre),
    "8 · Estado de la batería: " + lineTextoOEleccion(f.climaArranque || "", f.climaLibre),
  ];
  return lines.join("\n");
}

function showDetailKm(f: FormState): boolean {
  return f.kmBanda === OPT_TEXT;
}

const detailLabelClass =
  "text-[0.7rem] font-bold uppercase tracking-wide text-[#707070]";

export function CuestionarioVehiculoScreen() {
  const router = useRouter();
  const vehicle = readSelectedVehicle();
  const modeloLine = [vehicle.line.trim(), vehicle.variant.trim()].filter(Boolean).join(" · ");
  const [form, setForm] = useState<FormState>(EMPTY_FORM);

  function submit(e: FormEvent) {
    e.preventDefault();
    appendQuestionnaireParagraphToVehicleNotes(buildBody(form));
    if (form.aceite.trim() !== "") {
      const row = appendMaintenance({
        urgencia: 50,
        at: new Date().toISOString(),
        what: "Aceite motor (dato cuestionario)",
        note: aceiteQuestionnaireMaintenanceNote(form),
        locationLabel: "",
        locationLat: null,
        locationLon: null,
        paidBs: "",
        contactId: null,
      });
      void pushMaintenanceEntryRemote(row);
    }
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
          <p className="win98-muted m-2 mb-0 text-sm leading-snug">
            Completa las 8 preguntas para guardar en las notas del vehículo.
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
              <option value={OPT_TEXT}>{OPT_OTHER_LABEL}</option>
            </select>
            {showDetailKm(form) ? (
              <>
                <label className={`${detailLabelClass} mt-2 block`} htmlFor="q-km-libre">
                  Tu respuesta
                </label>
                <input
                  id="q-km-libre"
                  type="text"
                  className="win98-input mt-1 max-w-xl"
                  autoComplete="off"
                  placeholder="Describe el kilometraje o lo que aplique"
                  maxLength={120}
                  value={form.kmLibre}
                  onChange={(e) => setForm((f) => ({ ...f, kmLibre: e.target.value }))}
                />
              </>
            ) : null}
          </div>

          <div className="win98-field-group">
            <label className={labelClass} htmlFor="q-uso">
              2. Uso principal del día a día
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
              <option value={OPT_TEXT}>{OPT_OTHER_LABEL}</option>
            </select>
            {form.uso === OPT_TEXT ? (
              <>
                <label className={`${detailLabelClass} mt-2 block`} htmlFor="q-uso-libre">
                  Tu respuesta
                </label>
                <input
                  id="q-uso-libre"
                  type="text"
                  className="win98-input mt-1 max-w-xl"
                  autoComplete="off"
                  placeholder="Ej. trabajo + fines de semana fuera"
                  maxLength={120}
                  value={form.usoLibre}
                  onChange={(e) => setForm((f) => ({ ...f, usoLibre: e.target.value }))}
                />
              </>
            ) : null}
          </div>

          <div className="win98-field-group">
            <label className={labelClass} htmlFor="q-fren">
              3. ¿Cómo sientes los frenos al frenar?
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
              <option value={OPT_TEXT}>{OPT_OTHER_LABEL}</option>
            </select>
            {form.frenos === OPT_TEXT ? (
              <>
                <label className={`${detailLabelClass} mt-2 block`} htmlFor="q-fren-libre">
                  Tu respuesta
                </label>
                <input
                  id="q-fren-libre"
                  type="text"
                  className="win98-input mt-1 max-w-xl"
                  autoComplete="off"
                  placeholder="Ej. vibra el pedal en bajada"
                  maxLength={160}
                  value={form.frenosLibre}
                  onChange={(e) => setForm((f) => ({ ...f, frenosLibre: e.target.value }))}
                />
              </>
            ) : null}
          </div>

          <div className="win98-field-group">
            <label className={labelClass} htmlFor="q-luces">
              4. ¿Luces/check encendidas en tablero?
            </label>
            <select
              id="q-luces"
              className="win98-select mt-1 max-w-xl w-full"
              value={form.luces}
              onChange={(e) => setForm((f) => ({ ...f, luces: e.target.value }))}
            >
              <option value="">— Elige —</option>
              <option value="Nada encendido">Nada encendido</option>
              <option value="Solo testigos al encender, luego apagan">
                Solo testigos al encender, luego apagan
              </option>
              <option value="Motor (check engine)">Motor (check engine)</option>
              <option value="Aceite o presión de aceite">Aceite o presión de aceite</option>
              <option value="Batería o carga (alternador)">Batería o carga (alternador)</option>
              <option value="Temperatura o refrigerante">Temperatura o refrigerante</option>
              <option value="ABS, ESP o control de tracción">ABS, ESP o control de tracción</option>
              <option value="Airbag">Airbag</option>
              <option value="Neumáticos / presión baja (TPMS)">Neumáticos / presión baja (TPMS)</option>
              <option value="Freno de mano o líquido de frenos">Freno de mano o líquido de frenos</option>
              <option value="EPB (freno de estacionamiento eléctrico)">EPB (freno de estacionamiento eléctrico)</option>
              <option value="Varias encendidas o no identifico cuál">Varias encendidas o no identifico cuál</option>
              <option value="Intermitentes o van y vienen">Intermitentes o van y vienen</option>
              <option value="No sé / no revisé">No sé / no revisé</option>
              <option value={OPT_TEXT}>{OPT_OTHER_LABEL}</option>
            </select>
            {form.luces === OPT_TEXT ? (
              <>
                <label className={`${detailLabelClass} mt-2 block`} htmlFor="q-luces-libre">
                  Tu respuesta
                </label>
                <input
                  id="q-luces-libre"
                  type="text"
                  className="win98-input mt-1 max-w-xl"
                  autoComplete="off"
                  placeholder="Ej. amarilla de motor desde ayer"
                  maxLength={160}
                  value={form.lucesLibre}
                  onChange={(e) => setForm((f) => ({ ...f, lucesLibre: e.target.value }))}
                />
              </>
            ) : null}
          </div>

          <div className="win98-field-group">
            <label className={labelClass} htmlFor="q-ruidos">
              5. Ruidos o vibraciones
            </label>
            <select
              id="q-ruidos"
              className="win98-select mt-1 max-w-xl w-full"
              value={form.ruidos}
              onChange={(e) => setForm((f) => ({ ...f, ruidos: e.target.value }))}
            >
              <option value="">— Elige —</option>
              <option value="Ninguno / igual que siempre">Ninguno / igual que siempre</option>
              <option value="Vibración al frenar">Vibración al frenar</option>
              <option value="Vibración a cierta velocidad">Vibración a cierta velocidad</option>
              <option value="Vibración al acelerar o al subir pendiente">Vibración al acelerar o al subir pendiente</option>
              <option value="Ruido o crujido al girar el volante">Ruido o crujido al girar el volante</option>
              <option value="Ruido en baches o suspensión">Ruido en baches o suspensión</option>
              <option value="Motor suena distinto">Motor suena distinto</option>
              <option value="Caja o transmisión">Caja o transmisión</option>
              <option value="Llantas o rodamiento">Llantas o rodamiento</option>
              <option value="Varias cosas / no ubico el origen">Varias cosas / no ubico el origen</option>
              <option value="Solo en frío o recién arrancado">Solo en frío o recién arrancado</option>
              <option value="No sé / no lo he notado bien">No sé / no lo he notado bien</option>
              <option value={OPT_TEXT}>{OPT_OTHER_LABEL}</option>
            </select>
            {form.ruidos === OPT_TEXT ? (
              <>
                <label className={`${detailLabelClass} mt-2 block`} htmlFor="q-ruidos-libre">
                  Tu respuesta
                </label>
                <textarea
                  id="q-ruidos-libre"
                  className="win98-textarea mt-1 min-h-[3.5rem]"
                  maxLength={800}
                  value={form.ruidosLibre}
                  placeholder="Ej. cruje solo al girar derecha; empezó hace una semana"
                  onChange={(e) => setForm((f) => ({ ...f, ruidosLibre: e.target.value }))}
                />
              </>
            ) : null}
          </div>

          <div className="win98-field-group">
            <label className={labelClass} htmlFor="q-cauchos">
              6. Estado general de llantas/cauchos
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
              <option value={OPT_TEXT}>{OPT_OTHER_LABEL}</option>
            </select>
            {form.cauchos === OPT_TEXT ? (
              <>
                <label className={`${detailLabelClass} mt-2 block`} htmlFor="q-cauchos-libre">
                  Tu respuesta
                </label>
                <input
                  id="q-cauchos-libre"
                  type="text"
                  className="win98-input mt-1 max-w-xl"
                  autoComplete="off"
                  placeholder="Ej. delanteros más gastados; un pinchazo reciente"
                  maxLength={160}
                  value={form.cauchosLibre}
                  onChange={(e) => setForm((f) => ({ ...f, cauchosLibre: e.target.value }))}
                />
              </>
            ) : null}
          </div>

          <div className="win98-field-group">
            <label className={labelClass} htmlFor="q-ace">
              7. Último aceite motor o última revisión importante
            </label>
            <select
              id="q-ace"
              className="win98-select mt-1 max-w-xl w-full"
              value={form.aceite}
              onChange={(e) => setForm((f) => ({ ...f, aceite: e.target.value }))}
            >
              <option value="">— Elige —</option>
              <option value="Reciente (menos de 6 meses)">Reciente (menos de 6 meses)</option>
              <option value="Hace unos 6–12 meses">Hace unos 6–12 meses</option>
              <option value="Hace más de un año">Hace más de un año</option>
              <option value="No recuerdo">No recuerdo</option>
              <option value="Lo llevo al taller con cierta frecuencia (sin fecha clara)">
                Lo llevo al taller con cierta frecuencia (sin fecha clara)
              </option>
              <option value="Nunca me ha tocado con este carro">Nunca me ha tocado con este carro</option>
              <option value={OPT_TEXT}>{OPT_OTHER_LABEL}</option>
            </select>
            {form.aceite === OPT_TEXT ? (
              <>
                <label className={`${detailLabelClass} mt-2 block`} htmlFor="q-ace-libre">
                  Tu respuesta
                </label>
                <textarea
                  id="q-ace-libre"
                  className="win98-textarea mt-1 min-h-[3.5rem]"
                  maxLength={800}
                  value={form.aceiteLibre}
                  placeholder="Ej. aceite mayo 2024 — taller X"
                  onChange={(e) => setForm((f) => ({ ...f, aceiteLibre: e.target.value }))}
                />
              </>
            ) : null}
          </div>

          <div className="win98-field-group">
            <label className={labelClass} htmlFor="q-bateria">
              8. Estado de la batería
            </label>
            <select
              id="q-bateria"
              className="win98-select mt-1 max-w-xl w-full"
              value={form.climaArranque}
              onChange={(e) => setForm((f) => ({ ...f, climaArranque: e.target.value }))}
            >
              <option value="">— Elige —</option>
              <option value="Nueva">Nueva</option>
              <option value="Usada">Usada</option>
              <option value="Dañada">Dañada</option>
              <option value="No estoy seguro">No estoy seguro</option>
              <option value={OPT_TEXT}>{OPT_OTHER_LABEL}</option>
            </select>
            {form.climaArranque === OPT_TEXT ? (
              <>
                <label className={`${detailLabelClass} mt-2 block`} htmlFor="q-bateria-libre">
                  Tu respuesta
                </label>
                <textarea
                  id="q-bateria-libre"
                  className="win98-textarea mt-1 min-h-[4rem]"
                  maxLength={1200}
                  value={form.climaLibre}
                  placeholder="Ej. reconstruida, no arranca en frío, la cambié en…"
                  onChange={(e) => setForm((f) => ({ ...f, climaLibre: e.target.value }))}
                />
              </>
            ) : null}
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
