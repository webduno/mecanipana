import type { Metadata } from "next";
import { PageShell } from "@/components/page-shell";
import { DatosVehiculoScreen } from "@/components/screens/datos-vehiculo-screen";

export const metadata: Metadata = {
  title: "Datos del vehículo — Mecanipana",
};

export default function Page() {
  return (
    <PageShell title="Datos del vehículo">
      <DatosVehiculoScreen />
    </PageShell>
  );
}
