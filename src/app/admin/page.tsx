import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { PageShell } from "@/components/page-shell";
import { isPlatformAdminEmail } from "@/lib/auth-constants";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Administración — Mecanipana",
};

export default async function AdminPage() {
  let supabase;
  try {
    supabase = await createSupabaseServerClient();
  } catch {
    redirect(`/login?redirect=${encodeURIComponent("/admin")}`);
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    redirect(`/login?redirect=${encodeURIComponent("/admin")}`);
  }

  if (!isPlatformAdminEmail(user.email)) {
    redirect("/");
  }

  return (
    <PageShell title="Administración">
      <p className="m-0 text-pretty">
        Sesión iniciada como <strong>{user.email}</strong>. Aquí irán herramientas de
        administración (solo visibles cuando el correo coincide con el definido como
        admin).
      </p>
      <div className="win98-inset mt-4">
        <p className="m-0">Contenido de administrador (próximamente).</p>
      </div>
    </PageShell>
  );
}
