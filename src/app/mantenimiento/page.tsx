import type { Metadata } from "next";
import { PageShell } from "@/components/page-shell";
import { IconMantenimiento } from "@/components/grid-action-icons";
import { MantenimientoScreen } from "@/components/screens/mantenimiento-screen";

export const metadata: Metadata = {
  title: "Mantenimiento — Mecanipana",
};

export default function Page() {
  return (
    <PageShell
      title="Mantenimiento"
      titleIcon={<IconMantenimiento className="win98-titlebar-icon" />}
    >
      <MantenimientoScreen />
    </PageShell>
  );
}
