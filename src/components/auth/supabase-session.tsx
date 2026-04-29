"use client";

import type { Session, SupabaseClient, User } from "@supabase/supabase-js";
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

export type AuthState = {
  user: User | null;
  session: Session | null;
  loading: boolean;
  supabase: SupabaseClient | null;
};

const Ctx = createContext<AuthState | null>(null);

export function SupabaseAuthProvider({ children }: { children: ReactNode }) {
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }
    void supabase.auth.getSession().then(({ data }) => {
      setSession(data.session ?? null);
      setLoading(false);
    });
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_evt, sess) => {
      setSession(sess ?? null);
    });
    return () => subscription.unsubscribe();
  }, [supabase]);

  const user = session?.user ?? null;

  const value = useMemo((): AuthState => {
    return {
      user,
      session,
      loading,
      supabase,
    };
  }, [user, session, loading, supabase]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useSupabaseAuth(): AuthState {
  const v = useContext(Ctx);
  if (!v) {
    throw new Error("useSupabaseAuth must be inside SupabaseAuthProvider");
  }
  return v;
}
