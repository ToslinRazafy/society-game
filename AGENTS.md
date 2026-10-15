# AGENTS.md — Règles du projet « Society Game »

Ce fichier est la source d'autorité pour tout agent IA (et développeur humain) travaillant sur ce dépôt. Il doit être **mis à jour à chaque changement de règle ou de structure**.

## Contexte projet

Plateforme web pour un jeu de société. Stack : Next.js 16 (App Router, TypeScript, Tailwind 4, ESLint).
État détaillé du projet : lire `docs/ai-context.md` **avant toute tâche**.

## Workflow obligatoire (une feature = un cycle complet)

1. **Branche** — créer `feature/<nom-courte>` depuis `develop`. Jamais de commit direct sur `main` ou `develop` (sauf chore initial).
2. **Analyse** — décrire la tâche dans `docs/TASKS.md` (section *À faire*), identifier l'impact et les questions ouvertes.
3. **Décision** — si la tâche introduit une décision d'architecture/technique significative (stack, data model, auth, infra, dépendance majeure), rédiger un ADR dans `docs/adr/` (copier `docs/adr/template.md`). Les décisions mineures n'exigent pas d'ADR.
4. **Code** — implémenter en suivant les conventions ci-dessous.
5. **Test** — `npm run lint` + `npm run build` doivent passer sans erreur. Ajouter des tests si une suite est en place (voir TASKS.md).
6. **Documentation** — mettre à jour, dans le même commit ou un commit `docs:` :
   - `docs/ai-context.md` (architecture, décisions en vigueur, état réel)
   - `docs/TASKS.md` (tâche déplacée de *À faire* vers *Terminé*)
   - `docs/PLAN.md` si l'avancement d'une phase change
   - l'ADR correspondant si une décision a changé
7. **Commit** — messages au format Conventional Commits (`feat:`, `fix:`, `docs:`, `chore:`, `refactor:`, `test:`).
8. **Merge** — merger la feature dans `develop` (PR si remote configuré, sinon merge local). `develop` → `main` uniquement pour les releases, taggées `vX.Y.Z`.

## Conventions de code

- TypeScript strict, composants Server Components par défaut, `"use client"` seulement si nécessaire.
- Nommage : camelCase en JS/TS, kebab-case pour les fichiers et branches.
- Un fichier = une responsabilité ; découper au-delà de ~200 lignes.
- Pas de dépendance ajoutée sans ADR ou entrée dans TASKS.md la justifiant.

## Conventions de branches

| Branche | Rôle |
|---|---|
| `main` | Production, stable, tagguée |
| `develop` | Intégration des features |
| `feature/<nom>` | Une feature, depuis develop |
| `fix/<nom>` | Correctifs, depuis develop |
| `release/X.Y` | Préparation de release (optionnel) |

## Règles pour les agents IA

- Toujours commencer par lire `docs/ai-context.md` et `docs/TASKS.md`.
- Ne jamais supprimer une entrée de documentation historique (les ADR sont immuables ; on les remplace par un nouvel ADR avec `Status: Remplacé par ADR-XXXX`).
- Toute modification de comportement visible doit être documentée dans le même cycle.
- En cas d'ambiguïté bloquante, poser la question plutôt que deviner une décision d'architecture.
