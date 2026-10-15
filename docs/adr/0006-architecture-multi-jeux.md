# ADR-0006 : Architecture multi-jeux — registre central + routes /jeux

- **Status** : Accepté
- **Date** : 2026-10-15
- **Contexte de la tâche** : feature/plateforme-navigation (refonte plateforme « PlayBoard » :
  landing → catalogue → page jeu → partie, plusieurs jeux à venir)

## Contexte

Le projet ne contenait qu'un seul jeu (Fanorina 7) avec un parcours plat : `/` (accueil = setup du
jeu) → `/partie`. L'utilisateur veut une plateforme qui accueille **plusieurs jeux** (Fanorona,
Monopoly Premium en backlog, specs dans `docs/GAME-INTGRATION.md`) avec trois niveaux de navigation :
page d'atterrissage, catalogue, page de présentation/configuration du jeu, puis la partie.
Contraintes : ne casser aucune mécanique existante, centraliser les métadonnées, ranger
l'architecture de dossiers, pas de dépendance inutile, multijoueur en ligne hors périmètre.

## Options envisagées

1. **Pages par jeu codées en dur** (`/fanorina-7`, `/fanorona`…) — duplication, pas d'évolutivité.
2. **Registre + route dynamique `/jeux/[slug]`** — une source de vérité des métadonnées, pages
   générées, un jeu = un dossier. Retenu.
3. **CMS/backend pour le catalogue** — prématuré : aucun backend décidé (T-002), catalogue
   small et stable, le registre TS suffit.

## Décision

- **Registre** : `src/games/registry.ts` exporte `GameMeta` (slug, nom, tagline, description,
  illustration, joueurs min/max, durée, catégorie, statut `live | soon`, vedette, règles) et la
  liste `GAMES`. `getGame(slug)` / `categories()` pour les pages. Tests : `registry.test.ts`.
- **Un jeu = un dossier** : `src/games/<slug>/` (moteur, rendu, écran de partie, configuration).
  Fanorina 7 migré de `src/game` + `src/components` vers `src/games/fanorina-7/` (git mv, moteur
  inchangé). Composants partagés du site dans `src/components/` (`SiteHeader`, `SiteFooter`,
  `GameCard`).
- **Routes** : `/` landing (hero, concept, à la une, étapes, avantages) ; `/jeux` catalogue
  (filtres catégorie + « disponibles uniquement », à découvrir, ajoutés récemment) ;
  `/jeux/[slug]` présentation + configuration (`generateStaticParams` depuis le registre) ;
  `/jeux/[slug]/partie` écran de jeu via une table `PLAY_SCREENS` (Suspense — lecture du searchParams) ;
  `/regles` conservé pour Fanorina 7. Un slug inconnu → 404.
- **Configuration joueurs** : le setup Fanorina passe en paramètre d'URL (`noms`, joint par `|`),
  l'écran de partie affiche les noms custom avec repli sur les libellés couleur.
- **Identité** : nom de plateforme **PlayBoard**, logo `public/assets/logo.png` (header/footer),
  accent ambre ajouté au thème slate.
- Les jeux `soon` (Fanorona, Monopoly) sont au catalogue avec badge « Bientôt », sans écran de
  partie — l'ajout d'un jeu = entrée registre + dossier + entrée `PLAY_SCREENS` + sa page règles.

## Conséquences

- Parcourir/jouer passe par `/jeux` ; `/partie` (ancien) supprimé.
- Ajouter un jeu reste déclaratif mais le rendu de partie est câblé en code (table map), pas de
  plugin dynamique — volontaire, tant que le catalogue tient dans le dépôt.
- Le registre est typé et testé : une métadonnée manquante (illustration d'un jeu live) casse les
  tests plutôt que la prod.
- Cache Components (PPR) impose : données runtime derrière `Suspense`, pas de `new Date()` au
  rendu prerendé (détail rencontré et corrigé pendant le cycle).
