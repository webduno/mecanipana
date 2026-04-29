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

---

## 2026-04-28 (7)

**Prompt:**

> pon que se hizo como un select, e igual opciones predefinidas, y agregar custom con localstorage

**Outcome:** `mantenimiento-screen.tsx`: `<select>` con lista fija en código + extras desde LS (`mecanipana:maintenanceWhatCustom`). `loadMaintenanceWhatCustom` / `appendMaintenanceWhatCustom` en `local-storage-data.ts`. Botón `+` para añadir vía `prompt`. Clave en `storage-keys.ts`.

---

## 2026-04-28 (8)

**Prompt:**

> and add icons to this page aswell

**Outcome:** `PageShell` con `titleIcon` opcional. `/mantenimiento` pasa `IconMantenimiento`. Etiquetas del form y “Últimos registros” con `IconCalendario`, `IconMantenimiento`, `IconNota`, `IconHistorial`. Nuevos `IconCalendario` e `IconNota` en `grid-action-icons.tsx`. Clases `.win98-titlebar-icon`, `.win98-label--with-icon`, `.win98-label-icon` en `globals.css`.

---

## 2026-04-28 (9)

**Prompt:**

> put easy options like today, yesterday, last week, last 2 week, last month and so on, as well as last optionn be custom date so its easier to select,

**Outcome:** `mantenimiento-screen.tsx`: `<select>` de atajos (hoy, ayer, 1/2 semanas, 1/3 meses, “Otra fecha y hora…”) que actualiza `datetime-local`; edición manual fuerza modo personalizado.

---

## 2026-04-28 (10)

**Prompt:**

> add that to the cursor permanent rules of this project

**Outcome:** Regla `.cursor/rules/prompts-history.mdc` (`alwaysApply: true`): mantener `PROMPTS.md` tras trabajo sustantivo, formato y excepciones.

---

## 2026-04-28 (11)

**Prompt:**

> now update readmemd

**Outcome:** `README.md` específico del proyecto: qué es Mecanipana, tabla a `PROJECT.md` / `PROMPTS.md`, `npm` scripts, estructura `src/`, enlace a la regla Cursor.

---

## 2026-04-28 (12)

**Prompt:**

> always keep title to go back to home, but put navigation buttons floating on bottom right for easier access, and add shortcut buttons on top right corner of container, with info of current car, summary of data on localstorage

**Outcome:** `FloatingNav` (layout): iconos anclados abajo-derecha con enlaces a todas las pantallas. `ContainerShortcuts` en `page.tsx` y `page-shell.tsx`: dos botones estilo Win98 que abren diálogos con vehículo actual (`readSelectedVehicle`) y conteos/resumen de `localStorage`. Título **Mecanipana** enlaza a `/` en inicio y en barra de ventana interna; `body` con `pb-28` para no tapar contenido con la nave flotante.

---

## 2026-04-28 (13)

**Prompt:**

> on bottom right floating bar only add like back home and an action button related to the current page

**Outcome:** `floating-nav.tsx`: solo dos botones (Inicio + acción según ruta con `usePathname`). Ej.: inicio → Registrar uso; registrar-uso → Historial; combustible → Resumen; mantenimiento ↔ recordatorios; opciones ↔ datos vehículo. `body` `pb-20` al ser más baja la barra.

---

## 2026-04-28 (14)

**Prompt:**

> datos del equipo are not well aligned, and also put it in grid for better ui ux

**Outcome:** Diálogo «Datos en este equipo» en `container-shortcuts.tsx`: cuadrícula 2×2 de fichas para los cuatro conteos principales (etiquetas arriba, número grande alineado a la derecha); debajo tabla tipo lista con `grid` etiqueta/valor alineados (tipos personalizados, notas, fuentes grandes); pie en recuadro; scroll interno y ancho máximo ~28rem.

---

## 2026-04-28 (15)

**Prompt:**

> aca mejor unifica en un solo boton con 1 modal, con tabs

**Outcome:** `container-shortcuts.tsx`: un solo botón azul (iconos carro + gráfico, leyenda «Info») abre un modal «Este equipo» con pestañas **Carro** / **Datos** (`role="tablist"` / `tabpanel`), contenido anterior repartido; al abrir vuelve a la pestaña Carro.

---

## 2026-04-28 (16)

**Prompt:**

> this modal is not in the middle of screen, also, blur out with css the background

**Outcome:** `dialog` del modal «Este equipo»: `fixed` + `top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2` + `z-[150]`; clase `globals.css` `dialog.mp-overlay-dialog::backdrop` con `backdrop-filter`/`-webkit-backdrop-filter` blur 8px y overlay ~45% negro.

---

## 2026-04-28 (17)

**Prompt:**

> same for this one (modal still top-left / no blur — screenshot)

**Outcome:** Portal del `<dialog>` a `document.body` (`createPortal` tras montaje cliente); `globals.css` reglas `dialog.mp-overlay-dialog[open]` (`fixed inset:0`, flex centrado, sin tamaño heredado). Clic fuera del panel sigue cerrando.

---

## 2026-04-28 (18)

**Prompt:**

> add this landing inner container into the modal i think, so its one single screen without scroll on landingpage

**Outcome:** `VehicleDefaultPanel` dejó la landing (`page.tsx`) y vive en la pestaña **Carro** del modal Info (`container-shortcuts.tsx`), más enlace a datos del vehículo; texto intro menciona **Info**. Modal algo más ancho (`~34rem`) y más alto permitido (`max-h` ~92vh/44rem). Landing solo intro + rejilla + sidebar.

---

## 2026-04-28 (19)

**Prompt:**

> put button on top bar and put description concise in 3 sentences one each line, and with icons for easier understanding

**Outcome:** Landing: botón **Info** en la barra azul (`justify-between`, título truncado + `ContainerShortcuts`); tres frases en líneas aparte con `IconRegistrar`, `IconOpciones`, `IconVehiculo` + clase `win98-label-icon`. Botón Info algo más compacto para la titlebar.

---

## 2026-04-28 (20)

**Prompt:**

> put mi info on top bar on other pages aswell

**Outcome:** `page-shell.tsx`: `ContainerShortcuts` pasa del `win98-body` al `win98-titlebar`, a la derecha (`justify-between`): bloque izquierdo `Mecanipana` + título/página truncados, mismo patrón que la landing.

---

## 2026-04-28 (21)

**Prompt:**

> can you make sure all pages use the same header and initial button component of mi info with modal, and able to add more buttons to navbar with their own modals

**Outcome:** `AppWindowShell` unifica landing + páginas internas (titlebar + `win98-body`). `HeaderToolbar` siempre monta `EsteEquipoModalControl` (`este-equipo-modal.tsx`) + prop `extra`. `PageShell` delega en `AppWindowShell variant="page"` con `headerActionsExtra`. Landing usa `AppWindowShell variant="landing"`. Eliminado `container-shortcuts.tsx`. `Win98ChromeModal`: helper para otro botón cuadrado + modal con portal y `mp-overlay-dialog`.

---

## 2026-04-28 (22)

**Prompt:**

> are these supposed to overlap and hide parts like that on these screen size?

**Outcome:** No era intencional: paneles de pestaña tenían `min-h-0` y podían encogerse en el flex del `win98-body`, con desbordamiento bajo el botón «Cerrar». Sustituido por `shrink-0` en ambos `tabpanel` en `este-equipo-modal.tsx` para que el scroll sea el del cuerpo del modal y no se tape el contenido.

---

## 2026-04-28 (23)

**Prompt:**

> ok, add the normals car used in venezuela, research and add them to those jsons

**Outcome:** `vehicle-catalog.json`: marcas/modelos frecuentes en Venezuela (flota clásica + Toyota/Chevrolet/Ford/Renault/etc. y entradas JAC/Changan/Chery/BYD). `vehicle-default-panel.tsx`: listas desplegables rellenan todas las líneas y variantes del catálogo; `localStorage` solo guarda extras; `mergeUnique` evita duplicados.

---

## 2026-04-28 (24)

**Prompt:**

> i put mecanipanalogo png and ico, use them

**Outcome:** `public/mecanipanalogo.ico` copiado a `src/app/favicon.ico`; `layout.tsx`: `metadata.icons` (favicon + apple PNG). `app-window-shell.tsx`: logo PNG junto a «Mecanipana» en barra de título (landing e interior).

---

## 2026-04-28 (25)

**Prompt:**

> para nota agrega un boton a la derecha del label de "nota" que agregue una opcion predefenida, tambien ponla en un json y permite agregar a localstorage

**Outcome:** `src/data/defaults/usage-note-presets.json` con frases por defecto; `STORAGE_KEYS.extraUsageNotePresets`; `registro-uso-screen.tsx`: fila del label Nota con `<select>` «Frases rápidas» (inserta texto en el área) y botón **+ Frase** (prompt → lista persistente). Datos del JSON solo lectura; extras solo en localStorage.

---

## 2026-04-28 (26)

**Prompt:**

> now generate what the initial script to create the database would be, make it idempotent, and ill then run it on supabase and then tell you waht to do

**Outcome:** `supabase/migrations/20260428120000_initial_schema.sql`: tablas alineadas al modelo local (`profiles`, `vehicle_context`, `app_options`, logs, listas extra), RLS por `auth.uid()`, trigger `handle_new_user`, backfill idempotente para `auth.users` existentes, grants.

---

## 2026-04-28 (27)

**Prompt:**

> make sure to save not only the profile info, but the config like theme since it will be changable, language, custom options for almos each select like weve added, all that for initial migration

**Outcome:** Migración inicial ampliada: `profiles` (display_name, avatar_url, updated_at); `app_options` (theme, locale, fuentes_grandes, preferences_extra jsonb); tabla `user_extra_usage_kinds`; `ALTER ADD COLUMN IF NOT EXISTS` para upgrades; política INSERT en profiles; comentarios SQL y notas al pie del script.

---

## 2026-04-28 (28)

**Prompt:**

> add an md that compares whats saved under wha key and under db how its saved to help people keep track, in another md please

**Outcome:** `docs/storage-vs-database.md`: tablas clave `localStorage` ↔ Supabase, mapeo camelCase/snake_case por entidad, notas sobre datos solo local vs solo DB.

---

## 2026-04-28 (29)

**Prompt:**

> add 2 more themes, neumorphism, and facephism (like facebook ui), implement them on css and add the toggle on menu and save on localstorage and add to db init migration if necesary, and remember to add this to prompts.md

**Outcome:** `THEME_IDS` + `theme` en `AppOptions`; `src/app/themes.css` + import en layout; `theme-ui.ts` (`applyThemeToDocument`, etiquetas); Opciones: radios de tema + persistencia; `MecanipanaBodyClass` aplica tema; `mp-floating-nav` para estilos; migración: `COMMENT` de `app_options.theme` con valores permitidos; modal Mi Info muestra tema; `docs/storage-vs-database.md` actualizado.

---

## 2026-04-28 (30)

**Prompt:**

> put year then motor to sort better on select, and separate in 2 selects, side by side always , as to select better

**Outcome:** `vehicle-default-panel.tsx`: dos `<select>` en fila (`Año` | `Motor`), opciones ordenadas por año ascendente y luego cilindraje; persistencia sigue siendo `motor · año` en `mecanipana:selectedVariant`; lista de variantes ordenada igual; validación al añadir versión personalizada.

---

## 2026-04-28 (31)

**Prompt:**

> is current year calculated automatically? it should, and put cars since 1944

**Outcome:** `yearSelectRange()`: `new Date().getFullYear()` como tope mínimo junto al catálogo; lista desde `MIN_VEHICLE_YEAR` (1944) hasta ese máximo; años sin variantes en lista aparecen deshabilitados en el `<select>` de año.

---

## 2026-04-28 (32)

**Prompt:**

> separate aswell fiat siena with fiat and siena on different selects, and adjust predefined jsons

**Outcome:** `vehicle-default-panel.tsx`: selects «Marca» y «Modelo» en fila; parsing por prefijo de marca del catálogo (orden por longitud de nombre); `selectedVehicleLine` sigue siendo `marca + espacio + modelo`. `vehicle-catalog.json`: objeto `meta.savedVehicleLineFormat` documentando el formato; extras con dos prompts (marca / modelo).

---

## 2026-04-28 (33)

**Prompt:**

> do these buttons do something to save on localstorage? if not fix it

**Outcome:** Confirmado: `+ Carro` escribe `extraVehicleLines` + `selectedVehicleLine`; `+ Motor` escribe `extraVariantLabels` + `selectedVariant`. Ajuste: si la combinación ya está en catálogo o en extras, igualmente se actualiza la selección persistida (antes se salía sin `persistLine` / `persistVariant`).

---

## 2026-04-28 (34)

**Prompt:**

> put opciones in red, and put ver historial and agregar info next so its rgb, but at the bottom, and the grey bottoms would be first, but add a border to the three in the horizontal middle, like the three at the bottom have full bg color, and the three on top just like the are right now

**Outcome:** `page.tsx`: fila superior gris tipo Win98 — Resumen, Datos del vehículo, Cuenta — próximamente; fila media — Combustible, Mantenimiento, Recordatorios con clase `.win98-btn-tile--mid-row-frame` (contorno oscuro); fila inferior RGB — Opciones (`.win98-btn--accent-red`), Ver historial (verde), Agregar Info (azul). Nuevo estilo rojo en `globals.css`; temas neumorphism / facephism para rojo en `themes.css`.

---

## 2026-04-28 (35)

**Prompt:**

> the middle borders should have their own color, neon green for combustible, pink on mantenimiento , and yellow on recordatorios

**Outcome:** `globals.css`: tres contornos — `.win98-btn-tile--mid-frame-combustible` (#39ff14), mantenimiento (#ff6ec7), recordatorios (#fff01f). `page.tsx`: cada ficha usa su clase.

---

## 2026-04-28 (36)

**Prompt:**

> do inner shadow instead

**Outcome:** Misma fila media; reemplazados `outline` por `box-shadow` inset en degradado (#39ff14, #ff6ec7 / rgb, #fff01f).

---

## 2026-04-28 (37)

**Prompt:**

> add those inner shadow on neumorphism and fix title of mecanipana color

**Outcome:** `themes.css`: mismas luces inset + sombras gemelas elevadas por color en modo neumorphism (incluye `:active` por color); `app-window-shell.tsx`: enlace de marca usa `text-inherit` / `decoration-current` para heredar `#2d3748` en neumorphism (corrige texto blanco forzado) y mantener contrastes en tema Win98 y Facephism.

---

## 2026-04-28 (38)

**Prompt:**

> also for facebook

**Outcome:** Tema Facephism: mismas fichas intermedias con luces inset (verde / rosa / amarillo) + sombra tipo tarjeta `0 1px 3px`; `:active` con fondo gris tema + inset.

---

## 2026-04-28 (39)

**Prompt:**

> agrega un select de urgencia como principal, 4 opciones, urgente(75), importante(50), pendiente (25) y custom que es un numero del 1 al 100, ese orden servira despues para un tablero especial, agregalo al nitial migration script, igual para mantenimiento

**Outcome:** Tipos `UsageEntry` y `MaintenanceEntry` con `urgencia` 1–100; `UrgenciaField` + helpers en `urgencia-field.tsx`; formularios «Registrar uso» y «Mantenimiento» con urgencia arriba; `localStorage`/histórico normalizan legacy con 50; `HistoryRow.urgencia`; migración `20260428120000_initial_schema.sql`: columnas `urgencia`, CHECK, índices por `(user_id, urgencia DESC)`, bloque ALTER idempotente.

---

## 2026-04-28 (40)

**Prompt:**

> we will start adding endpoints to also save to databse on supabase, they will all fail for now, but it will still add to localstorage, just add catch with consolelog to keep track of which one fails when i actually connect with env vars, add endpoints with the initial migration script in mind
>
> remember when a maintnance or registrar uso is added, it should add the id and actual value, since they can be changed later, and they can be cutom only for localstorage, the ones in localstorage also saved on db but only pure string, not local storage id it has

**Outcome:** Dependencia `@supabase/supabase-js`; rutas `POST /api/usage-entries` y `POST /api/maintenance-entries` (columnas alineadas a migración, `SUPABASE_SYNC_USER_ID` + service role hasta login); cliente `sync-log-entries-remote.ts` sólo payloads string (snake_case API) después de guardar entrada con `makeId`; `makeId()` siempre UUID; `.env.example`. Fallos esperados hasta env: `console.log`/`console.warn`.

---

## 2026-04-28 (41)

**Prompt:**

> i havent checked, but make sure to add login page, and to save and keep track of auth key to handle rls, also add a new button here only visible for admin affter they login, add admin by default admin@mecanipana.com hardcoded with "test" as password when logging in, and also add in initial script migration

**Outcome:** `@supabase/ssr` + cookies (middleware); `SupabaseAuthProvider` + `HeaderAuth` (Entrar/Salir); `/login` con `signInWithPassword`; constante `DEFAULT_ADMIN_EMAIL`, contraseña **no** hardcodeada (documentada «test» vía crear usuario en Supabase Auth); `/admin` (dinámico) protegido por email admin; landing `HomePageClient`: botón «Administración» si admin; `getLogInsertContext` prioriza JWT y RLS, fallback SYNC; fetch sync `credentials: "include"`; migración: tabla `admin_emails` + fila `admin@mecanipana.com`; `.env.example` con `NEXT_PUBLIC_SUPABASE_ANON_KEY`.

---

## 2026-04-28 (42)

**Prompt:**

> does it start sending requests to supabase if its just entered the website and start adding stuff like maintinace of services? cuz it shouldnt, unles it has clicked some kind of login or register button

**Outcome:** Middleware solo llama `updateSession` si hay cookies `sb-*` de sesión; `pushUsageEntryRemote` / `pushMaintenanceEntryRemote` hacen `getSession()` y no hacen `fetch` a `/api` sin usuario. localStorage sigue igual sin login.

---

## 2026-04-28 (43)

**Prompt:**

> add toast notification component, and implement when adding a mantenimiento or agregar info

**Outcome:** `ToastProvider` + `useToast()` en `src/components/toast-provider.tsx`, envuelve la app en `app-providers.tsx`; estilo `.mp-toast` (Win98 + themes); toasts al guardar en `mantenimiento-screen` y `registro-uso-screen` («Agregar Info»).

---

## 2026-04-28 (44)

**Prompt:**

> hace falta un boton de restaurar, y pon los tres botones en horizontal

**Outcome:** Opciones: botón «Restaurar», fila de acciones con `.win98-form-actions--row`; `importAllLocalPayload` en `local-storage-data.ts`; textarea siempre visible para pegar JSON; confirmación antes de aplicar.

---

## 2026-04-28 (45)

**Prompt:**

> esta pantalla no se entiende

**Outcome:** Pantalla «Datos del vehículo»: copy más claro (qué es modelo vs notas, guardado local); estado vacío con enlace al inicio en lugar de «—»; botón «Volver a leer desde el inicio» + texto de ayuda; título corto en barra «Tu vehículo»; `title` en `AppWindowShell` para títulos truncados.

---

## 2026-04-28 (46)

**Prompt:**

> pero donde se escoge?

**Outcome:** Aclarado en código que la elección es barra azul → **Mi Info** → **Este equipo** → pestaña **Carro** (`VehicleDefaultPanel`); landing y pantalla «Tu vehículo» actualizadas (antes hablaban de «inicio» de forma confusa).

---

## 2026-04-28 (47)

**Prompt:**

> pero si ya esta seleccionado y no hay otro boton? porque dice que no tengo ninguno seleccionado en la otra pantalla y aca si sale?

**Outcome:** El panel mostraba la combinación por defecto solo en estado React; no escribía `selectedVehicleLine` / `selectedVariant` en localStorage hasta que el usuario tocaba un selector. En hidratación se persisten `nextLine` y `nextVariant` para que coincida con lo que muestra «Combinación ahora» y con `readSelectedVehicle()` en otras pantallas.

---

## 2026-04-28 (48)

**Prompt:**

> este select deberia ser igual, incluso usar el mismo componente, para lo de "hoy, ayer, hace 1 semana" yy eso

**Outcome:** Nuevo `src/components/date-preset-field.tsx` (`DatePresetField`, `useDatePresetState`, opciones Hoy/Ayer/semanas/meses/Otra fecha… + `datetime-local`). Usado en Combustible, Mantenimiento y Registrar info (antes solo Man tenía el patrón).

---

## 2026-04-28 (49)

**Prompt:**

> en pagina resumen, debe aparecer una grilla como la de github de actividad, y cada color es diferente para uso carga de gas o mantenimiento, por default solo usa local storage, y agrega un toggle que diga usar info de base de datos pero bloqueado por ahora, disabled

**Outcome:** `activity-contribution-grid.tsx`: grilla ~26 semanas × 7 días (Dom→Sáb), colores `#000080` / `#b35900` / `#1f6b3a` por tipo; mezcla el mismo día en franjas; solo datos de `loadUsageLog`/`loadFuelLog`/`loadMaintenanceLog`; leyenda; toggle «Usar info de base de datos» deshabilitado + texto «solo locales».

---

## 2026-04-28 (50)

**Prompt:**

> put the button subtler; if notes empty, button to fill a quick 9 question questionnaire — new page in Spanish basic questions for current car state — model and year already from Mi Info; initial load nothing preselected in selectors; animate Mi Info so user fills first; gate data pages until Mi Info configured at least.

**Outcome:** Primera selección sin prellenado en `VehicleDefaultPanel` (sin escritura LS automática hasta el usuario); `isVehicleProfileComplete()` + evento `mecanipana:vehicle`; `VehicleSetupGate` + tablero y pantallas datos bloqueadas; pulso `.mp-mi-info-pulse` en Mi Info; ruta `/datos-vehiculo/cuestionario` y `appendQuestionnaireParagraphToVehicleNotes`; «Volver a leer» como enlace discreto; util `vehicle-variant-parse.ts`.

---

## 2026-04-28 (51)

**Prompt:**

> remove that text and put cta to pick car

**Outcome:** Quitado bloque «Empieza por tu carro»; botón azul «Escoger mi carro» que dispara `OPEN_MI_INFO_EVENT` (`mecanipana:open-mi-info`); `EsteEquipoModalControl` escucha y abre el modal en pestaña Carro.

---

## 2026-04-28 (52)

**Prompt:**

> esta raro este teexto, arregla los 3 puntos con algo mejor

**Outcome:** En `home-page.tsx` los tres textos pasan a títulos breves («Tu carro», «Tus registros», «Este equipo primero») + copy más claro; primera viñeta depende de `canGo` (botón azul vs cambiar de vehículo).

---

## 2026-04-28 (53)

**Prompt:**

> why dont these add to local storage? (botones + Carro / + Motor en Mi Info)

**Outcome:** Antes sólo funcionaban tras `window.prompt` (malo en Safari/móvil; cancelar no guardaba). Ahora `+ Carro` y `+ Motor` abren paneles Win98 con campos, validación visible y mismo guardado (`extraVehicleLines` / `extraVariantLabels`).

---

## 2026-04-28 (54)

**Prompt:**

> pon esto msa concise, deberian ser catchy phrases, simple

**Outcome:** Tres viñetas de la home acortadas a frases directas («Atajo», «¿Otro carro?», «un toque un dato», «viene en camino» para sync) en `home-page.tsx`.

---

## 2026-04-28 (55)

**Prompt:**

> quita todo ese texto solo deja titulos y labels

**Outcome:** En `vehicle-default-panel.tsx` se quitaron los párrafos de ayuda bajo «1· Marca y modelo» y «2· …», los textos bajo los formularios + Carro / + Motor (salvo errores), y el párrafo final sobre guardado automático; `aria-describedby` del campo motor solo cuando hay error.

---

## 2026-04-28 (56)

**Prompt:**

> sort reversed, latest year at the top

**Outcome:** En `vehicle-default-panel.tsx`, `yearSelectRange()` rellena el array de año a año de mayor a menor (`maxY … minY`) para que el `<select>` «Año» muestre el año más reciente arriba.

---

## 2026-04-28 (57)

**Prompt:**

> Quitar «Resumen de lo guardado en localStorage (clave `mecanipana:*`)» del modal Carro seleccionado; que solo figure al hacer respaldo/restaurar.

**Outcome:** El párrafo se eliminó de la pestaña «Datos» en `este-equipo-modal.tsx` y se añadió solo en Opciones (`opciones-screen.tsx`), bloque «Respaldo (copiar datos)».

---

## 2026-04-28 (58)

**Prompt:**

> Al escoger carro: botón verde «Guardar» y «Cancelar», que no se guarde en cada cambio de select; botones sin fondo de color (normales); con carro guardado el recuadro inferior amarillo pasa a verde (éxito) y se ocultan Guardar/Cancelar.

**Outcome:** En `vehicle-default-panel.tsx` estado borrador vs `committed*`; persistencia solo al Guardar; Cancel revierte; botones `win98-btn` compactos con texto «Guardar» en verde; recuadro `win98-vehicle-resumen-box--saved` en `globals.css`.

---

