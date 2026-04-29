import type { Metadata } from "next";
import { PageShell } from "@/components/page-shell";
import { CuestionarioVehiculoScreen } from "@/components/screens/cuestionario-vehiculo-screen";

export const metadata: Metadata = {
  title: "Cuestionario de estado — Mecanipana",
};

export default function Page() {
  return (
    <PageShell title="Tu vehículo — cuestionario">
      <CuestionarioVehiculoScreen />
    </PageShell>
  );
}
