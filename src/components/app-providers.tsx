"use client";

import { SupabaseAuthProvider } from "@/components/auth/supabase-session";
import { FloatingNav } from "@/components/floating-nav";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <SupabaseAuthProvider>
      {children}
      <FloatingNav />
    </SupabaseAuthProvider>
  );
}
