"use client";

import { useState } from "react";
import { clearAllMecanipanaKeys, exportAllLocalPayload, loadAppOptions, saveAppOptions } from "@/lib/local-storage-data";

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

  function onClear() {
    if (
      !window.confirm(
        "¿Borrar TODO lo guardado en Mecanipana en este navegador? No se puede deshacer."
      )
    ) {
      return;
    }
    clearAllMecanipanaKeys();
    saveAppOptions({ fuentesGrandes: false });
    setOpts({ fuentesGrandes: false });
    applyFontClass(false);
    setExportText(null);
    setMsg("Listo. Recarga la página o vuelve al inicio.");
  }

  return (
    <>
      <p className="m-0 text-pretty">
        Opciones solo de <strong>este equipo</strong>. Nada sale a internet todavía.
      </p>

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
        <p className="win98-muted mt-1">
          Genera un texto con lo guardado. Guárdalo en una nota o archivo si quieres.
        </p>
        <div className="win98-form-actions">
          <button type="button" className="win98-btn" onClick={onExport}>
            Generar respaldo
          </button>
          <button type="button" className="win98-btn" onClick={onCopyExport}>
            Copiar
          </button>
        </div>
        {exportText ? (
          <textarea
            className="win98-textarea mt-2"
            readOnly
            value={exportText}
            rows={8}
          />
        ) : null}
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
