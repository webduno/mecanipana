"use client";

import Link from "next/link";
import { useState } from "react";
import {
  clearAllMecanipanaKeys,
  exportAllLocalPayload,
  importAllLocalPayload,
  loadAppOptions,
  saveAppOptions,
} from "@/lib/local-storage-data";
import { THEME_IDS, type ThemeId } from "@/lib/mecanipana-types";
import { applyThemeToDocument, themeDisplayLabel } from "@/lib/theme-ui";

function applyFontClass(fuentesGrandes: boolean) {
  if (fuentesGrandes) document.body.classList.add("mp-font-lg");
  else document.body.classList.remove("mp-font-lg");
}

export function OpcionesScreen() {
  const [opts, setOpts] = useState(() => loadAppOptions());
  const [exportText, setExportText] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  function onToggleFuentes(checked: boolean) {
    const next = { ...opts, fuentesGrandes: checked };
    saveAppOptions(next);
    setOpts(next);
    applyFontClass(checked);
    setMsg(checked ? "Letra más grande en esta pantalla." : "Letra normal.");
    setTimeout(() => setMsg(null), 2500);
  }

  function onThemeChange(theme: ThemeId) {
    const next = { ...opts, theme };
    saveAppOptions(next);
    setOpts(next);
    applyThemeToDocument(theme);
    setMsg(`Tema: ${themeDisplayLabel(theme)}`);
    setTimeout(() => setMsg(null), 2500);
  }

  function onExport() {
    const data = exportAllLocalPayload();
    const text = JSON.stringify(data, null, 2);
    setExportText(text);
    setMsg("Copia el texto de abajo si quieres un respaldo.");
  }

  async function onCopyExport() {
    const data = exportText ?? JSON.stringify(exportAllLocalPayload(), null, 2);
    if (!exportText) setExportText(data);
    try {
      await navigator.clipboard.writeText(data);
      setMsg("Copiado al portapapeles.");
    } catch {
      setMsg("No se pudo copiar. Selecciona el texto a mano.");
    }
    setTimeout(() => setMsg(null), 2500);
  }

  function onRestore() {
    const raw = (exportText ?? "").trim();
    if (!raw) {
      setMsg("Pega el respaldo en el cuadro o genera uno primero.");
      setTimeout(() => setMsg(null), 3000);
      return;
    }
    let parsed: unknown;
    try {
      parsed = JSON.parse(raw) as unknown;
    } catch {
      setMsg("El texto no es JSON válido.");
      setTimeout(() => setMsg(null), 3000);
      return;
    }
    if (
      !window.confirm(
        "¿Restaurar desde este respaldo? Se actualizarán los datos guardados para las claves que traiga el archivo."
      )
    ) {
      return;
    }
    try {
      importAllLocalPayload(parsed);
    } catch (e) {
      const text = e instanceof Error ? e.message : "Error al restaurar.";
      setMsg(text);
      setTimeout(() => setMsg(null), 3000);
      return;
    }
    const next = loadAppOptions();
    setOpts(next);
    applyFontClass(next.fuentesGrandes);
    applyThemeToDocument(next.theme);
    setMsg("Respaldo aplicado.");
    setTimeout(() => setMsg(null), 2500);
  }

  function onClear() {
    if (
      !window.confirm(
        "¿Borrar TODO lo guardado en Mecanipana en este navegador? No se puede deshacer."
      )
    ) {
      return;
    }
    clearAllMecanipanaKeys();
    const defaults = { fuentesGrandes: false, theme: "win98" as const };
    saveAppOptions(defaults);
    setOpts(defaults);
    applyFontClass(false);
    applyThemeToDocument("win98");
    setExportText(null);
    window.location.assign("/");
  }

  return (
    <>
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-x-3 gap-y-2">
        <p className="col-start-1 m-0 min-w-0 text-pretty">
          Opciones de <strong>configuración</strong>. 
        </p>
        <Link href="/" className="win98-btn !w-auto shrink-0 justify-self-end">
          Volver
        </Link>
      </div>

      <div className="win98-inset">
        <p className="win98-label m-0">Tema visual</p>
        <p className="win98-muted mt-1 mb-3">
          Cambia la apariencia de botones y paneles (se guarda en este navegador).
        </p>
        <fieldset className="m-0 flex flex-col gap-2 border-0 p-0">
          <legend className="sr-only">Elegir tema visual</legend>
          {THEME_IDS.map((id) => (
            <label
              key={id}
              className="flex cursor-pointer items-start gap-3 rounded-sm py-0.5"
            >
              <input
                type="radio"
                name="mp-theme"
                className="mt-1 h-5 w-5 shrink-0"
                checked={opts.theme === id}
                onChange={() => onThemeChange(id)}
              />
              <span>
                <span className="font-bold">{themeDisplayLabel(id)}</span>
                {id === "win98" ? (
                  <span className="win98-muted block">
                    Bordes clásicos estilo ventana antigua.
                  </span>
                ) : null}
                {id === "neumorphism" ? (
                  <span className="win98-muted block">
                    Superficies blandas y sombras suaves.
                  </span>
                ) : null}
                {id === "facephism" ? (
                  <span className="win98-muted block">
                    Colores tipo app popular (gris, azul, tarjetas).
                  </span>
                ) : null}
              </span>
            </label>
          ))}
        </fieldset>
      </div>

      <div className="win98-inset">
        <label className="flex cursor-pointer items-start gap-3">
          <input
            type="checkbox"
            className="mt-1 h-5 w-5 shrink-0"
            checked={opts.fuentesGrandes}
            onChange={(e) => onToggleFuentes(e.target.checked)}
          />
          <span>
            <span className="font-bold">Letra más grande</span>
            <span className="win98-muted block">
              Ayuda si cuesta leer en el teléfono.
            </span>
          </span>
        </label>
      </div>

      <div className="win98-inset">
        <p className="win98-label m-0">Respaldo (copiar datos)</p>
        <p className="mt-1 text-[0.92rem] leading-snug text-[#404040]">
          Resumen de lo guardado en{" "}
          <span className="font-semibold">localStorage</span> (clave{" "}
          <code className="text-[0.85rem]">mecanipana:*</code>).
        </p>
        <p className="win98-muted mt-1">
          Genera un texto con lo guardado. Guárdalo en una nota o archivo si quieres.
        </p>
        <div className="win98-form-actions win98-form-actions--row">
          <button type="button" className="win98-btn" onClick={onExport}>
            Generar respaldo
          </button>
          <button type="button" className="win98-btn" onClick={onCopyExport}>
            Copiar
          </button>
          <button type="button" className="win98-btn" onClick={onRestore}>
            Restaurar
          </button>
        </div>
        <textarea
          className="win98-textarea mt-2"
          placeholder="Aquí verás el respaldo al generarlo; también puedes pegar un JSON guardado antes para restaurar."
          value={exportText ?? ""}
          onChange={(e) => setExportText(e.target.value === "" ? null : e.target.value)}
          rows={8}
        />
      </div>

      <div className="win98-inset">
        <p className="win98-label m-0 text-red-800">Zona peligrosa</p>
        <div className="win98-form-actions">
          <button type="button" className="win98-btn" onClick={onClear}>
            Borrar todo lo local
          </button>
        </div>
      </div>

      {msg ? <p className="win98-banner-ok">{msg}</p> : null}
    </>
  );
}
