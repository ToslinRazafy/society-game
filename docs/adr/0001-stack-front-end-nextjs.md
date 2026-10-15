# ADR-0001 : Stack front-end — Next.js + TypeScript + Tailwind

- **Status** : Accepté
- **Date** : 2026-10-15
- **Contexte de la tâche** : initialisation du projet

## Contexte

Nous démarrons une plateforme web pour un jeu de société. Il faut une base qui serve à la fois le site vitrine, les interfaces de jeu et, à terme, les espaces joueurs. Le projet doit être lisible par des agents IA et maintenir un cycle analyse → décision → code → test → docs.

## Options envisagées

1. **Next.js (App Router) + TypeScript + Tailwind** — fullstack unifié, SSR/ISR, écosystème large, un seul dépôt. / couplage framework-métier.
2. **SPA Vite + API séparée** — découplage net. / deux projets, plus de surface à maintenir au démarrage.
3. **SvelteKit / Astro** — légers. / moins de synergies avec l'équipe et les outils existants.

## Décision

Next.js 16 + React 19 + TypeScript strict + Tailwind 4, retenus par le scaffold initial. Un dépôt unique, `src/app/` comme point d'entrée.

## Conséquences

- Backend possible en Route Handlers sans changer de dépôt ; le choix base de données / auth reste ouvert (voir TASKS.md).
- Le rendu React 19 avec React Compiler est actif : éviter les mémoïsations manuelles inutiles.
- Toute dépendance lourde (UI kit, ORM, moteur de jeu) devra passer par un nouvel ADR.
