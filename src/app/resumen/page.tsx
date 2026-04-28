import type { Metadata } from "next";
import { PageShell } from "@/components/page-shell";
import { ResumenScreen } from "@/components/screens/resumen-screen";

export const metadata: Metadata = {
  title: "Resumen — Mecanipana",
};

export default function Page() {
  return (
    <PageShell title="Resumen">
      <ResumenScreen />
    </PageShell>
  );
}
