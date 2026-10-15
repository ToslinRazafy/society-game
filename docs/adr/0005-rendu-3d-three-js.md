# ADR-0005 : Rendu 3D du plateau avec three.js + react-three-fiber

- **Status** : Accepté
- **Date** : 2026-10-15
- **Contexte de la tâche** : feature/plateau-3d (T-015, demande utilisateur « vraie 3D animée »)

## Contexte

Le plateau V1 était rendu en SVG 2D (`BoardSVG.tsx`). L'utilisateur souhaite un plateau « vraie
3D » animé. Le moteur de jeu (`src/game`) est pur et indépendant du rendu : seul l'affichage change.

## Options envisagées

1. **CSS 3D transforms** — léger mais limité (vrai rendu de scène, ombres, occultation difficiles).
2. **three.js en direct** — complet, mais intégration React manuelle (cycle de vie, raycasting).
3. **three.js + @react-three/fiber (+ drei)** — scène décrite en JSX, raycasting/événements
   pointer natifs, OrbitControls prêts à l'emploi. Retenu.

## Décision

- Dépendances : `three`, `@react-three/fiber` (v9, React 19), `@react-three/drei` (OrbitControls),
  `@types/three` en dev.
- Nouveau composant `src/components/Board3D.tsx` : même interface props que l'ancien `BoardSVG`
  (le moteur ne change pas). Plateau = croix de 5 plaques ; arêtes = cylinders ; pierres =
  cylindres à base évasée, animés par interpolation de position (`useFrame`) — l'identité stable
  `Stone.id` reste la clé React qui rend les déplacements fluides.
- Indicateurs : pastille verte = destination normale, anneau rouge pulsant = saut (destination et
  proie), anneau blanc = sélection, fantôme rouge = pierre capturée.
- Caméra : perspective fixes + `OrbitControls` (rotation souris/tactile, zoom borné, pas de pan).
- Rendu **client uniquement** : import `dynamic(() => import('./Board3D'), { ssr: false })` dans
  `GameScreen` ; fallback = squelette animé. WebGL requis côté navigateur.
- `BoardSVG.tsx` et les classes CSS `f7-*` associées sont **supprimés** ; le réglage
  « animations » (localStorage) est lu directement par `Board3D` au montage.

## Conséquences

- +3 dépendances runtime (~55 paquets) — la chaîne `npm audit` restante est dans ESLint (dev
  only, hors bundle runtime).
- Le plateau 2D n'existe plus ; si un fallback 2D est un jour nécessaire (devices sans WebGL),
  il faudra le réintroduire explicitement.
- Les tests moteur restent 100 % valides (rendu non testé unitairement — T-013 reporte les tests
  de composants).
