# PROMPT COMPLET — INTÉGRATION DU FANORONA MALGACHE DANS UNE PLATEFORME DE JEUX DE SOCIÉTÉ

## 1. RÔLE ET MISSION

Tu es un développeur senior spécialisé dans les jeux de stratégie, les moteurs de règles déterministes, les interfaces interactives et l'architecture logicielle propre.

Ta mission est d'intégrer un jeu complet de **Fanorona classique malgache** dans ma plateforme de jeux de société existante.

Le jeu doit être fonctionnel, fidèle aux règles traditionnelles, visuellement soigné, fluide et facile à prendre en main.

**IMPORTANT :**
- Ne crée pas une nouvelle application indépendante.
- Commence par analyser le projet existant et son architecture.
- Réutilise le système de navigation, les composants UI, les styles, les conventions de code et les mécanismes de gestion des parties déjà présents.
- N'invente pas de fonctionnalités incompatibles avec la plateforme.
- Ne modifie pas les autres jeux ni les fonctionnalités communes sans nécessité.
- Implémente réellement le moteur de jeu : ne produis pas une simple maquette visuelle.
- Si une règle traditionnelle présente plusieurs variantes, documente le choix retenu et rends-le cohérent dans l'ensemble du jeu.

## 2. PRÉSENTATION DU JEU

Nom : Fanorona

Origine : Madagascar.

Type : jeu de stratégie abstrait traditionnel pour deux joueurs.

Mode initial : multijoueur local, sur un seul appareil, avec alternance des tours.

Les deux joueurs jouent physiquement ou à tour de rôle sur le même écran. Aucun compte ni connexion Internet ne doit être nécessaire pour une partie locale, sauf si la plateforme l'impose déjà.

Objectif principal : capturer tous les pions adverses ou immobiliser l'adversaire, conformément aux conditions de victoire du règlement retenu.

Le jeu doit proposer une expérience traditionnelle, avec une interface numérique moderne.

## 3. ANALYSE OBLIGATOIRE AVANT LE DÉVELOPPEMENT

Avant d'écrire du code :

1. Analyse la structure complète du projet.
2. Identifie le framework, les versions, le système de routage, les composants UI et la gestion de l'état.
3. Identifie la page d'accueil de la plateforme et la page listant les jeux.
4. Vérifie comment les autres jeux sont intégrés et comment une partie locale est démarrée.
5. Identifie les conventions de nommage, les règles de lint, les tests existants et les scripts disponibles.
6. Vérifie les fonctionnalités réutilisables : navigation, menus, modales, boutons, animations, paramètres, historique et sauvegarde.
7. Établis la liste des fichiers à créer ou modifier.

Présente ensuite un plan d'implémentation concis.

Ne remplace pas les dépendances existantes sans justification. N'effectue aucune refonte générale de la plateforme pour intégrer ce seul jeu.

## 4. PLATEAU TRADITIONNEL

Le plateau doit représenter le Fanorona classique, appelé Fanorona 9×5.

Il comporte :
- 9 colonnes de points.
- 5 rangées de points.
- 45 intersections.
- 22 pions pour chaque joueur.
- 44 pions au total au commencement.
- Une intersection centrale initialement vide.

Les intersections sont reliées par des lignes horizontales et verticales. Les diagonales ne doivent exister que là où le tracé traditionnel les prévoit.

### Topologie du plateau

Ne traite pas le plateau comme une grille rectangulaire où tous les déplacements seraient possibles.

Crée une représentation explicite du graphe :
- Chaque intersection possède un identifiant unique.
- Chaque intersection connaît ses voisines légales.
- Les connexions horizontales et verticales sont définies explicitement.
- Les connexions diagonales sont définies selon le dessin traditionnel du Fanorona.
- Un déplacement ne peut se faire que le long d'une arête existante.
- Une intersection ne peut contenir qu'un seul pion.
- Un pion ne peut pas se déplacer sur une intersection occupée.

Le plateau graphique et le moteur de règles doivent utiliser la même topologie.

### Configuration initiale

Place 22 pions du joueur A et 22 pions du joueur B selon la disposition traditionnelle du Fanorona.

Reproduis fidèlement la disposition de départ :
- Les deux camps occupent les rangées extérieures et les positions traditionnelles des rangées intérieures.
- Le point central reste vide.
- Aucun pion ne doit être ajouté ou supprimé artificiellement.

Ne déduis pas la disposition de départ d'une simple alternance de couleurs sur une grille générique. Définis explicitement la configuration et vérifie le nombre de pions par joueur.

## 5. RÈGLES DE DÉPLACEMENT

Chaque tour commence par le choix d'un pion appartenant au joueur actif.

Le joueur sélectionne ensuite une intersection adjacente vide, reliée par une ligne légale.

Règles :
1. Un seul pion est déplacé à la fois.
2. Le déplacement suit une connexion du graphe.
3. Le déplacement vers une intersection occupée est interdit.
4. Les sauts ordinaires par-dessus les pions sont interdits.
5. Le joueur ne peut pas déplacer le pion adverse.
6. Un déplacement sans capture est permis uniquement lorsqu'aucune capture légale n'est disponible pour le joueur actif.
7. Une capture obligatoire ne peut pas être remplacée par un déplacement simple.
8. Les règles doivent être vérifiées par le moteur, jamais uniquement par l'interface.

Les intersections diagonales doivent être gérées selon les connexions réellement dessinées.

## 6. LES DEUX MÉTHODES DE CAPTURE

Le Fanorona utilise deux méthodes distinctes de capture.

### A. Capture par approche

Un pion se déplace vers un groupe de pions adverses sur une ligne autorisée.

Si, depuis la destination, le pion se trouve immédiatement à côté d'un pion adverse dans la direction du déplacement, tous les pions adverses consécutifs situés dans cette direction sont capturés jusqu'à rencontrer une intersection vide, une interruption de ligne ou la limite du plateau.

Exemple conceptuel :

A — B — B — B

A avance vers le groupe B depuis la direction opposée. Le groupe adverse aligné dans la direction de l'approche est capturé selon les connexions du plateau.

Le moteur doit déterminer la direction réelle du déplacement et examiner la chaîne de pions adverses.

### B. Capture par retrait

Un pion s'éloigne d'un groupe de pions adverses.

Après son déplacement, le moteur examine la direction opposée au déplacement, à partir de l'intersection de départ.

Tous les pions adverses consécutifs situés dans cette direction sont capturés, jusqu'à la première interruption de la chaîne.

Exemple conceptuel :

B — B — B — A

A s'éloigne du groupe adverse. Les pions B situés derrière son ancienne position sont capturés dans la direction du retrait.

La capture doit être calculée à partir de la position initiale du pion, et non à partir de sa nouvelle position.

### C. Obligations de capture

À chaque début de tour :

1. Calculer toutes les captures légales disponibles pour le joueur actif.
2. Si au moins une capture est disponible, interdire les déplacements sans capture.
3. Autoriser les captures par approche et par retrait.
4. Si les deux méthodes sont disponibles pour un même déplacement, demander au joueur de choisir celle qu'il souhaite effectuer, conformément aux règles traditionnelles.
5. Ne pas capturer simultanément par approche et par retrait sans sélection explicite.
6. Capturer tous les pions consécutifs concernés par la méthode choisie.
7. Mettre immédiatement à jour le plateau et le nombre de pions restants.

L'interface doit signaler clairement les captures disponibles.

## 7. CAPTURES SUCCESSIVES ET TOUR DE JEU

Après une capture, le joueur peut être autorisé à poursuivre avec le même pion pour effectuer une nouvelle capture.

Cette mécanique est essentielle.

Applique les règles suivantes :

1. Après une capture, vérifie si le pion utilisé peut effectuer une nouvelle capture légale.
2. Si aucune capture successive n'est disponible, le tour se termine.
3. Si une capture successive est disponible, le joueur peut poursuivre avec le même pion.
4. Pendant une séquence, le joueur ne peut pas réutiliser une intersection déjà visitée par ce pion au cours de cette séquence.
5. Pendant une séquence, le joueur ne peut pas changer de pion.
6. Pendant une séquence, les déplacements non capturants sont interdits.
7. Si plusieurs captures sont disponibles, le joueur peut choisir la suite légale qu'il préfère.
8. Après chaque capture, recalcule les possibilités en tenant compte des pions retirés et des intersections visitées.
9. Dès qu'aucune capture successive n'est disponible, termine le tour et donne la main à l'adversaire.

Ne transforme pas automatiquement une capture successive en un déplacement libre. Une séquence de capture est une seule action stratégique composée de plusieurs déplacements du même pion.

L'interface doit indiquer clairement :
- « Capture effectuée ».
- « Capture suivante possible ».
- « Continuez avec le même pion ».
- « Fin de la séquence de capture ».

## 8. FIN DE PARTIE ET CONDITIONS DE VICTOIRE

Une partie se termine lorsque l'une des conditions suivantes est remplie :

### Victoire par capture

Un joueur gagne lorsque tous les pions adverses ont été capturés.

### Victoire par blocage

Un joueur gagne lorsque l'adversaire ne dispose d'aucun déplacement légal et qu'aucune règle de continuation ne lui permet de jouer.

### Gestion des cas particuliers

Prévois :
- L'abandon volontaire d'un joueur.
- La possibilité de recommencer une partie.
- Le retour à l'écran de sélection des jeux.
- Une confirmation avant d'abandonner ou de réinitialiser une partie en cours.
- Une détection des positions répétitives ou des parties qui n'avancent plus, si cela est prévu par le règlement retenu.
- Une gestion explicite des parties nulles si la règle retenue les autorise.

Ne déclare jamais une victoire simplement parce qu'un joueur a effectué plusieurs captures ou parce que le plateau semble visuellement vide.

Toutes les conditions de fin de partie doivent être vérifiées par le moteur.

## 9. DÉROULEMENT COMPLET D'UNE PARTIE

L'expérience doit suivre ce déroulement :

### Étape 1 — Sélection du jeu

Le joueur accède à la liste des jeux de société de la plateforme et sélectionne Fanorona.

### Étape 2 — Écran de présentation

Afficher :
- Le nom Fanorona.
- Une illustration du plateau traditionnel.
- Une brève présentation du jeu.
- Le nombre de joueurs : 2.
- Le mode : multijoueur local.
- Un bouton « Jouer ».
- Un bouton « Règles du jeu ».

### Étape 3 — Préparation de la partie

Afficher le plateau avec les 44 pions dans leur configuration initiale.

Identifier clairement les deux camps :
- Joueur A : pions noirs.
- Joueur B : pions blancs.

Permettre, si la plateforme le permet, de personnaliser les noms des joueurs.

### Étape 4 — Premier tour

Déterminer le premier joueur selon la règle de départ retenue.

Afficher un indicateur visible du joueur actif.

### Étape 5 — Sélection d'un pion

Le joueur clique ou touche l'un de ses pions.

Le moteur calcule les déplacements possibles.

Les intersections légales sont mises en évidence.

Si une capture est obligatoire, seuls les déplacements capturants doivent être proposés.

### Étape 6 — Exécution du mouvement

Le joueur sélectionne une destination légale.

Le moteur valide le déplacement, détermine les captures possibles, puis exécute la méthode de capture choisie.

L'interface anime le mouvement et la disparition des pions capturés.

### Étape 7 — Capture successive

Si une nouvelle capture est possible avec le même pion, le joueur reste actif.

Le jeu conserve la liste des intersections déjà visitées pendant la séquence.

### Étape 8 — Fin du tour

Lorsque la séquence est terminée, le moteur vérifie les conditions de victoire puis passe au joueur suivant si la partie continue.

### Étape 9 — Fin de partie

Afficher un écran de résultat :
- Nom du vainqueur.
- Motif de victoire : capture complète ou blocage.
- Nombre de pions capturés par chaque joueur.
- Nombre de tours joués, si disponible.
- Bouton « Rejouer ».
- Bouton « Retour aux jeux ».

## 10. INTERFACE UTILISATEUR ET EXPÉRIENCE DE JEU

Conçois une interface moderne, élégante et cohérente avec le style de la plateforme existante.

### Plateau

- Représenter clairement les 45 intersections.
- Tracer fidèlement les lignes horizontales, verticales et diagonales autorisées.
- Donner au plateau une apparence inspirée du bois ou des matériaux traditionnels malgaches, sans sacrifier la lisibilité.
- Afficher des pions visuellement distincts.
- Prévoir des zones de clic ou de toucher suffisamment grandes.
- Éviter toute déformation des proportions du plateau.

### Informations de partie

Afficher en permanence :
- Le joueur actif.
- Le nombre de pions restants pour chaque camp.
- Le nombre de pions capturés.
- L'état de la partie.
- L'indication d'une capture obligatoire.
- L'indication d'une séquence de capture en cours.

### Interactions

- Sélection visuelle du pion actif.
- Mise en évidence des destinations légales.
- Distinction visuelle entre captures par approche et par retrait.
- Animation légère des déplacements.
- Animation de capture.
- Indication claire d'un mouvement interdit.
- Désactivation des interactions lorsque la partie est terminée.

Ne repose pas uniquement sur les couleurs : les états doivent également être reconnaissables par des formes, des contours ou des icônes.

### Responsive design

Le plateau doit être utilisable sur :
- Ordinateur.
- Tablette.
- Smartphone.

Sur mobile, le plateau doit rester entièrement visible autant que possible. Les contrôles ne doivent pas recouvrir les intersections.

Respecte les mécanismes d'accessibilité existants et prends en charge la navigation au clavier lorsque cela est compatible avec la plateforme.

## 11. ARCHITECTURE DU MOTEUR DE JEU

Sépare les règles métier de l'interface graphique.

Le moteur doit être déterministe et testable sans navigateur.

Organise le code autour de fonctions ou modules responsables de :

- La création de la position initiale.
- La représentation du graphe du plateau.
- La détermination du joueur actif.
- La génération des déplacements légaux.
- La détection des captures par approche.
- La détection des captures par retrait.
- La validation des captures obligatoires.
- La gestion des séquences de capture.
- La prévention des retours vers une intersection déjà visitée pendant une séquence.
- La détection de victoire et de blocage.
- Le changement de tour.
- La réinitialisation de la partie.

Utilise un état de jeu centralisé contenant au minimum :
- La position des 45 intersections.
- Le joueur actif.
- Le nombre de pions restants par joueur.
- L'état de la partie.
- La séquence de capture en cours.
- Le pion actuellement utilisé pendant cette séquence.
- Les intersections déjà visitées pendant cette séquence.
- L'historique des mouvements.

Chaque action doit être validée par le moteur avant de modifier l'état.

Évite les modifications dispersées de l'état depuis plusieurs composants UI.

Si le projet possède déjà une architecture ou une convention de gestion d'état, adapte-toi à celle-ci au lieu d'introduire arbitrairement une nouvelle bibliothèque.

## 12. HISTORIQUE, ANNULATION ET SAUVEGARDE

Prévois un historique des actions de la partie, comprenant :
- Le joueur qui a joué.
- Le pion déplacé.
- La position de départ et la destination.
- La méthode de capture.
- Les pions capturés.
- Le résultat du tour.

Si une fonctionnalité d'annulation est proposée, elle doit restaurer intégralement l'état antérieur, y compris les pions capturés, le joueur actif et les données de séquence.

Ne permets pas une annulation partielle qui produirait un état impossible.

La sauvegarde et la reprise d'une partie doivent respecter les mécanismes de stockage existants. Si une persistance est ajoutée, elle doit conserver un état cohérent et validé.

## 13. TESTS AUTOMATISÉS OBLIGATOIRES

Crée des tests unitaires pour le moteur, indépendamment de l'interface.

### Tests du plateau

- 45 intersections exactement.
- 22 pions par joueur au départ.
- 44 pions au total.
- Intersection centrale vide.
- Connexions horizontales et verticales correctes.
- Connexions diagonales conformes au plateau traditionnel.
- Aucun déplacement à travers une ligne inexistante.

### Tests des déplacements

- Déplacement vers une intersection vide et adjacente.
- Refus d'un déplacement vers une intersection occupée.
- Refus d'un déplacement non connecté.
- Refus de déplacer le pion adverse.
- Refus des sauts ordinaires.

### Tests de capture

- Capture par approche d'un pion.
- Capture par approche d'une chaîne de plusieurs pions.
- Capture par retrait d'un pion.
- Capture par retrait d'une chaîne.
- Vérification des limites du plateau.
- Vérification des interruptions de chaîne.
- Choix entre approche et retrait lorsque les deux sont possibles.
- Obligation de capturer lorsqu'une capture est disponible.

### Tests des séquences

- Continuation avec le même pion.
- Interdiction de changer de pion pendant une séquence.
- Interdiction de revisiter une intersection déjà visitée.
- Recalcul des captures après chaque mouvement.
- Fin automatique de la séquence lorsqu'aucune continuation légale n'existe.
- Passage au joueur suivant après la séquence.

### Tests de fin de partie

- Victoire après capture du dernier pion adverse.
- Victoire par blocage.
- Aucun mouvement après la fin de partie.
- Réinitialisation complète.
- Comptage cohérent des pions.
- Gestion des répétitions et des éventuelles parties nulles conformément au règlement retenu.

### Tests d'intégration

- Démarrage d'une nouvelle partie.
- Alternance des joueurs.
- Interaction avec le plateau.
- Affichage des destinations légales.
- Affichage des captures obligatoires.
- Déroulement complet d'une séquence de capture.
- Écran de victoire.
- Recommencement d'une partie.

Ajoute des tests de propriétés ou des invariants si le framework existant le permet.

Les invariants essentiels sont :
- Le nombre total de pions ne peut jamais augmenter.
- Un pion capturé ne revient pas sur le plateau, sauf annulation ou réinitialisation explicitement prévue.
- Une intersection ne contient jamais deux pions.
- Aucun mouvement illégal ne peut modifier l'état.
- Les compteurs correspondent toujours aux pions réellement présents.
- Le joueur actif est toujours cohérent avec l'état de la partie.

## 14. PERFORMANCE ET QUALITÉ

Le Fanorona est un jeu léger. Ne construis pas une architecture surdimensionnée.

- Évite les recalculs inutiles du plateau.
- Sépare le moteur et le rendu.
- Évite les dépendances superflues.
- Maintiens une logique métier lisible.
- Utilise des types stricts si le projet utilise TypeScript.
- Respecte les conventions de formatage et de lint.
- Ne masque pas les erreurs avec des exceptions générales.
- Ne remplace pas les tests existants.
- Ne casse aucune fonctionnalité partagée avec les autres jeux.

## 15. DOCUMENTATION DES RÈGLES

Ajoute un écran ou une fenêtre « Règles du jeu » comprenant :

1. Le but du jeu.
2. La composition du plateau.
3. La disposition initiale des pions.
4. Les déplacements autorisés.
5. La capture par approche.
6. La capture par retrait.
7. La capture obligatoire.
8. Les captures successives.
9. Les conditions de victoire.
10. Les éventuelles règles de répétition ou de partie nulle.

Utilise des illustrations ou des schémas simples pour expliquer les captures.

Les explications doivent correspondre exactement au comportement réel du moteur.

Si des variantes traditionnelles existent, indique explicitement le règlement implémenté.

## 16. MÉTHODE DE TRAVAIL IMPOSÉE

Travaille par étapes et valide chacune d'elles.

### Phase A — Analyse

- Examiner le projet.
- Comprendre son architecture.
- Identifier les points d'intégration.
- Rédiger un plan technique.

### Phase B — Conception des règles

- Formaliser le graphe du plateau.
- Définir la configuration initiale.
- Définir les structures d'état.
- Formaliser les règles de capture.
- Clarifier les variantes retenues.

### Phase C — Implémentation du moteur

- Construire le plateau.
- Implémenter les déplacements.
- Implémenter les captures.
- Implémenter les séquences.
- Implémenter les conditions de fin.
- Écrire et exécuter les tests unitaires.

### Phase D — Interface

- Créer la page du jeu.
- Afficher le plateau et les pions.
- Ajouter les interactions.
- Ajouter les indications de capture.
- Ajouter les animations.
- Ajouter les écrans de victoire et les règles.

### Phase E — Intégration

- Relier le jeu à la liste existante.
- Respecter les conventions de navigation.
- Vérifier la compatibilité avec les autres jeux.
- Vérifier le fonctionnement sur ordinateur et mobile.

### Phase F — Validation finale

- Exécuter les tests.
- Exécuter le lint et le contrôle de types.
- Lancer l'application.
- Effectuer une partie complète avec deux joueurs.
- Tester les captures complexes.
- Corriger les défauts découverts.
- Vérifier les changements du dépôt avant de terminer.

Ne déclare pas une fonctionnalité terminée si elle n'a pas été vérifiée.

## 17. CRITÈRES D'ACCEPTATION

Le travail est terminé uniquement si :

- Le jeu est accessible depuis la plateforme existante.
- Le plateau traditionnel est correctement représenté.
- La position initiale est correcte.
- Les déplacements légaux sont respectés.
- Les captures par approche et par retrait fonctionnent.
- Les captures sont obligatoires lorsqu'elles sont disponibles.
- Les séquences de capture respectent les règles.
- Les intersections déjà visitées ne peuvent pas être revisitées pendant une séquence.
- Les conditions de victoire et de blocage sont correctes.
- L'interface fonctionne sur ordinateur et mobile.
- L'historique et les compteurs restent cohérents.
- Les tests passent.
- Aucun jeu existant n'a été cassé.
- La documentation est à jour.

## 18. RAPPORT FINAL

À la fin, fournis un compte rendu comprenant :

- Les fonctionnalités implémentées.
- Les fichiers créés et modifiés.
- L'architecture retenue.
- Les règles et variantes effectivement implémentées.
- Les tests exécutés et leurs résultats.
- Les éventuels problèmes restant à résoudre.
- Les commandes nécessaires pour lancer et tester le jeu.

Commence maintenant par la phase A : analyse du projet existant. Ne commence pas par générer aveuglément tous les fichiers. Vérifie d'abord comment intégrer proprement le Fanorona dans la plateforme.







# PROMPT MAÎTRE — INTÉGRATION D'UN MONOPOLY PREMIUM DANS UNE PLATEFORME DE JEUX DE SOCIÉTÉ

## 1. RÔLE ET OBJECTIF

Tu es un développeur senior full-stack, architecte logiciel et spécialiste des jeux de société numériques, des moteurs de règles déterministes, des interfaces interactives et des animations web.

Ta mission est d'intégrer une version numérique complète de Monopoly dans ma plateforme existante de jeux de société.

Le résultat doit être un jeu réellement fonctionnel, moderne, immersif, fluide et fiable, avec une expérience premium digne d'un jeu de société numérique professionnel.

### Configuration obligatoire

- **Jeu :** Monopoly classique, avec les règles officielles de référence de l'édition retenue.
- **Joueurs :** de 2 à 8 participants.
- **Mode :** multijoueur local sur un même appareil.
- **Plateau :** 40 cases.
- **Interface :** moderne, élégante, responsive et animée.
- **Langue initiale :** français.
- **Architecture :** intégration dans le projet existant.
- **Connexion Internet :** non requise pour une partie locale, sauf dépendance préexistante indispensable.
- **Sauvegarde :** reprise d'une partie lorsque cela est compatible avec l'architecture existante.

Il ne s'agit pas de créer une simple maquette avec des boutons décoratifs. Toutes les interactions doivent déclencher de véritables actions de jeu, validées par un moteur de règles.

## 2. RÈGLES ABSOLUES AVANT DE CODER

Avant toute modification :

1. Analyse l'intégralité de la structure pertinente du projet.
2. Identifie le framework, les dépendances, le système de navigation, le système de styles et la gestion de l'état.
3. Identifie la page d'accueil, la liste des jeux et le mécanisme utilisé pour démarrer une partie.
4. Examine au moins un jeu déjà intégré afin de comprendre les conventions du projet.
5. Identifie les composants réutilisables : boutons, modales, notifications, animations, menus, stockage et gestion des joueurs.
6. Vérifie les scripts de développement, de test, de lint et de compilation.
7. Détermine les fichiers à créer, modifier ou réutiliser.
8. Propose un plan technique avant de commencer l'implémentation.

Respecte strictement les conventions existantes. Ne remplace pas l'architecture de la plateforme, ne réécris pas les autres jeux et n'ajoute pas de dépendances inutiles.

Le travail doit être réalisé progressivement, avec vérification après chaque phase.

## 3. IDENTITÉ VISUELLE ET DIRECTION ARTISTIQUE

Crée une expérience visuelle premium, avec une identité propre à la plateforme.

### Direction artistique

- Plateau de jeu élégant, parfaitement lisible.
- Palette raffinée associant des tons crème, ivoire, vert profond, doré discret et couleurs distinctes pour les propriétés.
- Pions de joueurs visuellement différenciés.
- Billets, cartes, maisons et hôtels représentés avec soin.
- Ombres légères, profondeur et effets de matière subtils.
- Typographie moderne et hiérarchie visuelle claire.
- Animations fluides, sans effets excessifs.
- Transitions élégantes entre les phases du tour.
- Retours visuels immédiats pour chaque action.
- Interface cohérente avec les autres jeux de la plateforme.

Ne transforme pas le plateau en tableau de bord surchargé. Le plateau doit rester le centre visuel de la partie.

Utilise des illustrations et des ressources originales ou dûment autorisées. Ne copie pas des éléments graphiques propriétaires sans autorisation.

## 4. ÉCRANS ET PARCOURS UTILISATEUR

### Écran A — Présentation du jeu

Créer une page d'accueil dédiée au Monopoly comprenant :

- Le nom du jeu.
- Une illustration du plateau.
- Une description courte.
- Le nombre de joueurs pris en charge.
- Une indication « Multijoueur local ».
- Un bouton « Nouvelle partie ».
- Un bouton « Règles du jeu ».
- Un accès à une partie sauvegardée si cette fonctionnalité existe.

### Écran B — Configuration

Avant le lancement, permettre de configurer :

- Le nombre de joueurs : de 2 à 8.
- Le nom de chaque joueur.
- Le pion de chaque joueur.
- L'ordre de jeu, selon le mécanisme de départ retenu.
- La durée souhaitée : partie classique ou partie à durée limitée, si le mode chronométré est implémenté.
- Les options de partie autorisées par le règlement sélectionné.

Les paramètres non standard doivent être clairement identifiés comme des variantes.

Empêche le lancement si les paramètres sont invalides.

### Écran C — Plateau de jeu

Afficher le plateau complet et les informations essentielles :

- Les 40 cases.
- Les propriétés et leurs groupes de couleurs.
- Les joueurs et leurs pions.
- Les maisons et les hôtels.
- Les cartes et les propriétés possédées.
- L'argent de chaque joueur.
- Le joueur actif.
- Les dés.
- L'historique des événements.
- Les actions disponibles pendant le tour.

### Écran D — Fin de partie

Afficher :

- Le vainqueur.
- Le classement final.
- Le patrimoine final estimé de chaque joueur, si calculable.
- Les propriétés détenues.
- Les statistiques de la partie.
- Un bouton « Rejouer ».
- Un bouton « Retour aux jeux ».

## 5. PLATEAU TRADITIONNEL DE 40 CASES

Implémente les 40 positions dans un ordre circulaire déterministe.

Le plateau doit comprendre :

- 22 propriétés foncières regroupées en 8 groupes de couleurs.
- 4 gares.
- 2 compagnies de services publics.
- 3 cases Chance.
- 3 cases Caisse de communauté.
- 2 cases fiscales.
- 4 cases d'angle : Départ, Prison / Simple visite, Parc gratuit et Allez en prison.

Les noms, les prix, les loyers, les coûts de construction et les effets des cartes doivent provenir d'une configuration unique correspondant à l'édition de référence retenue.

Ne disperse pas les règles économiques dans les composants visuels.

### Représentation technique

Chaque case possède :

- Un identifiant stable.
- Un index compris entre 0 et 39.
- Un type.
- Un nom.
- Les données spécifiques à son type.
- Les éventuels effets déclenchés à l'arrivée.

Les propriétés doivent disposer des données nécessaires à leur achat, leur location, leur construction, leur hypothèque et leur vente.

Le plateau visuel et le moteur de règles doivent utiliser la même configuration.

## 6. PRÉPARATION ET DÉROULEMENT D'UNE PARTIE

### Initialisation

À la création d'une partie :

1. Valider le nombre de joueurs.
2. Créer les participants.
3. Attribuer à chaque participant un identifiant et un pion unique.
4. Placer tous les pions sur Départ.
5. Attribuer à chaque joueur le capital initial prévu par l'édition sélectionnée.
6. Initialiser la banque.
7. Initialiser les propriétés, les maisons et les hôtels.
8. Mélanger les paquets de cartes selon une procédure contrôlée.
9. Initialiser les compteurs et l'historique.
10. Déterminer le premier joueur conformément à la règle retenue.
11. Afficher le plateau prêt à jouer.

Pour l'édition classique de référence, utiliser les règles monétaires traditionnelles, notamment un capital initial de 1 500 unités monétaires par joueur et un salaire de 200 lors du passage par Départ, sous réserve de vérifier la compatibilité avec l'édition retenue.

### Tour normal

Le tour doit suivre une machine à états explicite :

1. Vérifier que la partie est active.
2. Identifier le joueur actif.
3. Vérifier si le joueur est en prison.
4. Permettre les actions préalables autorisées, comme la gestion de certaines propriétés.
5. Demander le lancer des dés.
6. Calculer le déplacement.
7. Animer le déplacement du pion.
8. Résoudre les cases traversées et l'arrivée.
9. Résoudre les paiements, les achats, les cartes ou les autres effets.
10. Traiter les doubles et les éventuelles actions supplémentaires.
11. Vérifier la faillite et la fin de partie.
12. Passer au prochain joueur lorsque toutes les actions obligatoires sont terminées.

Ne permets jamais de passer au tour suivant alors qu'une enchère, un paiement, un choix de carte ou une autre action obligatoire est encore en attente.

## 7. SYSTÈME DE DÉS ET DÉPLACEMENTS

Utilise deux dés à six faces dans le mode classique.

Le lancer produit deux résultats indépendants et détermine le nombre de cases à parcourir.

### Exigences

- Animation réaliste du lancer.
- Résultat affiché clairement.
- Calcul du déplacement à partir de la position actuelle.
- Déplacement circulaire autour du plateau.
- Détection du passage par Départ.
- Attribution du salaire conformément aux règles.
- Gestion des doubles.
- Historique du lancer.

L'animation ne doit jamais déterminer le résultat logique. Le moteur calcule le résultat et l'animation le représente.

### Règle des doubles

Implémente les règles classiques :

- Un double permet normalement de rejouer après la résolution complète du déplacement et de ses effets.
- Un troisième double consécutif pendant le même tour envoie le joueur directement en prison.
- Un joueur qui vient d'être envoyé en prison ne bénéficie pas d'un lancer supplémentaire.
- Les règles propres aux doubles lorsqu'un joueur sort de prison doivent être traitées explicitement.

Empêche les doubles de déclencher un nouveau lancer si une action obligatoire n'est pas terminée.

## 8. ACHAT DES PROPRIÉTÉS

Lorsqu'un joueur arrive sur une propriété non possédée :

1. Afficher une carte détaillée de la propriété.
2. Présenter son prix.
3. Proposer l'achat si le joueur dispose de fonds suffisants.
4. Proposer de passer l'achat.
5. Si le joueur refuse ou ne peut pas acheter, déclencher les enchères prévues par les règles classiques.

Après un achat :

- Débiter le joueur.
- Créditer la banque.
- Attribuer la propriété au joueur.
- Mettre à jour les statistiques.
- Actualiser les loyers potentiels.
- Mettre à jour l'interface.
- Enregistrer l'événement dans l'historique.

Un joueur ne peut pas acheter une propriété déjà détenue par un autre joueur.

Les propriétés ne doivent jamais être attribuées à deux joueurs simultanément.

## 9. SYSTÈME D'ENCHÈRES

Les enchères sont une fonctionnalité obligatoire.

Créer une interface dédiée aux enchères, utilisable par les joueurs locaux à tour de rôle.

Fonctionnement :

1. Présenter la propriété mise aux enchères.
2. Afficher la meilleure offre actuelle.
3. Permettre à chaque participant encore éligible de surenchérir ou de passer.
4. Vérifier que chaque offre est valide.
5. Empêcher les offres dépassant les fonds disponibles, selon les règles retenues.
6. Continuer jusqu'à ce que les participants restants aient passé ou qu'il ne reste qu'un enchérisseur actif.
7. Attribuer la propriété au gagnant.
8. Effectuer le paiement et mettre à jour les données.
9. Si aucun joueur ne souhaite enchérir, laisser la propriété à la banque.

Gère correctement le cas où un joueur fait faillite ou devient inéligible pendant une enchère.

L'interface doit indiquer clairement qui doit répondre, le montant minimal de la prochaine offre et le temps restant éventuel si un minuteur est ajouté.

## 10. CALCUL DES LOYERS

Le calcul du loyer doit être centralisé dans le moteur.

### Propriétés foncières

Le loyer dépend notamment :

- De la propriété concernée.
- De la possession éventuelle de tout le groupe de couleurs.
- Du nombre de maisons.
- De la présence d'un hôtel.
- De l'existence éventuelle d'une hypothèque.
- Des règles de l'édition sélectionnée.

Lorsqu'un joueur arrive sur une propriété adverse :

1. Identifier son propriétaire.
2. Vérifier les conditions de perception du loyer.
3. Calculer le montant.
4. Vérifier les fonds du payeur.
5. Effectuer le transfert ou déclencher la procédure d'insolvabilité.
6. Enregistrer le paiement.

### Gares

Le loyer doit dépendre du nombre de gares détenues par le propriétaire, conformément au barème de l'édition retenue.

### Compagnies de services publics

Le calcul doit dépendre du résultat des dés et du nombre de compagnies détenues, selon les règles de référence.

### Cas particuliers

- Aucun loyer sur une propriété détenue par le joueur lui-même.
- Aucun loyer lorsque les règles d'hypothèque l'interdisent.
- Aucun paiement en double lors d'un même événement.
- Aucun paiement déclenché uniquement par une animation.

Tous les montants doivent être calculés et validés par le moteur.

## 11. MAISONS, HÔTELS ET CONSTRUCTION

La construction est autorisée uniquement lorsque les conditions réglementaires sont remplies.

### Conditions

- Le joueur possède l'intégralité du groupe de couleurs.
- Les règles applicables au groupe sont satisfaites.
- Les restrictions d'hypothèque sont respectées.
- Les constructions sont effectuées de manière équilibrée entre les propriétés du groupe.
- Le joueur possède les fonds nécessaires.
- La banque dispose des bâtiments disponibles si cette limite est appliquée.

### Maisons

Respecter les règles de construction équilibrée : aucune propriété ne peut avoir une maison de plus que les autres propriétés du même groupe, dans les limites prévues par le règlement.

### Hôtels

Un hôtel ne peut être construit que lorsque les conditions de construction de l'édition retenue sont remplies, notamment le nombre de maisons préalables.

### Vente de bâtiments

Permettre la vente des bâtiments selon le règlement :

- Prix de revente conforme au barème.
- Vente équilibrée.
- Mise à jour immédiate des loyers.
- Respect des restrictions de la banque et des propriétés hypothéquées.

Le moteur doit empêcher toute construction ou vente illégale, même si l'interface propose accidentellement un bouton incorrect.

## 12. CARTES CHANCE ET CAISSE DE COMMUNAUTÉ

Prévoir deux paquets distincts.

Chaque carte possède :

- Un identifiant.
- Un type d'effet.
- Un texte explicatif.
- Les paramètres de l'effet.
- Les règles de conservation ou de retour dans le paquet.
- Les éventuelles conditions particulières.

### Effets à prendre en charge

Selon l'édition retenue :

- Recevoir de l'argent.
- Payer une somme.
- Payer des frais ou des réparations.
- Avancer vers une case précise.
- Reculer d'un certain nombre de cases.
- Aller en prison.
- Sortir gratuitement de prison.
- Recevoir de l'argent d'autres joueurs.
- Payer chaque autre joueur.
- Recevoir un salaire si la carte le prévoit.

Les déplacements déclenchés par les cartes doivent eux aussi résoudre les effets de la case d'arrivée.

Évite les chaînes de résolution infinies. Utilise un mécanisme déterministe de résolution des événements.

### Présentation

Affiche une animation de pioche, la carte en grand format, son texte et son effet.

L'animation ne doit pas empêcher la validation immédiate des conséquences métier.

Utilise uniquement des cartes originales ou dûment autorisées si le contenu graphique officiel n'est pas disponible sous licence.

## 13. PRISON

La prison doit être modélisée comme un état de joueur, distinct de sa simple position sur le plateau.

### Entrée en prison

Un joueur est envoyé en prison lorsqu'une règle le prévoit, notamment après avoir tiré une carte correspondante ou atteint la case Allez en prison.

Le joueur ne reçoit pas le salaire de Départ pour le déplacement direct vers la prison.

### Sortie de prison

Implémente les possibilités prévues par le règlement de référence :

- Payer l'amende applicable.
- Utiliser une carte de sortie de prison.
- Tenter d'obtenir un double avec les dés.
- Gérer le nombre maximal de tentatives.

Après le nombre de tentatives autorisé, appliquer la règle de paiement et de sortie correspondante.

### Restrictions

- Ne pas déplacer librement le pion pendant la détention.
- Ne pas confondre la prison et la simple visite.
- Gérer correctement les doubles obtenus en prison.
- Respecter les règles de relance applicables après la sortie.
- Afficher le statut du joueur et les actions possibles.

## 14. TAXES, DÉPART ET PARC GRATUIT

### Départ

Lorsqu'un joueur passe par Départ, lui attribuer le salaire prévu par les règles.

Applique le paiement une seule fois par passage.

### Taxes

Les cases fiscales doivent débiter le joueur selon le montant fixé par l'édition de référence.

### Parc gratuit

Dans les règles classiques officielles, le Parc gratuit n'attribue pas automatiquement de cagnotte.

Ne mets pas en place de cagnotte au Parc gratuit dans le mode officiel.

Si une variante avec cagnotte est proposée, elle doit être désactivée par défaut et clairement identifiée comme une règle personnalisée.

## 15. ÉCHANGES ENTRE JOUEURS

Permettre aux joueurs d'échanger des actifs lorsque les règles le permettent.

Un échange peut inclure :

- Des propriétés.
- Des montants d'argent.
- Des cartes de sortie de prison.
- Des combinaisons de ces éléments.

### Processus

1. Le joueur propose un échange.
2. Il choisit les actifs qu'il offre.
3. Il choisit les actifs qu'il souhaite recevoir.
4. Le système vérifie la validité de l'offre.
5. Le joueur destinataire examine la proposition.
6. Il peut accepter ou refuser.
7. Une offre peut être annulée ou modifiée avant acceptation.
8. En cas d'acceptation, le moteur valide à nouveau l'ensemble des conditions.
9. L'échange est appliqué de manière atomique.
10. L'historique est actualisé.

### Validations essentielles

- Aucun actif ne peut être transféré s'il n'appartient pas à l'offrant.
- Aucun paiement ne peut être exécuté deux fois.
- Les hypothèques doivent être traitées conformément aux règles applicables.
- Les bâtiments doivent être vendus avant les échanges lorsque le règlement l'exige.
- Les échanges ne doivent pas contourner les règles de construction ou d'endettement.
- Un échange ne doit jamais créer un état financier incohérent.

## 16. HYPOTHÈQUES

Permettre au joueur de mettre une propriété en hypothèque lorsque les conditions sont remplies.

Prévoir :

- La valeur hypothécaire.
- Le versement du montant correspondant.
- L'état hypothéqué de la propriété.
- Les restrictions sur les loyers.
- Les restrictions sur la construction.
- Le remboursement de l'hypothèque.
- Les intérêts ou frais prévus par l'édition de référence.
- Le traitement des propriétés hypothéquées pendant les échanges et les faillites.

Une propriété hypothéquée doit rester attribuée à son propriétaire jusqu'à son transfert légal.

L'hypothèque ne doit pas être confondue avec une vente définitive de la propriété.

## 17. DETTES, PAIEMENTS ET FAILLITE

C'est l'un des modules les plus importants du moteur.

Chaque joueur possède un solde financier validé.

### Paiement

Lorsqu'un paiement est demandé :

1. Calculer le montant dû.
2. Identifier le bénéficiaire : banque ou autre joueur.
3. Vérifier les fonds du payeur.
4. Si le solde est suffisant, effectuer le paiement.
5. Sinon, ouvrir une procédure d'insolvabilité.
6. Permettre les opérations autorisées pour réunir les fonds.
7. Appliquer la faillite uniquement lorsque le joueur ne peut plus satisfaire sa dette conformément au règlement.

### Solutions avant la faillite

Lorsque cela est autorisé, permettre au joueur de :

- Vendre des maisons ou des hôtels.
- Hypothéquer des propriétés admissibles.
- Effectuer les autres opérations réglementaires permettant de réunir des fonds.

Ne laisse jamais un joueur payer un montant qu'il ne possède pas sans passer par une procédure d'endettement explicitement définie.

### Faillite envers un joueur

Traiter le transfert des actifs et des dettes selon les règles de référence, notamment les propriétés hypothéquées et les cartes détenues.

### Faillite envers la banque

Appliquer la procédure officielle de cession ou de vente des actifs prévue par le règlement sélectionné.

### Après la faillite

- Retirer le joueur des tours futurs.
- Mettre à jour les propriétés.
- Mettre à jour les dettes et les soldes.
- Mettre à jour les compteurs.
- Empêcher toute nouvelle action de ce joueur.
- Vérifier si la partie est terminée.

Ne supprime pas les actifs d'un joueur en faillite sans appliquer leur transfert réglementaire.

## 18. FIN DE PARTIE ET VICTOIRE

La condition de victoire classique est d'être le dernier joueur restant après la faillite des autres participants.

Lorsqu'il ne reste qu'un joueur solvable :

1. Terminer la partie.
2. Empêcher les nouvelles actions.
3. Calculer les statistiques finales.
4. Déterminer le vainqueur.
5. Afficher l'écran de résultat.

### Partie chronométrée facultative

Si un mode limité dans le temps est implémenté, définir clairement une règle de classement final, par exemple le patrimoine net selon une méthode explicitement documentée.

Ne présente pas cette variante comme la condition de victoire officielle classique.

Le moteur doit aussi traiter les abandons volontaires, les sauvegardes et les reprises sans créer de propriété orpheline ou de paiement en double.

## 19. INTERFACE DE PARTIE PREMIUM

### Disposition sur ordinateur

Prévoir une disposition avec :

- Plateau central dominant.
- Informations du joueur actif.
- Panneau des joueurs.
- Soldes financiers.
- Actions contextuelles.
- Historique des événements.
- Cartes de propriétés accessibles rapidement.

Le plateau doit rester visible et lisible, même avec huit joueurs.

### Disposition sur mobile

- Plateau adapté à la largeur disponible.
- Panneaux repliables pour les joueurs et les propriétés.
- Actions essentielles accessibles sans recouvrir le plateau.
- Modales adaptées au toucher.
- Aucun défilement horizontal accidentel.
- Aucun texte ou pion coupé par les limites de l'écran.

### Informations par joueur

Pour chaque participant, afficher :

- Nom.
- Pion.
- Argent disponible.
- Propriétés possédées.
- Statut : actif, en prison, en faillite ou vainqueur.
- Indicateur du joueur dont c'est le tour.

### Panneau d'action contextuel

Afficher uniquement les actions pertinentes selon la situation :

- Lancer les dés.
- Acheter.
- Passer l'achat.
- Participer à une enchère.
- Payer.
- Gérer ses propriétés.
- Construire.
- Hypothéquer.
- Échanger.
- Sortir de prison.
- Terminer le tour.

Les boutons doivent être désactivés lorsque l'action n'est pas autorisée.

Ne te fie jamais uniquement à l'état visuel du bouton pour protéger les règles métier.

## 20. ANIMATIONS ET RETOURS VISUELS

Les animations doivent renforcer la compréhension du jeu.

Prévoir :

- Lancer animé des dés.
- Déplacement fluide du pion sur les cases.
- Mise en évidence de la case d'arrivée.
- Animation d'achat.
- Apparition des cartes.
- Effet de paiement.
- Construction d'une maison ou d'un hôtel.
- Transitions des modales.
- Notification de loyer.
- Animation de faillite.
- Célébration du vainqueur.

### Contraintes

- Les animations ne doivent jamais modifier elles-mêmes l'état métier.
- Une animation interrompue ne doit pas bloquer le tour.
- Les actions doivent être verrouillées pendant les transitions critiques lorsque nécessaire.
- Le moteur doit empêcher les clics répétés de provoquer plusieurs transactions.
- Respecter la préférence système de réduction des animations si le framework le permet.
- Préserver de bonnes performances sur les appareils modestes.

## 21. MOTEUR DE RÈGLES ET ARCHITECTURE

Sépare strictement :

1. Les règles métier.
2. L'état de la partie.
3. Les commandes du joueur.
4. La résolution des événements.
5. L'interface et les animations.
6. La persistance éventuelle.

### Modèle de données minimal

**GameState**
- Identifiant de partie.
- État : configuration, en cours, terminée.
- Joueur actif.
- Ordre des joueurs.
- Index de la case de chaque pion.
- État des dés.
- Propriétés et propriétaires.
- Maisons et hôtels.
- Soldes des joueurs et de la banque.
- Statuts de prison et de faillite.
- Paquets de cartes.
- Phase de jeu.
- Actions en attente.
- Historique.
- Vainqueur éventuel.

**Player**
- Identifiant.
- Nom.
- Pion.
- Solde.
- Position.
- Propriétés détenues.
- Cartes conservées.
- Statut de prison.
- Statut de faillite.

**Property**
- Identifiant.
- Index du plateau.
- Type.
- Prix d'achat.
- Propriétaire éventuel.
- Barème de loyer.
- Groupe de couleur éventuel.
- Niveau de construction.
- État d'hypothèque.

### Machine à états

Prévois des phases explicites, telles que :

- CONFIGURATION.
- DÉBUT_DU_TOUR.
- GESTION_PRÉALABLE.
- LANCER_DÉS.
- DÉPLACEMENT.
- RÉSOLUTION_CASE.
- ACHAT_OU_ENCHÈRE.
- PAIEMENT.
- RÉSOLUTION_CARTE.
- PRISON.
- ÉCHANGE.
- CONSTRUCTION.
- FIN_DU_TOUR.
- PARTIE_TERMINÉE.

Adapte cette liste à l'architecture existante. Il n'est pas nécessaire de créer une phase pour chaque action si une représentation plus simple est plus robuste.

Chaque commande doit être validée par rapport à l'état courant.

Une commande illégale ne doit pas modifier l'état.

### Gestion atomique des transactions

Les opérations financières doivent être indivisibles au niveau du moteur.

Un paiement, un achat, une enchère ou un échange ne doit jamais laisser l'état à moitié modifié.

Utilise des validations préalables et des transitions d'état contrôlées. Si le projet dispose d'un mécanisme de transactions ou de réduction d'état immuable, réutilise-le.

Pour les dés, sépare le mécanisme de génération du résultat et la logique de déplacement. Fournis un générateur contrôlable en tests.

## 22. SAUVEGARDE ET REPRISE

Si le stockage existant le permet, sauvegarder :

- L'état complet de la partie.
- L'ordre des joueurs.
- Le joueur actif.
- Les soldes.
- Les propriétés.
- Les constructions.
- Les hypothèques.
- Les cartes.
- Les statuts de prison.
- Les enchères en cours.
- Les dettes et les actions en attente.
- L'historique nécessaire à une reprise cohérente.

Au chargement :

1. Valider la version des données.
2. Vérifier les invariants.
3. Restaurer la phase de jeu.
4. Empêcher de rejouer une action déjà appliquée.
5. Reprendre une action en attente sans duplication.

Ne sauvegarde jamais uniquement l'apparence du plateau. La reprise doit restaurer l'état métier complet.

Si la persistance n'est pas pertinente pour la plateforme, documente cette limitation et livre d'abord une partie locale complète.

## 23. TESTS AUTOMATISÉS OBLIGATOIRES

Écris les tests du moteur avant de finaliser l'interface.

### Initialisation

- 2 joueurs.
- 8 joueurs.
- Refus d'un nombre invalide.
- Pions uniques.
- Positions initiales correctes.
- Soldes initiaux corrects.
- 40 cases correctement configurées.

### Dés et déplacements

- Déplacement normal.
- Passage par Départ.
- Salaire attribué une seule fois.
- Doubles.
- Troisième double.
- Déplacement par une carte.
- Déplacement vers la prison.
- Aucun mouvement après la fin de partie.

### Propriétés

- Achat valide.
- Achat impossible faute de fonds.
- Propriété déjà détenue.
- Refus d'achat.
- Enchères.
- Propriétaire correctement mis à jour.
- Loyers corrects.
- Gares.
- Compagnies.
- Propriétés hypothéquées.

### Construction

- Groupe de couleurs complet.
- Groupe incomplet.
- Construction équilibrée.
- Nombre maximal de maisons.
- Passage à l'hôtel.
- Banque sans bâtiments disponibles.
- Vente de bâtiments.
- Recalcul du loyer.

### Cartes

- Réception d'argent.
- Paiement.
- Déplacement.
- Retour en arrière.
- Entrée en prison.
- Sortie de prison.
- Paiement à tous les joueurs.
- Effets de la case d'arrivée.
- Prévention des résolutions infinies.

### Prison

- Entrée normale.
- Simple visite.
- Tentative de double.
- Paiement de l'amende.
- Carte de sortie.
- Nombre maximal de tentatives.
- Reprise normale du tour.

### Échanges et faillite

- Échange valide.
- Refus d'échange.
- Actif inexistant.
- Argent insuffisant.
- Échange avec hypothèque.
- Dette envers la banque.
- Dette envers un joueur.
- Transfert des propriétés.
- Faillite d'un joueur.
- Fin de partie après les faillites.

### Tests d'invariants

Après chaque commande valide, vérifier notamment :

- Les soldes ne deviennent pas négatifs sans mécanisme explicite d'endettement.
- Une propriété possède au maximum un propriétaire.
- Une propriété appartient à la banque ou à un joueur actif selon son état.
- Les maisons et hôtels respectent les limites configurées.
- Aucun paiement n'est appliqué deux fois.
- Les joueurs en faillite ne jouent plus.
- La phase de jeu correspond à l'action attendue.
- La partie terminée n'accepte plus de commandes de jeu.
- Les actifs transférés sont correctement attribués.

Ajoute des tests d'intégration et des scénarios complets à plusieurs joueurs.

## 24. VALIDATION VISUELLE ET FONCTIONNELLE

Après les tests unitaires :

1. Lance l'application.
2. Accède au jeu depuis la liste des jeux existante.
3. Configure une partie à deux joueurs.
4. Effectue plusieurs tours.
5. Teste un achat et un paiement de loyer.
6. Teste une enchère.
7. Teste une construction.
8. Teste la prison.
9. Teste un échange.
10. Teste une faillite.
11. Teste une partie avec huit joueurs.
12. Vérifie les écrans sur ordinateur et sur mobile.
13. Vérifie les animations, les modales et les boutons.
14. Exécute le lint, le contrôle de types et les tests du projet.
15. Corrige les régressions avant de terminer.

Si un outil de navigateur ou de test visuel existe déjà dans le projet, utilise-le.

Ne prétends pas avoir exécuté un test qui n'a pas réellement été lancé.

## 25. MÉTHODE DE DÉVELOPPEMENT IMPOSÉE

Travaille par phases, avec une validation à chaque étape.

### Phase A — Analyse

Comprendre le projet et produire un plan d'intégration.

### Phase B — Conception

Formaliser les règles, les données du plateau, les phases du tour et les transitions métier.

### Phase C — Moteur

Implémenter les données, les commandes, les achats, les loyers, les enchères et les règles économiques. Écrire les tests correspondants.

### Phase D — Règles avancées

Implémenter les cartes, la prison, les constructions, les hypothèques, les échanges, les dettes et les faillites.

### Phase E — Interface

Créer le plateau, les panneaux de joueurs, les cartes, les actions contextuelles et les animations.

### Phase F — Intégration

Relier le jeu à la navigation et à la liste existante sans casser les autres jeux.

### Phase G — Vérification

Exécuter les tests, corriger les anomalies et vérifier le fonctionnement réel.

### Phase H — Documentation

Mettre à jour la documentation technique et les instructions de lancement.

Ne saute pas les phases de test pour gagner du temps. Si une phase échoue, corrige-la avant de continuer.

## 26. CRITÈRES D'ACCEPTATION FINAUX

Le jeu est considéré comme terminé uniquement lorsque :

- Il est accessible depuis la plateforme existante.
- Une partie de 2 à 8 joueurs peut être démarrée.
- Tous les joueurs jouent à tour de rôle sur le même appareil.
- Les 40 cases sont fonctionnelles.
- Les dés et les déplacements fonctionnent.
- Les achats et les enchères fonctionnent.
- Les loyers sont calculés correctement.
- Les maisons et les hôtels respectent les règles.
- Les cartes déclenchent les bons effets.
- La prison fonctionne.
- Les échanges sont validés.
- Les hypothèques et les dettes fonctionnent.
- Les faillites sont correctement traitées.
- Le vainqueur est correctement identifié.
- Les animations n'altèrent jamais la logique.
- L'interface est responsive.
- Les tests passent.
- Les jeux déjà présents continuent de fonctionner.
- La documentation est à jour.

## 27. RAPPORT FINAL

À la fin, fournis un rapport précisant :

- Les fonctionnalités implémentées.
- Les fichiers créés et modifiés.
- L'architecture retenue.
- L'édition de référence et les variantes sélectionnées.
- Les tests exécutés et leurs résultats.
- Les éventuels défauts encore présents.
- Les commandes pour lancer, tester et compiler le projet.

**Commence maintenant par la phase A : analyse le projet existant, identifie les points d'intégration et propose le plan technique. Ne génère pas tous les fichiers avant d'avoir compris l'architecture.**