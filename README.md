# Society Game

Plateforme web pour un jeu de société — Next.js 16, TypeScript, Tailwind 4.

## Démarrer

```bash
npm install
npm run dev   # http://localhost:3000
```

## Organisation du projet

- **`AGENTS.md`** — workflow obligatoire (analyse → décision → code → test → docs → commit → merge) et conventions. À lire en premier.
- **`docs/ai-context.md`** — état réel du projet (stack, décisions, architecture).
- **`docs/adr/`** — architecture decision records.
- **`docs/PLAN.md`** — feuille de route par phases.
- **`docs/TASKS.md`** — tâches terminées / en cours / à faire.

## Branches

`main` (stable, releases tagguées) ← `develop` (intégration) ← `feature/*` / `fix/*`.
