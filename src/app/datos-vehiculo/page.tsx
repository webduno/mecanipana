import type { Metadata } from "next";
import { PageShell } from "@/components/page-shell";
import { DatosVehiculoScreen } from "@/components/screens/datos-vehiculo-screen";

export const metadata: Metadata = {
  title: "Tu vehículo — Mecanipana",
};

export default function Page() {
  return (
    <PageShell title="Tu vehículo">
      <DatosVehiculoScreen />
    </PageShell>
  );
}
