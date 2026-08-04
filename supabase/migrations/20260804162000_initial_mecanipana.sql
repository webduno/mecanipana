-- Mecanipana initial schema for cojoined DB
-- All tables/functions use the mecanipana_ prefix to avoid collisions with other apps.
-- Idempotent: safe to re-run in the SQL Editor.
-- On the cojoined DB, run THIS file only — not 20260428120000_initial_schema.sql.

-- -----------------------------------------------------------------------------
-- 1. Tables
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.mecanipana_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  display_name text,
  avatar_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.mecanipana_vehicle_context (
  user_id uuid PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  vehicle_line text NOT NULL DEFAULT '',
  variant_label text NOT NULL DEFAULT '',
  vehicle_notes text NOT NULL DEFAULT '',
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.mecanipana_app_options (
  user_id uuid PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  theme text NOT NULL DEFAULT 'win98',
  locale text NOT NULL DEFAULT 'es',
  fuentes_grandes boolean NOT NULL DEFAULT false,
  preferences_extra jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.mecanipana_usage_entries (
  id uuid PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  at timestamptz NOT NULL,
  urgencia smallint NOT NULL DEFAULT 50 CHECK (urgencia >= 1 AND urgencia <= 100),
  kind text NOT NULL,
  note text NOT NULL DEFAULT '',
  odometer_km text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.mecanipana_fuel_entries (
  id uuid PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  at timestamptz NOT NULL,
  liters text NOT NULL DEFAULT '',
  amount_bs text NOT NULL DEFAULT '',
  note text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.mecanipana_contacts (
  id uuid PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  name text NOT NULL DEFAULT '',
  phone text NOT NULL DEFAULT '',
  location text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.mecanipana_contacts IS
  'Agenda de contactos (taller/persona); localStorage mecanipana:contacts.';

CREATE TABLE IF NOT EXISTS public.mecanipana_maintenance_entries (
  id uuid PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  at timestamptz NOT NULL,
  urgencia smallint NOT NULL DEFAULT 50 CHECK (urgencia >= 1 AND urgencia <= 100),
  what text NOT NULL DEFAULT '',
  note text NOT NULL DEFAULT '',
  location_label text NOT NULL DEFAULT '',
  location_lat double precision,
  location_lon double precision,
  paid_bs text NOT NULL DEFAULT '',
  contact_id uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.mecanipana_reminders (
  id uuid PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  due_at timestamptz NOT NULL,
  text text NOT NULL DEFAULT '',
  done boolean NOT NULL DEFAULT false,
  location_label text NOT NULL DEFAULT '',
  location_lat double precision,
  location_lon double precision,
  estimated_cost_bs text NOT NULL DEFAULT '',
  contact_id uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.mecanipana_reminders IS
  'Recordatorios (ReminderEntry local). due_at + text + done; location_* opcional.';

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'mecanipana_maintenance_entries_contact_id_fkey'
  ) THEN
    ALTER TABLE public.mecanipana_maintenance_entries
      ADD CONSTRAINT mecanipana_maintenance_entries_contact_id_fkey
      FOREIGN KEY (contact_id)
      REFERENCES public.mecanipana_contacts (id)
      ON DELETE SET NULL;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'mecanipana_reminders_contact_id_fkey'
  ) THEN
    ALTER TABLE public.mecanipana_reminders
      ADD CONSTRAINT mecanipana_reminders_contact_id_fkey
      FOREIGN KEY (contact_id)
      REFERENCES public.mecanipana_contacts (id)
      ON DELETE SET NULL;
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.mecanipana_user_extra_vehicle_lines (
  user_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  line text NOT NULL,
  PRIMARY KEY (user_id, line)
);

CREATE TABLE IF NOT EXISTS public.mecanipana_user_extra_variant_labels (
  user_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  label text NOT NULL,
  PRIMARY KEY (user_id, label)
);

CREATE TABLE IF NOT EXISTS public.mecanipana_user_extra_usage_kinds (
  user_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  kind text NOT NULL,
  PRIMARY KEY (user_id, kind)
);

CREATE TABLE IF NOT EXISTS public.mecanipana_user_extra_usage_note_presets (
  user_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  phrase text NOT NULL,
  PRIMARY KEY (user_id, phrase)
);

CREATE TABLE IF NOT EXISTS public.mecanipana_user_maintenance_what_custom (
  user_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  label text NOT NULL,
  PRIMARY KEY (user_id, label)
);

CREATE TABLE IF NOT EXISTS public.mecanipana_admin_emails (
  email text PRIMARY KEY,
  inserted_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.mecanipana_admin_emails IS
  'Administradores UI (JWT email igual en Supabase Authentication).';

INSERT INTO public.mecanipana_admin_emails (email)
VALUES ('admin@mecanipana.com')
ON CONFLICT (email) DO NOTHING;

-- -----------------------------------------------------------------------------
-- 2. Indexes
-- -----------------------------------------------------------------------------

CREATE INDEX IF NOT EXISTS mecanipana_usage_entries_user_at_idx
  ON public.mecanipana_usage_entries (user_id, at DESC);

CREATE INDEX IF NOT EXISTS mecanipana_usage_entries_user_urgencia_idx
  ON public.mecanipana_usage_entries (user_id, urgencia DESC);

CREATE INDEX IF NOT EXISTS mecanipana_fuel_entries_user_at_idx
  ON public.mecanipana_fuel_entries (user_id, at DESC);

CREATE INDEX IF NOT EXISTS mecanipana_maintenance_entries_user_at_idx
  ON public.mecanipana_maintenance_entries (user_id, at DESC);

CREATE INDEX IF NOT EXISTS mecanipana_maintenance_entries_user_urgencia_idx
  ON public.mecanipana_maintenance_entries (user_id, urgencia DESC);

CREATE INDEX IF NOT EXISTS mecanipana_reminders_user_due_idx
  ON public.mecanipana_reminders (user_id, due_at);

CREATE INDEX IF NOT EXISTS mecanipana_contacts_user_created_idx
  ON public.mecanipana_contacts (user_id, created_at DESC);

-- -----------------------------------------------------------------------------
-- 3. RLS
-- -----------------------------------------------------------------------------

ALTER TABLE public.mecanipana_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mecanipana_vehicle_context ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mecanipana_app_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mecanipana_usage_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mecanipana_fuel_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mecanipana_maintenance_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mecanipana_reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mecanipana_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mecanipana_user_extra_vehicle_lines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mecanipana_user_extra_variant_labels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mecanipana_user_extra_usage_kinds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mecanipana_user_extra_usage_note_presets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mecanipana_user_maintenance_what_custom ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS mecanipana_profiles_select_own ON public.mecanipana_profiles;
CREATE POLICY mecanipana_profiles_select_own
  ON public.mecanipana_profiles FOR SELECT TO authenticated
  USING (auth.uid() = id);

DROP POLICY IF EXISTS mecanipana_profiles_update_own ON public.mecanipana_profiles;
CREATE POLICY mecanipana_profiles_update_own
  ON public.mecanipana_profiles FOR UPDATE TO authenticated
  USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS mecanipana_profiles_insert_own ON public.mecanipana_profiles;
CREATE POLICY mecanipana_profiles_insert_own
  ON public.mecanipana_profiles FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS mecanipana_vehicle_context_all_own ON public.mecanipana_vehicle_context;
CREATE POLICY mecanipana_vehicle_context_all_own
  ON public.mecanipana_vehicle_context FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS mecanipana_app_options_all_own ON public.mecanipana_app_options;
CREATE POLICY mecanipana_app_options_all_own
  ON public.mecanipana_app_options FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS mecanipana_usage_entries_all_own ON public.mecanipana_usage_entries;
CREATE POLICY mecanipana_usage_entries_all_own
  ON public.mecanipana_usage_entries FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS mecanipana_fuel_entries_all_own ON public.mecanipana_fuel_entries;
CREATE POLICY mecanipana_fuel_entries_all_own
  ON public.mecanipana_fuel_entries FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS mecanipana_maintenance_entries_all_own ON public.mecanipana_maintenance_entries;
CREATE POLICY mecanipana_maintenance_entries_all_own
  ON public.mecanipana_maintenance_entries FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS mecanipana_reminders_all_own ON public.mecanipana_reminders;
CREATE POLICY mecanipana_reminders_all_own
  ON public.mecanipana_reminders FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS mecanipana_contacts_all_own ON public.mecanipana_contacts;
CREATE POLICY mecanipana_contacts_all_own
  ON public.mecanipana_contacts FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS mecanipana_user_extra_vehicle_lines_all_own ON public.mecanipana_user_extra_vehicle_lines;
CREATE POLICY mecanipana_user_extra_vehicle_lines_all_own
  ON public.mecanipana_user_extra_vehicle_lines FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS mecanipana_user_extra_variant_labels_all_own ON public.mecanipana_user_extra_variant_labels;
CREATE POLICY mecanipana_user_extra_variant_labels_all_own
  ON public.mecanipana_user_extra_variant_labels FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS mecanipana_user_extra_usage_kinds_all_own ON public.mecanipana_user_extra_usage_kinds;
CREATE POLICY mecanipana_user_extra_usage_kinds_all_own
  ON public.mecanipana_user_extra_usage_kinds FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS mecanipana_user_extra_usage_note_presets_all_own ON public.mecanipana_user_extra_usage_note_presets;
CREATE POLICY mecanipana_user_extra_usage_note_presets_all_own
  ON public.mecanipana_user_extra_usage_note_presets FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS mecanipana_user_maintenance_what_custom_all_own ON public.mecanipana_user_maintenance_what_custom;
CREATE POLICY mecanipana_user_maintenance_what_custom_all_own
  ON public.mecanipana_user_maintenance_what_custom FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- -----------------------------------------------------------------------------
-- 4. Auth trigger (prefixed so it does not replace other apps' triggers)
-- -----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.mecanipana_handle_new_user ()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.mecanipana_profiles (id)
  VALUES (NEW.id)
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.mecanipana_vehicle_context (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;

  INSERT INTO public.mecanipana_app_options (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS mecanipana_on_auth_user_created ON auth.users;
CREATE TRIGGER mecanipana_on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.mecanipana_handle_new_user ();

-- -----------------------------------------------------------------------------
-- 5. Backfill existing auth users
-- -----------------------------------------------------------------------------

INSERT INTO public.mecanipana_profiles (id)
SELECT u.id FROM auth.users AS u
WHERE NOT EXISTS (
  SELECT 1 FROM public.mecanipana_profiles AS p WHERE p.id = u.id
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.mecanipana_vehicle_context (user_id)
SELECT u.id FROM auth.users AS u
WHERE NOT EXISTS (
  SELECT 1 FROM public.mecanipana_vehicle_context AS v WHERE v.user_id = u.id
)
ON CONFLICT (user_id) DO NOTHING;

INSERT INTO public.mecanipana_app_options (user_id)
SELECT u.id FROM auth.users AS u
WHERE NOT EXISTS (
  SELECT 1 FROM public.mecanipana_app_options AS o WHERE o.user_id = u.id
)
ON CONFLICT (user_id) DO NOTHING;

-- -----------------------------------------------------------------------------
-- 6. Grants
-- -----------------------------------------------------------------------------

GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON
  public.mecanipana_profiles,
  public.mecanipana_vehicle_context,
  public.mecanipana_app_options,
  public.mecanipana_usage_entries,
  public.mecanipana_fuel_entries,
  public.mecanipana_contacts,
  public.mecanipana_maintenance_entries,
  public.mecanipana_reminders,
  public.mecanipana_user_extra_vehicle_lines,
  public.mecanipana_user_extra_variant_labels,
  public.mecanipana_user_extra_usage_kinds,
  public.mecanipana_user_extra_usage_note_presets,
  public.mecanipana_user_maintenance_what_custom,
  public.mecanipana_admin_emails
TO authenticated;

GRANT ALL ON
  public.mecanipana_profiles,
  public.mecanipana_vehicle_context,
  public.mecanipana_app_options,
  public.mecanipana_usage_entries,
  public.mecanipana_fuel_entries,
  public.mecanipana_contacts,
  public.mecanipana_maintenance_entries,
  public.mecanipana_reminders,
  public.mecanipana_user_extra_vehicle_lines,
  public.mecanipana_user_extra_variant_labels,
  public.mecanipana_user_extra_usage_kinds,
  public.mecanipana_user_extra_usage_note_presets,
  public.mecanipana_user_maintenance_what_custom,
  public.mecanipana_admin_emails
TO postgres, service_role;
