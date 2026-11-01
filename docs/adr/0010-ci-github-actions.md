# ADR-0010 : CI GitHub Actions — lint, tests et build à chaque push/PR

- **Status** : Accepté
- **Date** : 2026-11-01
- **Contexte de la tâche** : T-028 (docs/TASKS.md), branche `feature/ci-github-actions`

## Contexte

Le dépôt n'a aucun pipeline d'intégration continue. Les seuls checks automatiques sur les PR sont externes : Vercel (build + déploiement preview, donc `next build` uniquement) et GitGuardian (scan de secrets). En conséquence, `npm run lint` et la suite Vitest (151 tests) ne sont exécutés qu'en local, à la diligence de l'agent ou du développeur — une régression peut être mergée dans `develop` sans que ni lint ni tests aient tourné ailleurs que sur la machine d'origine.

## Options envisagées

1. **Rester sans CI interne** — gratuit, mais la validation lint/test n'est pas traçable ni garantie avant merge. Rejeté.
2. **Autre hébergeur de CI** (CircleCI, Jenkins auto-hébergé…) — le dépôt est déjà sur GitHub ; ajouter un fournisseur externe complexifie les checks et les secrets. Rejeté.
3. **CI riche** (matrice multi-Node, Playwright, couverture, déploiements) — surdimensionné pour un projet 100 % client encore sans backend ; la CI elle-même devient un coût de maintenance. Rejeté pour aujourd'hui, reste ouverte comme évolution.
4. **Workflow GitHub Actions minimal** — réutilise exactement les commandes validées du cycle AGENTS.md (`npm ci`, `lint`, `test`, `build`) ; check natif sur les PR. Retenu.

## Décision

Ajouter `.github/workflows/ci.yml` : un job unique `ubuntu-latest` déclenché sur `push` et `pull_request` visant `develop` et `main`, qui exécute `actions/checkout@v4`, `actions/setup-node@v4` (Node 22 LTS, cache npm), `npm ci`, puis `npm run lint`, `npm test`, `npm run build`. Le workflow s'exécute lui-même sur la PR de la feature (validation réelle sur GitHub, pas de simulation locale).

## Conséquences

- Rend possible : toute PR vers develop/main affiche un statut lint/test/build vérifiable et bloquant culturellement (« CI verte avant merge ») ; les releases (`vX.Y.Z` taguées) repartent d'un `main` nécessairement passé CI.
- Rend possible : extension ultérieure naturelle (déploiement piloté par CI, jobs de test UI si T-013 est décidé) sans nouvelle infrastructure.
- Dette assumée : version Node épinglée à 22 LTS alors que le local tourne sous Node 26 — l'écart est faible (Next 16 exige >= 20.9) et sera réévalué si un comportement diverge ; pas de matrice multi-OS/multi-Node.
- Ce qu'il faudra réévaluer : quand un backend/déploiement piloté arrivera (T-002), la CI devra porter les migrations et les tests serveur ; éventuellement ajouter un job de build avec analyse de bundle.
