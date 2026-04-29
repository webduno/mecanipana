/** Admin por defecto (lista en migración `admin_emails`; mismo correo en Supabase Authentication). */
export const DEFAULT_ADMIN_EMAIL = "admin@mecanipana.com";

export function isPlatformAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  return email.trim().toLowerCase() === DEFAULT_ADMIN_EMAIL.toLowerCase();
}
