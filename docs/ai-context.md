# AI Context — Society Game

> Snapshot de l'état réel du projet. Mis à jour à **chaque fin de cycle feature** (voir AGENTS.md).
> Dernière mise à jour : 2026-10-15

## Vision

Plateforme web pour un jeu de société : gérer les parties, les joueurs et le contenu du jeu en ligne.
Le design du jeu lui-même (règles, composants, tours) n'est pas encore défini — voir TASKS.md.

## Stack technique (en vigueur)

- **Framework** : Next.js 16.4, App Router (`src/app/`)
- **Langage** : TypeScript strict, React 19 (React Compiler activé via `babel-plugin-react-compiler`)
- **Style** : Tailwind CSS 4 (plugin `@tailwindcss/turbopack`)
- **Lint** : ESLint 9 (`eslint-config-next`)
- **Build** : `npm run dev` / `npm run build` / `npm run lint`

## Décisions en vigueur

| Sujet | Décision | Réf. |
|---|---|---|
| Stack frontend | Next.js + TS + Tailwind | ADR-0001 |
| Backend / base de données | Non décidé | — |
| Auth / comptes joueurs | Non décidé | — |
| Modèle de données du jeu | Non défini | — |

## Architecture actuelle

Structure minimale du scaffold Next.js :

- `src/app/layout.tsx` — layout racine
- `src/app/page.tsx` — page d'accueil (placeholder du scaffold)
- `src/app/globals.css` — styles globaux Tailwind
- `public/` — assets statiques

Aucun module métier n'existe encore.

## Documentations de référence

- `AGENTS.md` — workflow et règles
- `docs/adr/` — architecture decision records
- `docs/PLAN.md` — feuille de route par phases
- `docs/TASKS.md` — tâches terminées / en cours / à faire
