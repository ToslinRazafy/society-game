# PLAN — Feuille de route Society Game

> Mis à jour à la fin de chaque cycle feature. Une phase ne passe à ✅ que quand elle est mergée dans `develop` et testée.

## Phase 0 — Fondations ✅

- [x] Dépôt git, branches `main` / `develop`, workflow feature
- [x] AGENTS.md + documentation vivante (ai-context, ADR, PLAN, TASKS)
- [ ] Définir le jeu : règles, composants, déroulement d'une partie
- [ ] Choisir backend / base de données / auth (ADR-0002+)

## Phase 1 — Cœur du jeu

- [ ] Modèle de données (parties, joueurs, tours, état du plateau)
- [ ] Moteur de règles côté serveur (logique pure, testable unitairement)
- [ ] Page de création/join d'une partie

## Phase 2 — Plateforme joueurs

- [ ] Comptes et authentification
- [ ] Lobby et listes de parties
- [ ] Historique et résultats

## Phase 3 — Contenu & polish

- [ ] Gestion du contenu du jeu (cartes, tuiles, variantes — selon règles)
- [ ] Responsive / UX mobile
- [ ] Déploiement (plateforme à décider via ADR)

## Candidats futurs (non planifiés)

- Multi-joueur temps réel (WebSocket / SSE)
- Mode solo / IA opposante
- Internationalisation
