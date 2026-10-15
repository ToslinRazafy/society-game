# AI Context — Society Game / Fanorina 7

> Snapshot de l'état réel du projet. Mis à jour à **chaque fin de cycle feature** (voir AGENTS.md).
> Dernière mise à jour : 2026-10-15 (feature/plateau-3d)

## Vision

Plateforme web hébergeant **Fanorina 7**, jeu de stratégie numérique inspiré des jeux de plateau à
déplacements de pierres et éliminations par saut. 2 à 4 joueurs, 7 pierres chacun, dernier en jeu
gagné. Référence visuelle du plateau : `public/assets/fanorina-7-plateau-reference.png`.

## Stack technique (en vigueur)

- **Framework** : Next.js 16.4, App Router (`src/app/`)
- **Langage** : TypeScript strict, React 19 (React Compiler)
- **Style** : Tailwind CSS 4 ; thème sombre (#0f172a)
- **Lint** : ESLint 9 ; **Tests** : Vitest 5 (`npm test`)
- **Commandes** : `npm run dev` / `lint` / `test` / `build`

## Décisions en vigueur

| Sujet | Décision | Réf. |
|---|---|---|
| Stack frontend | Next.js + TS + Tailwind | ADR-0001 |
| Plateau | Graphe 32 nœuds, centre non jouable, départ 7/9 par bras | ADR-0002 |
| Règles | Moteur pur immuable ; capture → chaîne de sauts (le coup supplémentaire peut recapturer) ; victoire immédiate | ADR-0002 + ADR-0004 |
| Tests | Vitest, co-localisation `*.test.ts` | ADR-0003 |
| Backend / persistance | Non décidé (partie 100 % client pour l'instant) | — |
| Auth / comptes joueurs | Non décidé | — |
| Rendu plateau | 3D temps réel : three.js + @react-three/fiber (+ drei), client-only (`ssr:false`) | ADR-0005 |
| Mode IA / en ligne | Architecturé (moteur pur), non implémenté | — |

## Architecture actuelle

```
src/
  game/           # MOTEUR PUR (aucun import React/DOM)
    board.ts      # graphe : nœuds, arêtes, zones de départ (source de vérité)
    engine.ts     # état GameState, legalMoves, applyMove, tours, victoire
    *.test.ts     # 28 tests (invariants du graphe + toutes les règles)
  components/
    Home.tsx      # accueil : nb joueurs, axe 2P, 1er joueur, réglages
    GameScreen.tsx# écran de partie : orchestration, HUD, toasts, overlays
    Board3D.tsx   # rendu 3D (three.js/r3f) : plaques, arêtes cylinders, pierres animées
  lib/
    settings.ts   # préférences localStorage (animations lues au rendu du Board3D)
  app/
    page.tsx      # /            (accueil)
    partie/page   # /partie?joueurs=&axe=&premier=  (Suspense + GameScreen)
    regles/page   # /regles      (règles statiques)
public/assets/    # dessin de référence du plateau
```

États du tour (`Phase`) : `select` (choix d'une pierre) → `bonus` (la pierre ayant sauté rejoue —
déplacement normal OU nouveau saut : chaîne de sauts, ADR-0004) → `over`. Les animations de pierres
reposent sur l'identité stable `Stone.id` + interpolation de position dans `useFrame` (ADR-0005).

## Limites connues / prochaines étapes

- Pas de persistance de partie (refresh = nouvelle partie), pas d'IA, pas de multi-appareils.
- Le plateau 3D exige WebGL (navigateur) : pas de rendu serveur ni de fallback 2D (ADR-0005).
- Pas de tests de composants UI (décision ADR à venir si besoin).
- Validation du ressenti en jeu réel (équilibrage, lisibilité des indices visuels).
