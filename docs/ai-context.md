# AI Context — PlayBoard (ex-Society Game)

> Snapshot de l'état réel du projet. Mis à jour à **chaque fin de cycle feature** (voir AGENTS.md).
> Dernière mise à jour : 2026-10-16 (feature/monopoly)

## Vision

Plateforme web **PlayBoard** hébergeant plusieurs jeux de société en multijoueur local (même
appareil). Jeux disponibles : **Fanorina 7** (2 à 4 joueurs, 7 pierres chacun, dernier en jeu
gagné ; référence visuelle : `public/assets/fanorina-7-plateau-reference.png`) et **Monopoly
Premium** (2 à 8 joueurs, édition française classique, mode officiel ; voir
`src/games/monopoly/`). Backlog : Fanorona (spec dans `docs/GAME-INTGRATION.md`).
Parcours : landing → catalogue → présentation/configuration → partie.

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
| Architecture multi-jeux | Registre `src/games/registry.ts` + un dossier par jeu + routes `/jeux/[slug]` ; jeux `soon` au catalogue sans partie | ADR-0006 |
| Navigation plateforme | Landing `/` → catalogue `/jeux` → page jeu (présentation + config) → `/jeux/[slug]/partie` | ADR-0006 |
| Modèle Monopoly | Moteur pur immuable, machine à phases explicite (`roll → resolveBuy → auction → awaitPayment → manage → over`), dés injectables, transactions atomiques banque↔joueur, pas de sauvegarde en V1 (GameState sérialisable) | ADR-0007 |
| Mode IA / en ligne | Architecturé (moteur pur), non implémenté | — |

## Architecture actuelle

```
src/
  games/
    registry.ts   # MÉTADONNÉES DE TOUS LES JEUX (source de vérité du catalogue) + getGame/categories
    registry.test.ts
    fanorina-7/   # UN JEU = UN DOSSIER (moteur + rendu + écran + setup)
      board.ts / board.test.ts      # graphe 32 nœuds (moteur pur, inchangé)
      engine.ts / engine.test.ts    # état, legalMoves, applyMove, chaîne de sauts (inchangé)
      Board3D.tsx                   # rendu 3D three.js/r3f
      GameScreen.tsx                # écran de partie (noms joueurs via ?noms=)
      FanorinaSetup.tsx             # configuration : nb joueurs, noms, 1er joueur, animations
    monopoly/     # Monopoly Premium — moteur pur + UI (ADR-0007)
      types.ts / state.ts           # GameState, PlayerState, PropertyState, Command, Phase, AuctionState, DebtState, TradeOffer
      board-data.ts(+test)          # config unique 40 cases (SPACES, GROUP_COLORS, TOKENS), constants FR (1500, GO 200…)
      rng.ts                        # mulberry32 seedé + rollDice(rng) — dés injectables
      cards.ts(+test)               # decks Chance / Communauté (ordre fixe, mélangé au départ)
      finance.ts                    # payTo / receive atomiques, faillite, dette banque vs joueur
      moves.ts                      # déplacement, cases Go/Prison/Free Parking…, impôts, tirage de carte
      properties.ts                 # achat, enchères obligatoires, construction/vente équilibrées, hypothèques, échanges
      engine.ts(+test)              # applyCommand : dispatcher immuable par phase, illegal → même référence
      jail.test.ts / economy.test.ts / trade-bankrupt.test.ts / invariants.test.ts / test-helpers.ts
      Board.tsx                     # plateau CSS grid 11×11 (40 cases, pions, maisons/hôtels, hypothèque)
      MonopolySetup.tsx             # config : 2–8 joueurs, noms, pions uniques → ?joueurs=&noms=&pions=
      MonopolyScreen.tsx            # écran de partie : phase machine, enchères, dettes, échanges, fin de partie
      ActionBar.tsx / SidePanels.tsx / TradeModal.tsx / PropertyPanel.tsx
  components/     # PARTAGÉ SITE (pas de logique de jeu)
    SiteHeader.tsx  # logo PlayBoard + nav + CTA (mobile : menu déroulant)
    SiteFooter.tsx
    GameCard.tsx    # carte catalogue : illustration, badge live/soon, métadonnées
  lib/
    settings.ts   # préférences localStorage (animations)
  app/
    page.tsx               # /                    landing (hero, concept, à la une, étapes, avantages)
    jeux/page.tsx          # /jeux                catalogue (filtres catégorie + disponibles)
    jeux/[slug]/page.tsx   # /jeux/…              présentation + config (FanorinaSetup ou MonopolySetup)
    jeux/[slug]/partie/    # /jeux/…/partie?...   écran de jeu (PLAY_SCREENS, Suspense)
    regles/page.tsx        # /regles              règles Fanorina 7
    regles/monopoly/       # /regles/monopoly     règles Monopoly (édition française, mode officiel)
public/assets/    # logo.png (PlayBoard), références/illustrations des plateaux
```

États du tour Fanorina (`Phase`) : `select` (choix d'une pierre) → `bonus` (la pierre ayant sauté
rejoue — déplacement normal OU nouveau saut : chaîne de sauts, ADR-0004) → `over`. Les animations
de pierres reposent sur l'identité stable `Stone.id` + interpolation de position dans `useFrame`
(ADR-0005).

États du tour Monopoly (`Phase`) : `roll` (lancer les dés) → `resolveBuy` (achat ou mise aux
enchères obligatoire) → `auction` (tour d'enchères) → `awaitPayment` (payer loyer/amende ou lever
des fonds) → `manage` (constructions, hypothèques, échanges, fin de tour) → `over` (dernier solvable
gagné). Les sous-états d'attente décrits dans ADR-0007 (`moving`, `awaitBuy`, `awaitCard`…) ont été
consolidés dans ces six phases à l'implémentation. La partie se joue en hot-seat : tous les
commandements passent par `applyCommand(prev, command)` ; les animations/actions UI ne mutent
jamais l'état.

## Limites connues / prochaines étapes

- Pas de persistance de partie (refresh = nouvelle partie), pas d'IA, pas de multi-appareils ;
  le `GameState` Monopoly est sérialisable, prêt pour T-002 (backend/replay à cadrer).
- Le plateau 3D Fanorina exige WebGL (navigateur) : pas de rendu serveur ni de fallback 2D (ADR-0005).
- Monopoly : pas d'animations de pions (déplacement instantané), pas de sons, échanges limités au
  hot-seat (l'autre joueur saisit sa réponse sur le même appareil).
- Pas de tests de composants UI (décision ADR à venir si besoin) ; le moteur Monopoly est couvert
  par ~100 tests + fuzz d'invariants (200 parties).
- Validation du ressenti en jeu réel (équilibrage, lisibilité des indices visuels).
