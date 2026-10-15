# ADR — Architecture Decision Records

Un ADR documente une décision d'architecture significative : contexte, options, choix, conséquences.

## Règles

- **Immuables** : on ne modifie pas un ADR accepté ; on en écrit un nouveau qui le remplace (et on passe l'ancien à `Status: Remplacé par ADR-XXXX`).
- **Numerotation** : `NNNN-titre-kebab-case.md`, séquentiel.
- **Statuts** : `Proposé` → `Accepté` / `Rejeté` → éventuellement `Remplacé par ADR-XXXX` / `Obsolète`.
- **Quand** : stack, dépendance majeure, modèle de données, auth, infra, format de données, stratégie de test.

## Index

| ID | Titre | Status |
|---|---|---|
| [0001](0001-stack-front-end-nextjs.md) | Stack front-end : Next.js + TypeScript + Tailwind | Accepté |
| [0002](0002-modele-plateau-regles.md) | Modèle du plateau (graphe 32 nœuds) et règles centrales | Accepté (bonus remplacé par 0004) |
| [0003](0003-suite-de-tests-vitest.md) | Vitest comme suite de tests | Accepté |
| [0004](0004-chaine-de-sauts.md) | Chaîne de sauts — le coup supplémentaire peut capturer | Accepté |
| [0005](0005-rendu-3d-three-js.md) | Rendu 3D du plateau (three.js + react-three-fiber) | Accepté |
| [0006](0006-architecture-multi-jeux.md) | Architecture multi-jeux : registre + routes /jeux (PlayBoard) | Accepté |
