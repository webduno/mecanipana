"use client";

import { SupabaseAuthProvider } from "@/components/auth/supabase-session";
import { FloatingNav } from "@/components/floating-nav";
import { ToastProvider } from "@/components/toast-provider";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      <SupabaseAuthProvider>
        {children}
        <FloatingNav />
      </SupabaseAuthProvider>
    </ToastProvider>
  );
}
