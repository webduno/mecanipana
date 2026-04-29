"use client";

import { useEffect } from "react";
import { loadAppOptions } from "@/lib/local-storage-data";
import { applyThemeToDocument } from "@/lib/theme-ui";

export function MecanipanaBodyClass() {
  useEffect(() => {
    const apply = () => {
      const o = loadAppOptions();
      applyThemeToDocument(o.theme);
      if (o.fuentesGrandes) document.body.classList.add("mp-font-lg");
      else document.body.classList.remove("mp-font-lg");
    };
    apply();
    window.addEventListener("storage", apply);
    return () => window.removeEventListener("storage", apply);
  }, []);

  return null;
}
