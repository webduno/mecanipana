import type { Metadata } from "next";
import { PageShell } from "@/components/page-shell";
import { MantenimientoScreen } from "@/components/screens/mantenimiento-screen";

export const metadata: Metadata = {
  title: "Mantenimiento — Mecanipana",
};

export default function Page() {
  return (
    <PageShell title="Mantenimiento">
      <MantenimientoScreen />
    </PageShell>
  );
}
