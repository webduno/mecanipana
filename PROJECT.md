# Mecanipana — car usage tracker

## What it is

A **Next.js** web app to track car usage (fuel, maintenance, trips, etc.). First runs on **localhost**; later, **Supabase** backs **account sync** so the same data can move from PC to phone.

## Scope (v1)

- **Vehicle catalog (fixed for now):** Fiat → **Siena** → **1.4** → **2008** only.
- **Data:** Default/reference data lives in **JSON files** in the repo. User-specific choices and app state use **`localStorage`** (custom options populated there, not hard-coded in JSON).
- **Auth (when online sync is wired):** Email + password only. **No** Google (or other OAuth) in the first version.
- **Supabase:** Used to tie a user account to synced data across devices—not required for pure offline/local-first v1.

## UI / UX

- Very **simple**, for **non-technical** users: **large text**, **large tap targets**, clear labels.
- **Visual style:** **Windows 98**–inspired (chunky borders, classic gray/beige feel, readable system-like controls).
- **Layout:** **Mobile-first**, with **desktop** layouts that use extra width (e.g. wider tables, side-by-side panels) without cramming the small-screen view.

## Tech summary

| Piece        | Role                                              |
| ------------ | ------------------------------------------------- |
| Next.js      | App framework                                     |
| JSON defaults | Ships with app; versioned in repo                |
| localStorage | User overrides / custom options / local state     |
| Supabase     | Future: sync + email/password identity            |
