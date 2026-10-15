# ADR-0007 : Modèle Monopoly — configuration unique, machine à phases, moteur pur sans persistance V1

- **Status** : Accepté
- **Date** : 2026-10-15
- **Contexte de la tâche** : feature/monopoly (T-018, spec complète dans `docs/GAME-INTGRATION.md` §1–27)

## Contexte

Intégration de Monopoly (2 à 8 joueurs, multijoueur local, 40 cases) dans la plateforme multi-jeux
(ADR-0006). La spec impose : moteur de règles déterministe centralisant toute la logique économique,
enchères obligatoires, échanges, hypothèques, faillites, animations sans effet sur l'état métier.
Trois questions de périmètre tranchées avec l'utilisateur : **sans sauvegarde au V1** (backend non
décidé, T-002 ; la spec §22 l'autorise explicitement), **édition française classique** (noms de
cases FR, capital 1 500, salaire 200), **mode officiel seul** (pas de cagnotte Parc gratuit, pas de
mode chronométré).

## Options envisagées

1. **État mutable + appels directs depuis l'UI** — interdit par la spec (commandes validées par le
   moteur, transactions atomiques) et contraire au pattern Fanorina 7.
2. **State machine à XState/nouveau lib** — dépendance inutile ; le pattern immuable `applyMove`
   de Fanorina 7 suffit, transposé en commandes typées.
3. **Moteur pur, état immuable, commandes validées, phases explicites** — même discipline que
   `src/games/fanorina-7/engine.ts`, testable sans DOM. Retenu.

## Décision

- **Un dossier, comme les autres jeux** : `src/games/monopoly/` — `board-data.ts` (source unique
  des 40 cases ET des paquets de cartes : le visuel et le moteur consomment la même config),
  `engine.ts` (pur), `Board.tsx`, `MonopolyScreen.tsx`, `MonopolySetup.tsx`, tests co-localisés.
- **Machine à phases** dans `GameState.phase` : `roll` → `moving` (animation pilotée par le
  moteur, jamais l'inverse) → `resolving` (case d'arrivée) → action obligatoire en attente
  (`awaitBuy`, `awaitAuction`, `awaitCard`, `awaitJail`, `awaitPayment`…) → `manage` (construire/
  hypothéquer/échanger/finir le tour) → joueur suivant → `over`. Une commande illégale ne modifie
  jamais l'état (retour `error` au lieu d'un état à moitié appliqué).
- **Dés contrôlables** : `rollDice(state, dice?)` — le résultat vient d'un générateur injectable ;
  les tests fixent les lancers. Trois doubles consécutifs → prison, sans salaire.
- **Transactions atomiques** : tout mouvement d'argent passe par des helpers internes qui recopient
  l'état complet ; dettes joueur/banque → insolvabilité (ventes/hypothèques autorisées) → faillite
  (transfert réglementaire des actifs, hypothèques conservées).
- **Pas de persistance V1** : l'état `GameState` reste sérialisable (JSON simple) pour que T-002
  puisse brancher sauvegarde/reprise plus tard sans remanier le moteur ; limitation documentée dans
  `ai-context` et la page règles.
- **Enchères** : séquentielles entre joueurs locaux éligibles, pas à pas UI dédié, minimum +1 ;
  aucun enchérisseur → la propriété reste à la banque (règle officielle).

## Conséquences

- ~60 tests moteur attendus (spec §23) — cycle long ; l'UI n'est écrite qu'après un vert des
  tests du moteur.
- Sans sauvegarde, une page/refresh en pleine partie = partie perdue ; le retour au menu passe par
  une confirmation.
- Le plateau visuel est en CSS grid (pas three.js) : 40 cases rectangulaires en périphérie,
  lisible à 8 joueurs et responsive ; ADR-0005 ne s'applique qu'au Fanorina 7.
- Édition FR officielle : les noms/loyers viennent de `board-data.ts` ; changer d'édition =
  changer ce fichier, le moteur ne bouge pas.

## Note de mise en œuvre (2026-10-16, feature/monopoly)

À l'implémentation, les phases intermédiaires décrites ci-dessus (`moving`, `resolving`,
`awaitBuy`, `awaitAuction`, `awaitCard`, `awaitJail`) ont été consolidées : le déplacement et la
résolution de case sont calculés intégralement dans la commande `ROLL` (l'animation reste un
pur affichage, jamais une phase). L'ensemble des actions en attente se répartit sur trois phases
portées par des champs d'état dédiés (`buySpace`, `auction`, `debt`, `pendingCard`) :
`roll` → `resolveBuy` (achat ou enchères) → `auction` → `awaitPayment` → `manage` → `over`.
La discipline reste identique : commande illégale = état inchangé (même référence).
