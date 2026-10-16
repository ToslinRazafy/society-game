# PLAN — Feuille de route PlayBoard (Society Game)

> Mis à jour à la fin de chaque cycle feature. Une phase ne passe à ✅ que quand elle est mergée dans `develop` et testée.

## Phase 0 — Fondations ✅

- [x] Dépôt git, branches `main` / `develop`, workflow feature
- [x] AGENTS.md + documentation vivante (ai-context, ADR, PLAN, TASKS)
- [x] Définir le jeu : règles Fanorina 7 (spec + ADR-0002)
- [ ] Choisir backend / persistance / auth (T-002, T-003)

## Phase 1 — Cœur du jeu ✅ (V1 locale)

- [x] Modèle de données du plateau (graphe 32 nœuds, ADR-0002)
- [x] Moteur de règles pur et testable (26 tests Vitest)
- [x] Écran de partie jouable (2/3/4 joueurs, local)
- [x] Écran d'accueil + règles + paramètres
- [x] Plateforme PlayBoard : landing → catalogue `/jeux` → page jeu (présentation + config) → partie ; architecture multi-jeux (registre + dossier par jeu, ADR-0006)
- [x] Expérience de jeu : mode immersif plein viewport des écrans de partie + plein écran natif, fondations UI/UX et accessibilité (T-022, mergée develop 2026-10-16)
- [ ] Playtest & équilibrage (T-010)

## Phase 2 — Adversaires et plateforme

- [ ] IA 3 niveaux (T-008)
- [ ] Intégration Fanorona (T-017) — spec dans `docs/GAME-INTGRATION.md`
- [x] Intégration Monopoly Premium (T-018, mergée develop 2026-10-16) — spec dans `docs/GAME-INTGRATION.md`, ADR-0007
- [x] Monopoly en 3D temps réel phase 1/2 (T-019, mergée develop 2026-10-16) — plateau/pions/dés/maisons procéduraux, ADR-0008 ; phase 2 (billets, enchères, prison, cartes) = T-020
- [ ] Persistance des parties / profils (T-002)
- [ ] Comptes et authentification (T-003)

## Phase 3 — Multijoueur à distance

- [ ] Parties privées avec code d'invitation (T-009)
- [ ] Matchmaking et synchronisation (spec §11.3 à compléter)
- [ ] Déploiement (plateforme à décider via ADR)

## Candidats futurs (non planifiés)

- Mode solo à objectifs, classements, internationalisation, replay des parties.
