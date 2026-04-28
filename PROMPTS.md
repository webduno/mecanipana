# Prompt history

Add new prompts below the latest entry (newest at bottom). Useful for sharing context or revisiting decisions.

---

## 2026-04-28 19:04

**Prompt:**

> generate simple concise md for what this will be, and all prompts i use add on anoher md, so i can keep track and share history or prompts later
>
> this will be nextjs app, first usage is localhost, but will also be connected to supabase, its a car usage tracker, only add fiat brand for now, and car siena, only the 1.4, from 2008, remember to add defaults jsons, and populate custom optionsonly on localstorage, first version will have all that localstorage and from jsons, and supabase will be for syncing account to be able to sync from pc to phone, connect simple using email and pw, no google login yet
>
> ui ux should be very simple, and in style of windows 98, cuz it will be for non technical people, large layout and text, and mobile first but keep in mind desktop for taking advangate of wider screens

**Outcome:** Added `PROJECT.md` (vision/spec) and this `PROMPTS.md` file.

---

## 2026-04-28 (2)

**Prompt:**

> start with the inital init commands and folder layout creation, and start the initial landing page without connecting to localhost yet, just to see how will it look and buttons you will add first

**Outcome:** `create-next-app` (TypeScript, App Router, Tailwind, `src/`). Folders: `src/data/defaults/vehicle-catalog.json`. Win98-styled landing in `src/app/page.tsx` with buttons: Registrar uso, Ver historial, Resumen / estadísticas, Opciones (este equipo), Cuenta y sincronización (disabled). Sidebar note on `lg+` only. No dev server run.

---

## 2026-04-28 (3)

**Prompt:**

> add icons to main buttons, and put in 3x3 grid, and put one or two in color for contrats for the most used ones, and good, keep in spanish onlys since it will be only used in venezela

**Outcome:** `grid-cols-3` con 9 botones tipo ficha + SVG en `src/components/grid-action-icons.tsx`. Colores: azul “Registrar uso”, verde “Ver historial”. Texto solo en español (Venezuela / “carro”). Nuevas fichas: Combustible, Mantenimiento, Recordatorios, Datos del vehículo. Estilos `.win98-btn-tile`, `.win98-btn--accent-*` en `globals.css`.

---

## 2026-04-28 (4)

**Prompt:**

> put Vehículo por defecto and Fiat Siena 1.4 · 2008 as select inputs, and put 2 buttons in top right corner of that container to add new option for each

**Outcome:** `VehicleDefaultPanel` cliente: dos `<select>` (línea de vehículo desde JSON + extras en `localStorage`, variantes “motor · año” igual). Dos botones `+` arriba a la derecha (uno por lista). Claves LS `mecanipana:extraVehicleLines`, `extraVariantLabels`, selección guardada. Resumen textual debajo. Estilos `.win98-select`, `.win98-btn-square`, `.win98-inset-vehicle`.

---

## 2026-04-28 (5)

**Prompt:**

> differentiate better

**Outcome:** Cada campo en su bloque `.win98-field-group` (fondo gris Win98, borde relieve), franja izquierda azul vs verde. Botón `+` al lado del **mismo** bloque (leyendas «CARRO» / «MOTOR», colores acento). Select con borde izquierdo acento. Textos guía bajo títulos «1·…» / «2·…». Resumen en caja amarilla “Combinación ahora”.

---

## 2026-04-28 (6)

**Prompt:**

> ok, start adding all pages that only handle localStorage stuff, and link the buttons of the main page

**Outcome:** Rutas `/registrar-uso`, `/historial`, `/resumen`, `/combustible`, `/mantenimiento`, `/recordatorios`, `/opciones`, `/datos-vehiculo` con `PageShell` (Inicio). Datos en LS vía `storage-keys.ts`, `local-storage-data.ts`, tipos en `mecanipana-types.ts`. Inicio usa `Link` en la cuadrícula; cuenta sigue deshabilitada. `MecanipanaBodyClass` para “letra grande”. `VehicleDefaultPanel` usa `STORAGE_KEYS`.
