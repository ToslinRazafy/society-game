# ADR-0009 : Adversaire bot Fanorina 7 — niveaux, évaluation et recherche

- **Status** : Accepté
- **Date** : 2026-11-01
- **Contexte de la tâche** : T-008 (docs/TASKS.md), branche `feature/bot-fanorina`

## Contexte

T-008 demande un adversaire IA à trois niveaux (facile/moyen/difficile) pour Fanorina 7. L'ADR-0002 avait architecturé le moteur (`src/games/fanorina-7/engine.ts`) en machine à états pure et immuable précisément « pour préparer l'IA », avec `legalMoves`/`allLegalMovesFor`/`applyMove` comme surface de consommation. L'ADR-0004 (chaîne de sauts, phase `bonus`) impose que la recherche traverse les maillons de capture comme des coups ordinaires. Contraintes : le jeu tourne 100 % client (pas de backend, T-002 non décidé), dans un navigateur (budget CPU/temps limité), et le mode multi-joueurs local (2–4 humains) ne doit pas régresser.

## Options envisagées

1. **Aléatoire + biais de capture seul** — simple, mais niveau « difficile » inexistant et jeu passif frustrant. Rejeté comme option unique, retenu comme niveau facile.
2. **MCTS** — puissant sans fonction d'évaluation, mais coûteux en nœuds, non déterministe et surdimensionné pour un graphe de 32 nœuds en navigateur. Rejeté.
3. **IA côté serveur / API externe** — viole le fonctionnement hors ligne actuel du jeu et présuppose T-002. Rejeté.
4. **Minimax local + élagage alpha-bêta avec fonction d'évaluation** — adapté à un jeu parfait-information de petit graphe, déterministe (rng injectable), testable, réutilisable tel quel pour le Fanorona 9×5 (T-017). Retenu.

## Décision

Le bot (`src/games/fanorina-7/bot.ts`) est un **client externe pur du moteur** : `GameState`, `GameConfig` et `engine.ts` restent inchangés ; le mode « vs Bot » et la difficulté ne vivent que dans l'URL (`?mode=bot&diff=…&bot=…`) et l'UI (`GameScreen`/`FanorinaSetup`), uniquement en duel à 2 joueurs. Trois niveaux :

- **facile** : tirage pondéré parmi les coups légaux (poids 3 pour une capture, 1 sinon) — lisible et battable ;
- **moyen** : minimax profondeur 2 avec élagage alpha-bêta ;
- **difficile** : minimax alpha-bêta, itération en profondeur 1..6, budget 80 000 **unités de travail** (une unité = un coup appliqué, feuilles comprises) et limite de temps douce 400 ms ; la racine consomme un résultat partiel en cas de dépassement : le coup retenu est le meilleur pleinement évalué parmi les coups déjà passés (tri captures d'abord, donc le meilleur coup est évalué en premier) ;

La recherche est un **minimax à valeurs absolues depuis la perspective du bot** (`ctx.me`), et non un negamax : le moteur ne change `current` ni pendant la phase `bonus` (la même pierre rejoue) ni sur la capture finale (la partie se termine sans passer le tour), ce qui inverse la signature « alternance stricte des traits » supposée par negamax et rendrait les terminaux mal signés.

Fonction d'évaluation (toujours vue depuis le bot, valeurs absolues) : terminal `phase:"over"` → ±1 000 000 ajusté du ply ; matériau `1000 × écart de pierres` ; coups de capture disponibles `120 × écart` ; mobilité `20 × écart du nombre de coups légaux` ; position via table statique d'« avance » (distances BFS sur l'adjacence du graphe depuis le foyer adverse, précalculée paresseusement).

Anti-garage : le moteur n'ayant volontairement aucune règle de nulle ni de répétition, le bot considère une position déjà vue **dans sa propre ligne de recherche** comme une nulle (valeur 0) ; les niveaux facile/moyen peuvent théoriquement boucler, ce qui est assumé (jeu local, l'humain garde la main via Rejouer). Le générateur pseudo-aléatoire mulberry32 de Monopoly est extrait vers `src/lib/rng.ts` (code générique, pas un domaine du jeu) et injectable dans `chooseMove` pour des tests déterministes ; `src/games/monopoly/rng.ts` devient un shim de ré-export pour ne casser aucun des 101 tests existants.

## Conséquences

- Rend possible : un bot identique réutilisable pour le Fanorona 9×5 (T-017, évaluation à adapter aux approches/retraits) et déplaçable côté serveur pour le mode en ligne (T-009) sans changement — le module est pur.
- Rend possible : l'absence de modification du moteur préserve la sérialisabilité de `GameState` (replay/persistance T-002) et les 34 tests Fanorina existants.
- Dette assumée : pas de table de transposition ni de heuristiques positionnelles fines ; profondeur ≤ 6 seulement ; pas de règle de nulle côté moteur (garfs possibles aux niveaux bas, plafonnés côté tests).
- À réévaluer : au playtest T-010 si le difficile est trop faible (pistes : profondeur 7, quiescence des chaînes de captures, table de transposition) ; à T-009 si le bot doit tourner côté serveur.
