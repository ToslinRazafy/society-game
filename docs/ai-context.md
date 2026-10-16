# AI Context — PlayBoard (ex-Society Game)

> Snapshot de l'état réel du projet. Mis à jour à **chaque fin de cycle feature** (voir AGENTS.md).
> Dernière mise à jour : 2026-10-16 (release **v0.3.0** taguée : UI/UX + mode plein écran des parties ; develop en cours)

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
- **Version** : 0.3.0 (release en vigueur : `v0.3.0`)

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
| Rendu 3D Monopoly | Assets 100 % procéduraux (primitives + textures canvas locales, aucune police/dépendance externe), dés animés déterministes (la valeur vient du moteur), extension d'ADR-0005 à Monopoly, CSS grid 2D supprimé | ADR-0008 |
| Écrans de partie | Mode immersif plein viewport (`GameShell`) : chrome du site masqué, plateau maximal, HUD adaptatif ; **plein écran natif** (Fullscreen API via hook `useFullscreen`, déclenché au lancement de partie, sortie par bouton/Échap) — décision d'UI mineure, sans ADR | T-022, `src/lib/use-fullscreen.ts` |
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
      board-data.ts(+test)          # config unique 40 cases (SPACES, GROUP_COLORS, TOKENS, TOKEN_COLORS), constants FR (1500, GO 200…), gridPos/cellWorldPos/SIDE_ROT_Y
      rng.ts                        # mulberry32 seedé + rollDice(rng) — dés injectables
      cards.ts(+test)               # decks Chance / Communauté (ordre fixe, mélangé au départ)
      finance.ts                    # payTo / receive atomiques, faillite, dette banque vs joueur
      moves.ts                      # déplacement, cases Go/Prison/Free Parking…, impôts, tirage de carte
      properties.ts                 # achat, enchères obligatoires, construction/vente équilibrées, hypothèques, échanges
      engine.ts(+test)              # applyCommand : dispatcher immuable par phase, illegal → même référence
      jail.test.ts / economy.test.ts / trade-bankrupt.test.ts / invariants.test.ts / test-helpers.ts
      textures.ts                   # textures canvas 100 % locales (cases, centre, stocks) — convention : haut de texture = centre du plateau
      pieces3d.tsx                  # House3D/Hotel3D/BuildingRow + 8 pions procéduraux reconnaissables (chien, chat, sac, chapeau, dé à coudre, canard, voiture, pingouin)
      Token3D.tsx                   # pion animé : file d'attente de cases parcourue une par une (refs locales, jamais GameState)
      Dice3D.tsx                    # dés 3D : toupie + rebond ~1 s puis atterrissage orienté sur la valeur du moteur (aucune physique)
      Board3D.tsx                   # scène 3D (Canvas/r3f/drei) : plateau, rues incarnées, pièces, stock banque, cliquable case par case (ADR-0008 ; remplace l'ancien Board.tsx CSS grid, supprimé)
      MonopolySetup.tsx             # config : 2–8 joueurs, noms, pions uniques → ?joueurs=&noms=&pions=
      MonopolyScreen.tsx            # écran de partie : Board3D chargé en `dynamic(ssr:false)` + squelette, panneaux DOM (enchère, dette, échange, journal)
      ActionBar.tsx / SidePanels.tsx / TradeModal.tsx / PropertyPanel.tsx
  components/     # PARTAGÉ SITE (pas de logique de jeu)
    SiteHeader.tsx  # logo PlayBoard + nav (lien actif) + CTA (mobile : menu déroulant)
    SiteFooter.tsx
    GameCard.tsx    # carte catalogue : illustration, badge live/soon, métadonnées
    GameShell.tsx   # enveloppe des écrans de partie : mode immersif plein viewport + barre d'outils
    FullscreenButton.tsx # bascule plein écran natif (masqué si l'API est absente)
  lib/
    settings.ts   # préférences localStorage (animations)
    use-fullscreen.ts # hook Fullscreen API (useSyncExternalStore) + requestFullscreen()
  app/
    page.tsx               # /                    landing (hero, concept, à la une, étapes, avantages)
    jeux/page.tsx          # /jeux                catalogue (filtres catégorie + disponibles)
    jeux/[slug]/page.tsx   # /jeux/…              présentation + config (FanorinaSetup ou MonopolySetup)
    jeux/[slug]/partie/    # /jeux/…/partie?...   écran de jeu immersif (PLAY_SCREENS, Suspense)
    regles/layout.tsx      # /regles/*            chrome du site (header/footer) partagé
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
jamais l'état. `Board3D` est une projection pure de `GameState` : les états d'animation (file de
cases des pions, toupie des dés) vivent dans des refs locales de composants (ADR-0008).

## Limites connues / prochaines étapes

- Pas de persistance de partie (refresh = nouvelle partie), pas d'IA, pas de multi-appareils ;
  le `GameState` Monopoly est sérialisable, prêt pour T-002 (backend/replay à cadrer).
- Les plateaux 3D (Fanorina et Monopoly) exigent WebGL (navigateur) : client-only `ssr:false`,
  pas de rendu serveur ni de fallback 2D (ADR-0005, ADR-0008).
- Monopoly 3D phase 1/2 (T-019) : plateau, pions animés case par case, dés animés, maisons/hôtels,
  stock banque. Reste la phase 2 (T-020) : billets 3D volants, scène d'enchère (pupitre + marteau),
  prison/tribunal animé, cartes Chance/Communauté retournées en 3D. Échanges limités au hot-seat.
- Le ressenti des animations 3D (dés, pions, construction) doit être validé en navigateur réel
  (playtest T-010) : non vérifiable headless.
- Pas de tests de composants UI (décision ADR à venir si besoin) ; le moteur Monopoly est couvert
  par ~100 tests + fuzz d'invariants (200 parties).
- Plein écran natif : dépend de l'API `requestFullscreen` du navigateur (masqué là où elle est
  absente, ex. Safari iOS sur iPhone) ; le mode immersif plein viewport reste actif dans tous les
  cas. Sortie par le bouton ou la touche Échap.
- Validation du ressenti en jeu réel (équilibrage, lisibilité des indices visuels).
