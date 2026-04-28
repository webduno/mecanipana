import type { Metadata } from "next";
import { PageShell } from "@/components/page-shell";
import { CombustibleScreen } from "@/components/screens/combustible-screen";

export const metadata: Metadata = {
  title: "Combustible — Mecanipana",
};

export default function Page() {
  return (
    <PageShell title="Combustible">
      <CombustibleScreen />
    </PageShell>
  );
}
