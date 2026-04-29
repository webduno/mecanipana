"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useSupabaseAuth } from "@/components/auth/supabase-session";
import { DEFAULT_ADMIN_EMAIL } from "@/lib/auth-constants";

export function LoginScreen() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { supabase } = useSupabaseAuth();
  const [email, setEmail] = useState(DEFAULT_ADMIN_EMAIL);
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!supabase) {
      setError("Faltan variables NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY.");
      return;
    }
    const { error: authErr } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    if (authErr) {
      setError(authErr.message);
      return;
    }
    const next = searchParams.get("redirect");
    router.replace(next?.startsWith("/") ? next : "/");
    router.refresh();
  }

  return (
    <>
      <p className="m-0 text-pretty">
        Inicia sesión con la cuenta configurada en Supabase Auth. Usuario administrador por
        defecto: <strong className="font-bold">{DEFAULT_ADMIN_EMAIL}</strong> (crearlo en el
        panel con la contraseña que elijas para pruebas, p. ej. &quot;test&quot;).
      </p>
      <form onSubmit={onSubmit} className="win98-inset">
        <div className="win98-form-row">
          <label className="win98-label" htmlFor="login-email">
            Correo
          </label>
          <input
            id="login-email"
            className="win98-input"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="win98-form-row">
          <label className="win98-label" htmlFor="login-pass">
            Contraseña
          </label>
          <input
            id="login-pass"
            className="win98-input"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        {error ? <p className="win98-muted m-0 text-[clamp(0.88rem,2.9vw,1rem)]">{error}</p> : null}
        <div className="win98-form-actions">
          <button type="submit" className="win98-btn win98-btn--accent-blue">
            Entrar
          </button>
        </div>
      </form>
    </>
  );
}
