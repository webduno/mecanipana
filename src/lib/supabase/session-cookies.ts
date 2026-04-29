import type { NextRequest } from "next/server";

/**
 * True si el request trae cookies típicas de sesión Supabase Auth (post-login).
 * Sin esto el middleware no llama a `getUser()` / refresco (evita tráfico al entrar en el sitio).
 */
export function hasSupabaseSessionCookies(request: NextRequest): boolean {
  return request.cookies.getAll().some(({ name }) => {
    if (!name.startsWith("sb-")) return false;
    return (
      name.includes("auth-token") ||
      name.includes("refresh-token") ||
      name.includes("access-token")
    );
  });
}
