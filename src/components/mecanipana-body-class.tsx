"use client";

import { useEffect } from "react";
import { loadAppOptions } from "@/lib/local-storage-data";

export function MecanipanaBodyClass() {
  useEffect(() => {
    const apply = () => {
      const o = loadAppOptions();
      if (o.fuentesGrandes) document.body.classList.add("mp-font-lg");
      else document.body.classList.remove("mp-font-lg");
    };
    apply();
    window.addEventListener("storage", apply);
    return () => window.removeEventListener("storage", apply);
  }, []);

  return null;
}
