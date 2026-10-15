# ADR-0002 : Modèle du plateau et règles centrales Fanorina 7

- **Status** : Accepté — clause « phase bonus » remplacée par [ADR-0004](0004-chaine-de-sauts.md)
- **Date** : 2026-10-15
- **Contexte de la tâche** : feature/fanorina-7 (spécification « PROMPT COMPLET — FANORINA 7 »)

## Contexte

Fanorina 7 est un jeu de stratégie sur plateau en croix (5 carrés), avec déplacements le long de
lignes et éliminations par saut. La spécification exige que le plateau soit modélisé comme un
**graphe** fidèle au dessin de référence (`public/assets/fanorina-7-plateau-reference.png`), sans
connexion inventée, et que toute la logique soit centralisée dans un moteur.

## Décision

### Graphe du plateau (`src/game/board.ts`)

- Grille logique 7×7 ; la croix = union de 5 carrés 3×3 de nœuds (bras top/right/bottom/left +
  carré central), soit 33 intersections.
- **Le point central (3,3) n'est pas jouable** : le carré central est vide de lignes sur le dessin.
  Plateau jouable = **32 nœuds**.
- Arêtes, par bras uniquement : 3 lignes horizontales + 3 verticales (nœuds adjacents) + les 2
  diagonales principales reliant chaque coin au centre du bras. Aucune diagonale ne traverse le
  carré central.
- **Placement initial** : chaque joueur occupe les 9 nœuds de son bras **sauf les 2 coins du
  carré central** → 7 pierres ; les 4 coins intérieurs sont les seules cases libres au départ.
- Zones : 4 joueurs = les 4 bras ; 3 joueurs = top/right/bottom ; 2 joueurs = axe vertical
  (top/bottom) ou horizontal (left/right), **choisi au menu**.

### Règles centralisées (`src/game/engine.ts`)

- Moteur **pur et immuable** (aucun DOM/React) : `createGame`, `legalMoves`, `applyMove`.
  Cette architecture prépare l'IA (qui consommera `legalMoves`) et le mode en ligne
  (réplication d'états deterministes).
- Tour : déplacement normal (1 connexion, arrivée libre) OU saut-capture (pierre adverse voisine,
  arrivée alignée libre, une seule pierre sautée, jamais sa propre pierre).
- Après capture : **phase `bonus`** — un déplacement normal supplémentaire, uniquement avec la
  pierre ayant sauté, sans nouvelle capture ; à défaut le tour passe automatiquement.
- Victoire immédiate dès qu'un seul joueur a encore des pierres (vérifiée après chaque capture).
- Joueurs sans pierres : éliminés, tours sautés. Joueur actif sans aucun coup légal : tour sauté.
  Deadlock total (aucun joueur mobile) : victoire au plus de pierres — cas non spécifié, tranché ici.
- Couleurs fixes : bleu, vert, rouge, jaune ; premier joueur choisi ou aléatoire (déterminé par
  l'UI, passé en paramètre pour garder le moteur pur).

## Conséquences

- Les 2, 3 et 4 joueurs partagent exactement les mêmes règles (aucune duplication).
- Le moteur est testable sans navigateur : 26 tests Vitest couvrent graphe et règles (ADR-0003).
- Le rendu SVG (`BoardSVG.tsx`) consomme le graphe comme source unique de vérité : les lignes
  affichées sont littéralement les arêtes du moteur.
- Si le dessin de référence devait évolué (ex. centre jouable), seul `board.ts` change ; tests
  d'invariants du graphe dans `board.test.ts` protègent contre les régressions.
