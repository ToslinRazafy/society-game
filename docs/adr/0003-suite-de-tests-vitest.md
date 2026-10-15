# ADR-0003 : Vitest comme suite de tests

- **Status** : Accepté
- **Date** : 2026-10-15
- **Contexte de la tâche** : feature/fanorina-7, clôture T-004

## Contexte

Le moteur de jeu est de la logique pure ; ses règles (captures, bonus, tours, victoire) sont
difficiles à valider manuellement de façon exhaustive. La tâche T-004 prévoyait le choix formel
d'une suite de tests.

## Décision

**Vitest 5** (`npm test` → `vitest run`), tests unitaires en co-localisation (`*.test.ts` à côté
des sources). Montée de `@types/node` de ^20 à ^22 (exigence peer de Vitest 5 ; runtime Node 24
déjà présent).

## Conséquences

- Étape « Test » du workflow = `npm run lint && npm test && npm run build`.
- Pas encore de tests de composants React (Testing Library non installé) ; à décider par un futur
  ADR si le besoin apparaît (ex. avant le mode en ligne).
