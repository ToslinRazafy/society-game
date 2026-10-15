# ADR-0008 : Rendu 3D de Monopoly — assets procéduraux, animation hors état

- **Status** : Accepté
- **Date** : 2026-10-16
- **Contexte de la tâche** : feature/monopoly-3d (T-019)

## Contexte

L'exigence produit est claire : tous les jeux de la plateforme doivent être en 3D temps réel avec
des animations incarnées (dés qui roulent, pions chien/chapeau/voiture qui se déplacent
fluidement, rues/bâtiments matériels, puis billets, enchères, prison). Fanorina 7 est déjà en 3D
(ADR-0005 : three.js + @react-three/fiber + drei, client-only). Monopoly est encore un CSS grid
2D. Trois options se posent pour les modèles 3D et l'animation des dés.

## Options envisagées

1. **Modèles GLTF externes** (banques de modèles libres) — plus réalistes, mais : licences à
   vérifier pour chaque pièce, fichiers binaires lourds dans le dépôt, dépendance réseau au
   téléchargement, style incohérent entre sources. Écarté.
2. **Moteur physique pour les dés** (@react-three/rapier) — spectaculaire mais ~1 Mo de WASM,
   nouvelle dépendance majeure, et non déterministe : la valeur affichée devrait être forcée vers
   celle du moteur de toute façon (ADR-0007 : l'animation ne touche jamais l'état). Écarté.
3. **Assets procéduraux en primitives three.js + animation déterministe** — même discipline que
   Board3D de Fanorina (boîtes, cylindres, tores, sphères assemblés en groupes) : rien à
   télécharger, hors ligne, cohérence visuelle, zéro nouvelle dépendance. Retenu.

## Décision

- **Extension d'ADR-0005 à Monopoly** : même stack (three.js ^0.186, @react-three/fiber ^9.8,
  drei ^10.7), rendu client-only `ssr:false`, WebGL requis, pas de fallback 2D. Le CSS grid
  2D (`Board.tsx`) est **supprimé**, pas mis en option.
- **Assets 100 % procéduraux** : plateau = anneau de 40 box (rues incarnées par socle teinté
  `GROUP_COLORS`, bâtiment coloré si possédé, maison = box + toit pyramide, hôtel = box large) ;
  textes (noms, prix, MONOPOLY) via drei `<Text>` (troika, déjà inclus dans drei) ; les 8 pions
  sont des assemblages low-poly reconnaissables (chien, chat, sac, chapeau, dé à coudre, canard,
  voiture, pingouin), teintés par `TOKEN_COLORS` ; le stock banque maisons/hôtels est empilé sur
  le plateau.
- **Dés 3D à animation procédurale déterministe** : deux cubes à pips ; au lancer, toupie +
  rebond (~1 s) puis **orientation finale calculée pour afficher exactement `s.dice`** (valeurs
  déjà fixées par le moteur avant l'animation). Aucun tirage côté rendu.
- **Mouvements incarnés** : pions animés case par case (file des cases traversées, modulo 40,
  passage par GO compris), lerp exponentiel `useFrame` (pattern Stone3D Fanorina) ; pion en prison
  épinglé sur la case prison.
- **Invariant conservé (ADR-0007)** : le moteur ne change pas ; `Board3D` est une projection pure
  de `GameState`. Tout état d'animation (position courante interpolée, phase de toupie) vit dans
  des refs locales de composants, jamais dans `GameState`. Les panneaux (enchère, échange, dette,
  historique, PropertyPanel) restent du DOM 2D pour la lisibilité ; le clic case est conservé via
  hitbox invisibles.
- **Budget scène** : < ~300 meshes simples, segments 8–16, ombres limitées au plateau/pions ;
  animation respectant le réglage `animationsEnabled()` (`@/lib/settings`).

## Conséquences

- Le plateau Monopoly exige WebGL comme Fanorina 7 : pas de rendu serveur (skeleton pendant le
  chargement dynamique), limitation déjà documentée en ADR-0005.
- Les pions procéduraux sont stylisés, pas photoréalistes ; améliorer une pièce = modifier son
  assemblage dans `pieces3d.tsx`, sans toucher au moteur.
- Le chantier est découpé en deux cycles : T-019 (plateau, pions, dés, maisons/hôtels) ; T-020
  (billets animés, scène d'enchère, prison/tribunal, cartes Chance/Communauté).
- Les 101 tests moteur restent la garantie d'exactitude ; le 3D ne s'auto-teste pas (pas de suite
  de tests UI, T-013), validation par jeu réel.
