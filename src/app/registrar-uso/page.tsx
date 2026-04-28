import type { Metadata } from "next";
import { PageShell } from "@/components/page-shell";
import { RegistroUsoScreen } from "@/components/screens/registro-uso-screen";

export const metadata: Metadata = {
  title: "Registrar uso — Mecanipana",
};

export default function Page() {
  return (
    <PageShell title="Registrar uso">
      <RegistroUsoScreen />
    </PageShell>
  );
}
