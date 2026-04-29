"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { appendQuestionnaireParagraphToVehicleNotes, readSelectedVehicle } from "@/lib/local-storage-data";
import { VehicleSetupGate } from "@/components/vehicle-setup-gate";

type KM = "" | "<50k" | "50-120k" | "120-200k" | "200k+";

type FormState = {
  kmBanda: KM;
  kmLibre: string;
  odometroModo: string;
  odometroLibre: string;
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
  odometroModo: "",
  odometroLibre: "",
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

function withOptionalLibre(choice: string, libre: string): string {
  const c = choice || "—";
  const t = libre.trim();
  if (!t) return c;
  return `${c} · ${t}`;
}

function buildBody(f: FormState): string {
  const lines = [
    "1 · Kilometraje (rango rápido): " + withOptionalLibre(f.kmBanda || "", f.kmLibre),
    "2 · Odómetro: " + withOptionalLibre(f.odometroModo || "", f.odometroLibre),
    "3 · Uso principal: " + withOptionalLibre(f.uso || "", f.usoLibre),
    "4 · Frenos (sensación al frenar): " + withOptionalLibre(f.frenos || "", f.frenosLibre),
    "5 · Luces/check en tablero: " + withOptionalLibre(f.luces || "", f.lucesLibre),
    "6 · Ruidos o vibraciones raras nuevas: " + withOptionalLibre(f.ruidos || "", f.ruidosLibre),
    "7 · Llantas/cauchos percibidos: " + withOptionalLibre(f.cauchos || "", f.cauchosLibre),
    "8 · Último aceite o última revisión importante (fecha aprox.): " +
      withOptionalLibre(f.aceite || "", f.aceiteLibre),
    "9 · Climatización y arranque/batería hoy (frío/calor, síntomas…): " +
      withOptionalLibre(f.climaArranque || "", f.climaLibre),
  ];
  return lines.join("\n");
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
          <p className="win98-muted m-2 mb-0 text-sm leading-snug">
            En cada pregunta elige una opción y, si quieres, amplía abajo en texto libre.
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
            <label className={`${detailLabelClass} mt-2 block`} htmlFor="q-km-libre">
              Detalle opcional
            </label>
            <input
              id="q-km-libre"
              type="text"
              className="win98-input mt-1 max-w-xl"
              autoComplete="off"
              placeholder="Ej. no estoy seguro del odómetro — solo referencia"
              maxLength={120}
              value={form.kmLibre}
              onChange={(e) => setForm((f) => ({ ...f, kmLibre: e.target.value }))}
            />
          </div>

          <div className="win98-field-group">
            <label className={labelClass} htmlFor="q-odo-mod">
              2. Odómetro o referencia en km
            </label>
            <select
              id="q-odo-mod"
              className="win98-select mt-1 max-w-xl w-full"
              value={form.odometroModo}
              onChange={(e) => setForm((f) => ({ ...f, odometroModo: e.target.value }))}
            >
              <option value="">— Elige —</option>
              <option value="No tengo el dato a mano">No tengo el dato a mano</option>
              <option value="Lo sé aproximado">Lo sé aproximado</option>
              <option value="Lo tengo exacto (tablero)">Lo tengo exacto (tablero)</option>
              <option value="Prefiero solo el comentario de abajo">Prefiero solo el comentario de abajo</option>
            </select>
            <label className={`${detailLabelClass} mt-2 block`} htmlFor="q-odo-libre">
              Número o aclaración (opcional)
            </label>
            <input
              id="q-odo-libre"
              type="text"
              className="win98-input mt-1 max-w-md"
              autoComplete="off"
              placeholder="Ej. 187 420 km — o déjalo vacío"
              maxLength={80}
              value={form.odometroLibre}
              onChange={(e) => setForm((f) => ({ ...f, odometroLibre: e.target.value }))}
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
            <label className={`${detailLabelClass} mt-2 block`} htmlFor="q-uso-libre">
              Detalle opcional
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
            <label className={`${detailLabelClass} mt-2 block`} htmlFor="q-fren-libre">
              Detalle opcional
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
            </select>
            <label className={`${detailLabelClass} mt-2 block`} htmlFor="q-luces-libre">
              Detalle opcional
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
          </div>

          <div className="win98-field-group">
            <label className={labelClass} htmlFor="q-ruidos">
              6. Ruidos o vibraciones nuevas que no pasaban antes
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
            </select>
            <label className={`${detailLabelClass} mt-2 block`} htmlFor="q-ruidos-libre">
              Detalle opcional
            </label>
            <textarea
              id="q-ruidos-libre"
              className="win98-textarea mt-1 min-h-[3.5rem]"
              maxLength={800}
              value={form.ruidosLibre}
              placeholder="Ej. cruje solo al girar derecha; empezó hace una semana"
              onChange={(e) => setForm((f) => ({ ...f, ruidosLibre: e.target.value }))}
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
            <label className={`${detailLabelClass} mt-2 block`} htmlFor="q-cauchos-libre">
              Detalle opcional
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
          </div>

          <div className="win98-field-group">
            <label className={labelClass} htmlFor="q-ace">
              8. Último aceite motor o última revisión importante
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
            </select>
            <label className={`${detailLabelClass} mt-2 block`} htmlFor="q-ace-libre">
              Fecha, taller o aclaración (opcional)
            </label>
            <textarea
              id="q-ace-libre"
              className="win98-textarea mt-1 min-h-[3.5rem]"
              maxLength={800}
              value={form.aceiteLibre}
              placeholder="Ej. aceite mayo 2024 — taller X"
              onChange={(e) => setForm((f) => ({ ...f, aceiteLibre: e.target.value }))}
            />
          </div>

          <div className="win98-field-group">
            <label className={labelClass} htmlFor="q-clima">
              9. Climatización (calor/frío) y arranque o batería
            </label>
            <select
              id="q-clima"
              className="win98-select mt-1 max-w-xl w-full"
              value={form.climaArranque}
              onChange={(e) => setForm((f) => ({ ...f, climaArranque: e.target.value }))}
            >
              <option value="">— Elige —</option>
              <option value="Todo bien (clima y arranque)">Todo bien (clima y arranque)</option>
              <option value="A/C enfría poco o nada">A/C enfría poco o nada</option>
              <option value="Calefacción calienta poco o nada">Calefacción calienta poco o nada</option>
              <option value="Arranque lento o cuesta arrancar">Arranque lento o cuesta arrancar</option>
              <option value="Batería nueva o dudosa (luces débiles, etc.)">
                Batería nueva o dudosa (luces débiles, etc.)
              </option>
              <option value="Varias cosas a la vez">Varias cosas a la vez</option>
              <option value="Prefiero detallar abajo">Prefiero detallar abajo</option>
            </select>
            <label className={`${detailLabelClass} mt-2 block`} htmlFor="q-clima-libre">
              Detalle opcional
            </label>
            <textarea
              id="q-clima-libre"
              className="win98-textarea mt-1 min-h-[4rem]"
              maxLength={1200}
              value={form.climaLibre}
              placeholder="Ej. A/C enfría poco desde hace meses; batería con 3 años"
              onChange={(e) => setForm((f) => ({ ...f, climaLibre: e.target.value }))}
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
