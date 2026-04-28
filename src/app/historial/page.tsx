import type { Metadata } from "next";
import { PageShell } from "@/components/page-shell";
import { HistorialScreen } from "@/components/screens/historial-screen";

export const metadata: Metadata = {
  title: "Historial — Mecanipana",
};

export default function Page() {
  return (
    <PageShell title="Historial">
      <HistorialScreen />
    </PageShell>
  );
}
