import type { Metadata } from "next";
import { Suspense } from "react";
import { PageShell } from "@/components/page-shell";
import { LoginScreen } from "@/components/screens/login-screen";

export const metadata: Metadata = {
  title: "Entrar — Mecanipana",
};

export default function LoginPage() {
  return (
    <PageShell title="Entrar">
      <Suspense fallback={<p className="m-0 win98-muted">Cargando…</p>}>
        <LoginScreen />
      </Suspense>
    </PageShell>
  );
}
