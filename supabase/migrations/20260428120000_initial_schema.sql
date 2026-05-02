-- Mecanipana — esquema inicial (Supabase / PostgreSQL)
-- Idempotente: puedes ejecutarlo varias veces en el SQL Editor sin romper el estado.
-- Requiere rol con permisos sobre auth.users para el trigger de registro (editor SQL de Supabase OK).

-- -----------------------------------------------------------------------------
-- 1. Tablas
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  display_name text,
  avatar_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.vehicle_context (
  user_id uuid PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  vehicle_line text NOT NULL DEFAULT '',
  variant_label text NOT NULL DEFAULT '',
  vehicle_notes text NOT NULL DEFAULT '',
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Preferencias de UI / cuenta (tema, idioma, accesibilidad, extras JSON libres)
CREATE TABLE IF NOT EXISTS public.app_options (
  user_id uuid PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  theme text NOT NULL DEFAULT 'win98',
  locale text NOT NULL DEFAULT 'es',
  fuentes_grandes boolean NOT NULL DEFAULT false,
  preferences_extra jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- IDs = UUID generados en cliente (crypto.randomUUID), alineados con UsageEntry.id etc.
CREATE TABLE IF NOT EXISTS public.usage_entries (
  id uuid PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  at timestamptz NOT NULL,
  urgencia smallint NOT NULL DEFAULT 50 CHECK (urgencia >= 1 AND urgencia <= 100),
  kind text NOT NULL,
  note text NOT NULL DEFAULT '',
  odometer_km text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.fuel_entries (
  id uuid PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  at timestamptz NOT NULL,
  liters text NOT NULL DEFAULT '',
  amount_bs text NOT NULL DEFAULT '',
  note text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.maintenance_entries (
  id uuid PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  at timestamptz NOT NULL,
  urgencia smallint NOT NULL DEFAULT 50 CHECK (urgencia >= 1 AND urgencia <= 100),
  what text NOT NULL DEFAULT '',
  note text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.reminders (
  id uuid PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  due_at timestamptz NOT NULL,
  text text NOT NULL DEFAULT '',
  done boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.reminders IS
  'Recordatorios (ReminderEntry local). Solo se persisten due_at + text + done; params URL ?tema= / ?texto= son UX en cliente para prellenar el formulario, no columnas aquí.';

-- Listas personalizadas por usuario (extras en desplegables / prompts), una fila por ítem
CREATE TABLE IF NOT EXISTS public.user_extra_vehicle_lines (
  user_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  line text NOT NULL,
  PRIMARY KEY (user_id, line)
);

CREATE TABLE IF NOT EXISTS public.user_extra_variant_labels (
  user_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  label text NOT NULL,
  PRIMARY KEY (user_id, label)
);

CREATE TABLE IF NOT EXISTS public.user_extra_usage_kinds (
  user_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  kind text NOT NULL,
  PRIMARY KEY (user_id, kind)
);

CREATE TABLE IF NOT EXISTS public.user_extra_usage_note_presets (
  user_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  phrase text NOT NULL,
  PRIMARY KEY (user_id, phrase)
);

CREATE TABLE IF NOT EXISTS public.user_maintenance_what_custom (
  user_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  label text NOT NULL,
  PRIMARY KEY (user_id, label)
);

CREATE TABLE IF NOT EXISTS public.admin_emails (
  email text PRIMARY KEY,
  inserted_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.admin_emails IS
  'Administradores UI (JWT email igual en Supabase Authentication). Paso manual típico: crear usuario admin@mecanipana.com con contraseña de prueba (ej. test) en Dashboard.';

INSERT INTO public.admin_emails (email)
VALUES ('admin@mecanipana.com')
ON CONFLICT (email) DO NOTHING;

-- -----------------------------------------------------------------------------
-- 2. Columnas nuevas (instalaciones que ya ejecutaron una versión anterior del script)
-- -----------------------------------------------------------------------------

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS display_name text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS avatar_url text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

ALTER TABLE public.app_options ADD COLUMN IF NOT EXISTS theme text NOT NULL DEFAULT 'win98';
ALTER TABLE public.app_options ADD COLUMN IF NOT EXISTS locale text NOT NULL DEFAULT 'es';
ALTER TABLE public.app_options ADD COLUMN IF NOT EXISTS preferences_extra jsonb NOT NULL DEFAULT '{}'::jsonb;

COMMENT ON COLUMN public.app_options.theme IS 'Vista: win98 | neumorphism | facephism (sync con localStorage mecanipana:options.theme).';
COMMENT ON COLUMN public.app_options.locale IS 'Idioma / locale BCP 47 (ej. es, es-VE, en).';
COMMENT ON COLUMN public.app_options.preferences_extra IS 'Flags y opciones futuras sin migración (JSON arbitrario acotado por la app).';
COMMENT ON COLUMN public.app_options.fuentes_grandes IS 'Accesibilidad: texto más grande (equivale a opciones actuales).';

ALTER TABLE public.usage_entries ADD COLUMN IF NOT EXISTS urgencia smallint NOT NULL DEFAULT 50;
ALTER TABLE public.maintenance_entries ADD COLUMN IF NOT EXISTS urgencia smallint NOT NULL DEFAULT 50;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'usage_entries_urgencia_check'
  ) THEN
    ALTER TABLE public.usage_entries
      ADD CONSTRAINT usage_entries_urgencia_check CHECK (urgencia >= 1 AND urgencia <= 100);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'maintenance_entries_urgencia_check'
  ) THEN
    ALTER TABLE public.maintenance_entries
      ADD CONSTRAINT maintenance_entries_urgencia_check CHECK (urgencia >= 1 AND urgencia <= 100);
  END IF;
END $$;

COMMENT ON COLUMN public.usage_entries.urgencia IS 'Prioridad 1–100 para tablero (típico 75/50/25).';
COMMENT ON COLUMN public.maintenance_entries.urgencia IS 'Prioridad 1–100 para tablero (típico 75/50/25).';

-- -----------------------------------------------------------------------------
-- 3. Índices (consultas por usuario + orden temporal)
-- -----------------------------------------------------------------------------

CREATE INDEX IF NOT EXISTS idx_usage_entries_user_at ON public.usage_entries (user_id, at DESC);
CREATE INDEX IF NOT EXISTS idx_usage_entries_user_urgencia ON public.usage_entries (user_id, urgencia DESC);
CREATE INDEX IF NOT EXISTS idx_fuel_entries_user_at ON public.fuel_entries (user_id, at DESC);
CREATE INDEX IF NOT EXISTS idx_maintenance_entries_user_at ON public.maintenance_entries (user_id, at DESC);
CREATE INDEX IF NOT EXISTS idx_maintenance_entries_user_urgencia ON public.maintenance_entries (user_id, urgencia DESC);
CREATE INDEX IF NOT EXISTS idx_reminders_user_due ON public.reminders (user_id, due_at);

-- -----------------------------------------------------------------------------
-- 4. Row Level Security + políticas (solo el dueño de auth.uid())
-- -----------------------------------------------------------------------------

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicle_context ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usage_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fuel_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.maintenance_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_extra_vehicle_lines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_extra_variant_labels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_extra_usage_kinds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_extra_usage_note_presets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_maintenance_what_custom ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS profiles_select_own ON public.profiles;
CREATE POLICY profiles_select_own ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);

DROP POLICY IF EXISTS profiles_update_own ON public.profiles;
CREATE POLICY profiles_update_own ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS profiles_insert_own ON public.profiles;
CREATE POLICY profiles_insert_own ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS vehicle_context_all_own ON public.vehicle_context;
CREATE POLICY vehicle_context_all_own ON public.vehicle_context FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS app_options_all_own ON public.app_options;
CREATE POLICY app_options_all_own ON public.app_options FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS usage_entries_all_own ON public.usage_entries;
CREATE POLICY usage_entries_all_own ON public.usage_entries FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS fuel_entries_all_own ON public.fuel_entries;
CREATE POLICY fuel_entries_all_own ON public.fuel_entries FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS maintenance_entries_all_own ON public.maintenance_entries;
CREATE POLICY maintenance_entries_all_own ON public.maintenance_entries FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS reminders_all_own ON public.reminders;
CREATE POLICY reminders_all_own ON public.reminders FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS user_extra_vehicle_lines_all_own ON public.user_extra_vehicle_lines;
CREATE POLICY user_extra_vehicle_lines_all_own ON public.user_extra_vehicle_lines FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS user_extra_variant_labels_all_own ON public.user_extra_variant_labels;
CREATE POLICY user_extra_variant_labels_all_own ON public.user_extra_variant_labels FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS user_extra_usage_kinds_all_own ON public.user_extra_usage_kinds;
CREATE POLICY user_extra_usage_kinds_all_own ON public.user_extra_usage_kinds FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS user_extra_usage_note_presets_all_own ON public.user_extra_usage_note_presets;
CREATE POLICY user_extra_usage_note_presets_all_own ON public.user_extra_usage_note_presets FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS user_maintenance_what_custom_all_own ON public.user_maintenance_what_custom;
CREATE POLICY user_maintenance_what_custom_all_own ON public.user_maintenance_what_custom FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- -----------------------------------------------------------------------------
-- 5. Trigger: al registrarse en auth, filas iniciales por usuario (idempotente)
-- -----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.handle_new_user ()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id)
  VALUES (NEW.id)
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.vehicle_context (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;

  INSERT INTO public.app_options (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user ();

-- -----------------------------------------------------------------------------
-- 6. Backfill: usuarios ya existentes en auth antes de esta migración
-- -----------------------------------------------------------------------------

INSERT INTO public.profiles (id)
SELECT u.id FROM auth.users AS u
WHERE NOT EXISTS (SELECT 1 FROM public.profiles AS p WHERE p.id = u.id)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.vehicle_context (user_id)
SELECT u.id FROM auth.users AS u
WHERE NOT EXISTS (SELECT 1 FROM public.vehicle_context AS v WHERE v.user_id = u.id)
ON CONFLICT (user_id) DO NOTHING;

INSERT INTO public.app_options (user_id)
SELECT u.id FROM auth.users AS u
WHERE NOT EXISTS (SELECT 1 FROM public.app_options AS o WHERE o.user_id = u.id)
ON CONFLICT (user_id) DO NOTHING;

-- -----------------------------------------------------------------------------
-- 7. Grants (roles típicos de Supabase)
-- -----------------------------------------------------------------------------

GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, service_role;

-- -----------------------------------------------------------------------------
-- Notas
-- -----------------------------------------------------------------------------
-- - anon: sin políticas públicas; solo JWT authenticated accede a datos con RLS.
-- - service_role: bypass RLS (solo backend/cron; nunca en el navegador).
-- - Perfil: profiles.display_name / avatar_url (metadatos opcionales para UI).
-- - Config sincronizable: app_options.theme, .locale, .fuentes_grandes, .preferences_extra (JSON).
-- - vehicle_line / variant_label / vehicle_notes → vehicle_context.
-- - Logs: usage_entries.urgencia / maintenance_entries.urgencia (1–100), fuel_entries, reminders (fecha objetivo en due_at; texto libre en text).
-- - admin_emails: correos con rol admin UI (crear el mismo correo en Authentication con contraseña de prueba).
-- - Opciones extra por desplegable / lista:
--     user_extra_vehicle_lines, user_extra_variant_labels,
--     user_extra_usage_kinds (tipos de uso además de los fijos en código),
--     user_extra_usage_note_presets, user_maintenance_what_custom.
