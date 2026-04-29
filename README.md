# Mecanipana

Web app (Next.js) para anotar **uso del carro**: viajes, combustible, mantenimiento, recordatorios, etc. Estilo **Windows 98**, texto grande, pensado para móvil y escritorio. Los datos de la primera versión viven en **`localStorage`** en el navegador.

## Documentación en el repo

| Archivo | Contenido |
| -------- | ---------- |
| [PROJECT.md](PROJECT.md) | Visión, alcance v1, UI/UX, stack (JSON + localStorage, Supabase más adelante). |
| [PROMPTS.md](PROMPTS.md) | Historial de prompts y resultados (decisiones y cambios). |
| [docs/storage-vs-database.md](docs/storage-vs-database.md) | Equivalencias `localStorage` ↔ tablas Supabase y nombres de campos. |

En Cursor, la regla [`.cursor/rules/prompts-history.mdc`](.cursor/rules/prompts-history.mdc) pide actualizar `PROMPTS.md` tras trabajo sustantivo pedido por el usuario.

## Requisitos

- [Node.js](https://nodejs.org/) (versión compatible con Next.js 16 del proyecto)

## Comandos

```bash
npm install
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000).

```bash
npm run build   # producción
npm run start   # sirve el build
npm run lint    # ESLint
```

## Estructura útil

- `src/app/` — rutas (App Router) y páginas.
- `src/components/` — UI, pantallas por feature, íconos.
- `src/lib/` — tipos, claves `localStorage`, helpers de datos.
- `src/data/defaults/` — JSON de catálogo (ej. vehículo por defecto).

## Licencia y despliegue

Proyecto privado (`"private": true` en `package.json`). El despliegue puede hacerse con cualquier hosting compatible con Next.js cuando lo necesites.
