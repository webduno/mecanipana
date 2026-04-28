import type { Metadata } from "next";
import { PageShell } from "@/components/page-shell";
import { RecordatoriosScreen } from "@/components/screens/recordatorios-screen";

export const metadata: Metadata = {
  title: "Recordatorios — Mecanipana",
};

export default function Page() {
  return (
    <PageShell title="Recordatorios">
      <RecordatoriosScreen />
    </PageShell>
  );
}
