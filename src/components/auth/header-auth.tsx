"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSupabaseAuth } from "@/components/auth/supabase-session";

export function HeaderAuth() {
  const { user, loading, supabase } = useSupabaseAuth();
  const router = useRouter();

  async function signOutClick() {
    if (!supabase) return;
    await supabase.auth.signOut();
    router.refresh();
  }

  if (!supabase) {
    return (
      <span className="max-w-[10rem] shrink-0 truncate text-[clamp(0.62rem,2.4vw,0.82rem)] text-inherit opacity-90">
        Configura Supabase
      </span>
    );
  }

  if (loading) {
    return (
      <span className="shrink-0 text-[clamp(0.62rem,2.4vw,0.82rem)] opacity-85">
        Sesión…
      </span>
    );
  }

  return (
    <div className="flex max-w-[min(11rem,calc(100vw-14rem))] shrink-0 flex-col items-end gap-0.5 text-right text-[clamp(0.62rem,2.4vw,0.82rem)] leading-tight">
      {user?.email ? (
        <>
          <span className="max-w-full truncate opacity-95" title={user.email}>
            {user.email}
          </span>
          <button
            type="button"
            className="m-0 cursor-pointer bg-transparent p-0 font-bold underline decoration-[currentColor] underline-offset-2"
            onClick={() => void signOutClick()}
          >
            Salir
          </button>
        </>
      ) : (
        <Link
          href="/login"
          className="font-bold underline decoration-[currentColor] underline-offset-2"
        >
          Entrar
        </Link>
      )}
    </div>
  );
}
