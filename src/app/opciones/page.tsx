import type { Metadata } from "next";
import { PageShell } from "@/components/page-shell";
import { OpcionesScreen } from "@/components/screens/opciones-screen";

export const metadata: Metadata = {
  title: "Opciones — Mecanipana",
};

export default function Page() {
  return (
    <PageShell title="Opciones (este equipo)">
      <OpcionesScreen />
    </PageShell>
  );
}
