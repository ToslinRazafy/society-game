# AI Context — PlayBoard (ex-Society Game)

> Snapshot de l'état réel du projet. Mis à jour à **chaque fin de cycle feature** (voir AGENTS.md).
> Dernière mise à jour : 2026-10-15 (feature/plateforme-navigation)

## Vision

Plateforme web **PlayBoard** hébergeant plusieurs jeux de société en multijoueur local (même
appareil). Premier jeu disponible : **Fanorina 7** (2 à 4 joueurs, 7 pierres chacun, dernier en jeu
gagné ; référence visuelle : `public/assets/fanorina-7-plateau-reference.png`). Backlog : Fanorona,
Monopoly Premium (specs dans `docs/GAME-INTGRATION.md`). Parcours : landing → catalogue →
présentation/configuration → partie.

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
  components/     # PARTAGÉ SITE (pas de logique de jeu)
    SiteHeader.tsx  # logo PlayBoard + nav + CTA (mobile : menu déroulant)
    SiteFooter.tsx
    GameCard.tsx    # carte catalogue : illustration, badge live/soon, métadonnées
  lib/
    settings.ts   # préférences localStorage (animations)
  app/
    page.tsx               # /                    landing (hero, concept, à la une, étapes, avantages)
    jeux/page.tsx          # /jeux                catalogue (filtres catégorie + disponibles)
    jeux/[slug]/page.tsx   # /jeux/fanorina-7     présentation + config (generateStaticParams)
    jeux/[slug]/partie/    # /jeux/…/partie?...   écran de jeu (PLAY_SCREENS, Suspense)
    regles/page.tsx        # /regles              règles Fanorina 7
public/assets/    # logo.png (PlayBoard), dessin de référence du plateau
```

États du tour (`Phase`) : `select` (choix d'une pierre) → `bonus` (la pierre ayant sauté rejoue —
déplacement normal OU nouveau saut : chaîne de sauts, ADR-0004) → `over`. Les animations de pierres
reposent sur l'identité stable `Stone.id` + interpolation de position dans `useFrame` (ADR-0005).

## Limites connues / prochaines étapes

- Pas de persistance de partie (refresh = nouvelle partie), pas d'IA, pas de multi-appareils.
- Le plateau 3D exige WebGL (navigateur) : pas de rendu serveur ni de fallback 2D (ADR-0005).
- Pas de tests de composants UI (décision ADR à venir si besoin).
- Validation du ressenti en jeu réel (équilibrage, lisibilité des indices visuels).
