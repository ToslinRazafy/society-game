# ADR-0004 : Chaîne de sauts — le coup supplémentaire peut capturer

- **Status** : Accepté (remplace partiellement ADR-0002, clause « phase bonus »)
- **Date** : 2026-10-15
- **Contexte de la tâche** : fix/captures-en-chaine (retour playtest du joueur)

## Contexte

L'ADR-0002 interdisait toute capture pendant le coup supplémentaire après un saut : la pierre
ayant sauté ne pouvait effectuer qu'un déplacement normal, puis le tour passait. Lors du premier
playtest, l'utilisateur a capturé une pierre puis s'est retrouvé dans l'impossibilité de capturer
une autre pierre adverse pourtant atteignable avec la même pierre — ressenti comme une erreur de
règle (« je devrais pouvoir éliminer… et ainsi de suite »).

## Décision

- Après une capture, la pierre qui a sauté **rejoue immédiatement** (phase `bonus`, inchangée).
- Pendant ce coup supplémentaire, **tous les coups légaux sont autorisés pour cette pierre**,
  y compris un nouveau saut-capture.
- Si le coup est une capture, **la chaîne continue** : la pierre reste en phase `bonus` et peut
  sauter encore, tant que des captures sont possibles.
- Si le coup est un déplacement normal (même si une capture était possible — le choix reste
  libre), le tour passe au joueur suivant.
- Un saut reste **un seul saut par mouvement** (jamais par-dessus deux pierres d'un coup) :
  la chaîne est une répétition de coups, pas un saut multiple.
- La **victoire immédiate** est vérifiée après chaque capture de la chaîne : si la dernière
  pierre adverse tombe, la partie s'arrête sans coup supplémentaire.

## Conséquences

- `legalMoves` n'a plus de branche « bonus = normal only » : la phase ne fait que restreindre
  la pierre jouable (`bonusStone`), simplifiant le moteur.
- `applyMove` traite toute capture de la même façon (select ou bonus) : moins de cas particuliers.
- Le texte des règles (`/regles`) et les messages du HUD sont mis à jour (« chaîne de sauts »).
- L'IA future (T-008) devra évaluer les chaînes complètes : `legalMoves` les expose déjà
  naturellement, coup après coup.
