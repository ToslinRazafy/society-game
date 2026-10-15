// Types partagés du Monopoly (moteur + rendu). Aucune dépendance DOM/React.

export type SpaceType =
  | "go"
  | "street"
  | "community" // Caisse de communauté
  | "chance"
  | "tax-income"
  | "tax-luxury"
  | "railroad"
  | "utility"
  | "jail-visiting" // Simple visite (coin)
  | "free-parking"
  | "go-to-jail";

export type ColorGroup =
  | "brun"
  | "cyan"
  | "magenta"
  | "orange"
  | "rouge"
  | "jaune"
  | "vert"
  | "marine";

/** Propriété achetable : rue, gare ou compagnie. */
export interface Space {
  index: number; // 0..39
  type: SpaceType;
  name: string; // nom court affiché sur la case
  fullName: string; // nom complet de la fiche propriété
  // Données économiques (propriétés uniquement) :
  group?: ColorGroup;
  price?: number;
  rent?: number[]; // [base, 1msn, 2msn, 3msn, 4msn, hôtel] pour les rues
  houseCost?: number;
  mortgageValue?: number;
  // Gares : loyer = rent[nbGaresDetenues - 1] = [25,50,100,200]
  // Compagnies : loyer = dés × (1 ou 2 compagnies ? 10 : 4)
}

export type CardEffect =
  | { kind: "collect"; amount: number }
  | { kind: "pay"; amount: number }
  | { kind: "collect-each"; amount: number } // de chaque joueur
  | { kind: "pay-each"; amount: number } // à chaque joueur
  | { kind: "move-to"; space: number; collectGo?: boolean }
  | { kind: "move-nearest-railroad" } // payer double si détenue
  | { kind: "move-nearest-utility" } // payer ×10 dés si détenue
  | { kind: "move-steps"; steps: number } // positif avance, négatif recule (via GO)
  | { kind: "go-to-jail" }
  | { kind: "jail-free"; keep: true } // conserver jusqu'à usage
  | { kind: "repairs"; perHouse: number; perHotel: number };

export interface GameCard {
  id: string;
  text: string;
  effect: CardEffect;
}
