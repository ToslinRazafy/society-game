# TASKS — Journal des tâches

> Registre unique : chaque tâche du workflow y est créée (Analyse), puis déplacée.
> Une entrée terminée garde sa ligne (date + refs), elle n'est pas supprimée.

## 🔄 En cours

*(aucune)*

## 📋 À faire

- [ ] **T-002** ADR : stratégie backend / persistance des parties (reprendre, match à distance, replay ?)
- [ ] **T-003** ADR : authentification des joueurs
- [ ] **T-008** Adversaire IA — niveaux facile/moyen/difficile ; le moteur pur (`legalMoves`) est prêt, concevoir la fonction d'évaluation (ADR dédié)
- [ ] **T-009** Mode en ligne (parties privées avec code d'invitation, matchmaking, synchronisation) — spec §11.3 reçue partiellement, à compléter
- [ ] **T-010** Playtest de la V1 : équilibrage, lisibilité des indices visuels, ressenti des animations
- [ ] **T-011** Sons / retours audio optionnels (à cadrer par une mini-spec)
- [ ] **T-013** Tests de composants UI (Testing Library) — décider via ADR avant le mode en ligne
- [ ] **T-017** Intégration **Fanorona** (2 joueurs, plateau 9×5, approches/retraits, séquences) — spec dans `docs/GAME-INTGRATION.md` : dossier `src/games/fanorona/`, entrée registre en `live`, écran de partie
- [ ] **T-018** Intégration **Monopoly Premium** (2–8 joueurs, 40 cases) — spec dans `docs/GAME-INTGRATION.md` ; dépend probablement de T-002 (persistance) pour les parties longues

## ✅ Terminé

| Date | ID | Tâche | Branche | Refs |
|---|---|---|---|---|
| 2026-10-15 | T-000 | Initialiser dépôt git (main/develop) + workflow + documentation de base | feature/workflow-docs | AGENTS.md, ADR-0001, PLAN, TASKS |
| 2026-10-15 | T-001 | Définir les règles du jeu (spec Fanorina 7 + arbitraires documentés) | feature/fanorina-7 | ADR-0002, `/regles` |
| 2026-10-15 | T-004 | Suite de tests Vitest + 26 tests moteur/graphe | feature/fanorina-7 | ADR-0003 |
| 2026-10-15 | T-006 | Remplacer la page d'accueil placeholder | feature/fanorina-7 | `Home.tsx` |
| 2026-10-15 | T-007 | **Fanorina 7 V1 multijoueur local** : plateau-graphe 32 nœuds, moteur (déplacement, saut-capture, bonus, tours, victoire), écran de jeu SVG interactif, HUD, animations, écrans victoire/confirmations, réglages | feature/fanorina-7 | ADR-0002/0003, `src/game`, `src/components` |
| 2026-10-15 | T-014 | **Fix règle (playtest)** : chaîne de sauts — la pierre qui a sauté peut capturer à nouveau, la chaîne continue tant que des captures existent ; HUD/règles/tests mis à jour (28 tests) | fix/captures-en-chaine | ADR-0004, `/regles` |
| 2026-10-15 | T-015 | **Plateau 3D temps réel** : three.js + @react-three/fiber (+ drei OrbitControls), plaques/arêtes/pierres animées, import dynamique `ssr:false`, suppression du rendu SVG et des classes CSS d'animation | feature/plateau-3d | ADR-0005, `Board3D.tsx` |
| 2026-10-15 | T-016 | **Refonte plateforme PlayBoard** : landing `/`, catalogue `/jeux` (filtres catégorie/disponibles), page jeu `/jeux/[slug]` (présentation + config joueurs avec noms), route partie `/jeux/[slug]/partie`, registre `src/games/registry.ts` (3 jeux, Fanorona/Monopoly en `soon`), dossier par jeu (`src/games/fanorina-7/`), header/footer/logo, responsive ; 34 tests (6 registre inclus), lint/build OK | feature/plateforme-navigation | ADR-0006, `docs/GAME-INTGRATION.md` |
| 2026-10-15 | T-012 | **Remote git configuré** : dépôt GitHub `ToslinRazafy/society-game` poussé (main + develop) ; **release v0.1.0** (merge develop→main, tag `v0.1.0` pushé) | — | origin, tag v0.1.0 |
