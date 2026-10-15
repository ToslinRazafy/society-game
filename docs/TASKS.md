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
- [ ] **T-012** Configurer un remote git (GitHub) et les conventions de PR (ex-T-005)
- [ ] **T-013** Tests de composants UI (Testing Library) — décider via ADR avant le mode en ligne

## ✅ Terminé

| Date | ID | Tâche | Branche | Refs |
|---|---|---|---|---|
| 2026-10-15 | T-000 | Initialiser dépôt git (main/develop) + workflow + documentation de base | feature/workflow-docs | AGENTS.md, ADR-0001, PLAN, TASKS |
| 2026-10-15 | T-001 | Définir les règles du jeu (spec Fanorina 7 + arbitraires documentés) | feature/fanorina-7 | ADR-0002, `/regles` |
| 2026-10-15 | T-004 | Suite de tests Vitest + 26 tests moteur/graphe | feature/fanorina-7 | ADR-0003 |
| 2026-10-15 | T-006 | Remplacer la page d'accueil placeholder | feature/fanorina-7 | `Home.tsx` |
| 2026-10-15 | T-007 | **Fanorina 7 V1 multijoueur local** : plateau-graphe 32 nœuds, moteur (déplacement, saut-capture, bonus, tours, victoire), écran de jeu SVG interactif, HUD, animations, écrans victoire/confirmations, réglages | feature/fanorina-7 | ADR-0002/0003, `src/game`, `src/components` |
