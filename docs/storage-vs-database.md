# localStorage ↔ Supabase: referencia rápida

Referencia para desarrolladores y soporte: **qué clave usa el navegador**, **en qué formato**, y **dónde vive lo mismo en la base** cuando exista sincronización por cuenta (`user_id` = `auth.users.id`).

Convención en Postgres: nombres en **snake_case**; en TypeScript / JSON local muchos campos van en **camelCase**.

---

## Claves `localStorage` y tabla equivalente

| Clave exacta (`localStorage`) | Formato en el navegador | Tabla / columnas en Supabase |
|-------------------------------|-------------------------|-------------------------------|
| `mecanipana:extraVehicleLines` | JSON array de strings `string[]` | `user_extra_vehicle_lines`: una fila por valor en columna `line` |
| `mecanipana:extraVariantLabels` | JSON array de strings | `user_extra_variant_labels`: columna `label` |
| `mecanipana:selectedVehicleLine` | String (una línea) | `vehicle_context.vehicle_line` |
| `mecanipana:selectedVariant` | String (motor · año, etc.) | `vehicle_context.variant_label` |
| `mecanipana:vehicleNotes` | String (texto libre) | `vehicle_context.vehicle_notes` |
| `mecanipana:usageLog` | JSON array de objetos `UsageEntry[]` | `usage_entries`: una fila por entrada |
| `mecanipana:fuelLog` | JSON array `FuelEntry[]` | `fuel_entries` |
| `mecanipana:maintenanceLog` | JSON array `MaintenanceEntry[]` | `maintenance_entries` |
| `mecanipana:maintenanceWhatCustom` | JSON array de strings | `user_maintenance_what_custom`: columna `label` |
| `mecanipana:reminders` | JSON array `ReminderEntry[]` | `reminders` |
| `mecanipana:contacts` | JSON array `ContactEntry[]` | `contacts` |
| `mecanipana:options` | JSON objeto `AppOptions`: `{ fuentesGrandes, theme }` (`theme`: `win98` \| `neumorphism` \| `facephism`) | `app_options`: `fuentes_grandes`, `theme`, `locale`, `preferences_extra` |
| `mecanipana:extraUsageNotePresets` | JSON array de strings | `user_extra_usage_note_presets`: columna `phrase` |

Constantes TypeScript: ver `src/lib/storage-keys.ts`.

---

## Campos objeto ↔ columnas (camelCase → snake_case)

### `UsageEntry` → `usage_entries`

| Campo JSON | Columna DB |
|------------|------------|
| `id` | `id` (uuid) |
| `at` | `at` (timestamptz; ISO string desde cliente) |
| `urgencia` | `urgencia` (smallint 1–100) |
| `kind` | `kind` |
| `note` | `note` |
| `odometerKm` | `odometer_km` |

### `FuelEntry` → `fuel_entries`

| Campo JSON | Columna DB |
|------------|------------|
| `liters` | `liters` |
| `amountBs` | `amount_bs` |
| (resto igual que arriba: `id`, `at`, `note`) | igual nombre |

### `MaintenanceEntry` → `maintenance_entries`

| Campo JSON | Columna DB |
|------------|------------|
| `id` | `id` (uuid) |
| `at` | `at` |
| `urgencia` | `urgencia` (smallint 1–100) |
| `what` | `what` |
| `note` | `note` |
| `locationLabel` | `location_label` |
| `locationLat` | `location_lat` (double precision, nullable) |
| `locationLon` | `location_lon` (double precision, nullable) |
| `paidBs` | `paid_bs` (texto libre; moneda la escribe el usuario) |
| `contactId` | `contact_id` (uuid, FK a `contacts`, nullable) |

### `ReminderEntry` → `reminders`

| Campo JSON | Columna DB |
|------------|------------|
| `id` | `id` (uuid) |
| `dueAt` | `due_at` |
| `text` | `text` |
| `done` | `done` |
| `locationLabel` | `location_label` |
| `locationLat` | `location_lat` |
| `locationLon` | `location_lon` |
| `estimatedCostBs` | `estimated_cost_bs` (texto libre; moneda la escribe el usuario) |
| `contactId` | `contact_id` (uuid, FK a `contacts`, nullable) |

### `ContactEntry` → `contacts`

| Campo JSON | Columna DB |
|------------|------------|
| `id` | `id` (uuid) |
| `name` | `name` |
| `phone` | `phone` |
| `location` | `location` (taller o dirección, texto) |

Los query params `?tema=` / `?texto=` en `/recordatorios` solo prellenan el formulario en el navegador; **no** se guardan en filas (el texto sugerido termina en `text` solo si el usuario envía el formulario). La etiqueta del día de la semana junto a la fecha es solo presentación.

### Opciones de app → `app_options`

| Concepto / futuro en cliente | Columna DB |
|------------------------------|------------|
| `fuentesGrandes` | `fuentes_grandes` |
| `theme` (`win98` \| `neumorphism` \| `facephism`) | `theme` (default `'win98'`) |
| Idioma / locale (pendiente en cliente) | `locale` (default `'es'`) |
| Otros flags sin migración | `preferences_extra` (jsonb) |

---

## Cosas que solo están en un lado (por ahora)

- **Solo en código local / catálogo**: defaults en `src/data/defaults/*.json` (por ejemplo catálogo de vehículos y frases de nota por defecto); no son una fila por usuario en Supabase salvo que más adelante se dupliquen como preferencias.
- **Tipos de uso «Tipo»** (`Viaje`, `Trabajo`, …): hoy están fijos en `registro-uso-screen.tsx`, no hay clave `localStorage` aparte. En DB existe **`user_extra_usage_kinds`** para frases extra que el usuario añada cuando la sincronización esté cableada.
- **Perfil visible** (`display_name`, `avatar_url`): en Supabase están en **`profiles`**; no hay copia en `localStorage` en la app actual.
- **`history` / historial unificado**: es derivado en cliente (`buildHistoryRows`), no una tabla aparte en la migración inicial.

---

## Export JSON (`exportAllLocalPayload`)

El respaldo en Opciones serializa **todas** las claves que empiezan por `mecanipana:` con el nombre de clave como propiedad del objeto raíz (los valores son el JSON parseado o string crudo). Para mapear a Supabase, usa las tablas de las secciones anteriores por cada clave.

---

## Archivos fuente

- Claves: `src/lib/storage-keys.ts`
- Tipos de filas: `src/lib/mecanipana-types.ts`
- Migración Postgres: `supabase/migrations/20260428120000_initial_schema.sql`
- Insert remoto (sesión Supabase): `POST /api/usage-entries`, `POST /api/maintenance-entries`, `POST /api/reminders`, `POST /api/contacts` (upsert agenda) — ver `src/app/api/*/route.ts` y `src/lib/remote/sync-log-entries-remote.ts`. Búsqueda de lugar (Nominatim, uso político): `GET /api/osm/search?q=`.
