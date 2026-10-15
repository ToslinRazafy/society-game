// État de partie et commandes — Monopoly. Moteur pur : aucun import DOM/React.
// Toutes les structures sont sérialisables (prêtes pour la persistance T-002).
import type { ColorGroup } from "./types";

export type Phase =
  | "roll" // le joueur actif doit lancer les dés
  | "resolveBuy" // case propriété non achetée : acheter ou mettre aux enchères
  | "auction" // enchère séquentielle en cours
  | "awaitPayment" // insolvabilité : réunir des fonds ou déclarer faillite
  | "manage" // fin de tour : gestion (construire, hypothéquer, échanger) puis passer
  | "over";

export type CommandType =
  | "ROLL"
  | "BUY"
  | "SKIP_BUY"
  | "AUCTION_BID"
  | "AUCTION_PASS"
  | "PAY_JAIL_FINE"
  | "USE_JAIL_CARD"
  | "BUILD"
  | "SELL_HOUSE"
  | "MORTGAGE"
  | "UNMORTGAGE"
  | "TRADE_PROPOSE"
  | "TRADE_ACCEPT"
  | "TRADE_REJECT"
  | "SETTLE_DEBT"
  | "DECLARE_BANKRUPT"
  | "END_TURN";

export interface PlayerState {
  id: string;
  name: string;
  token: string;
  balance: number;
  position: number; // index de case 0..39
  jailFreeCards: string[]; // ids de cartes « Sortie de Prison » conservées
  inJail: boolean;
  jailAttempts: number; // tentatives de double ce tour de prison
  bankrupt: boolean;
}

export interface PropertyState {
  owner: number | null; // index joueur, null = banque
  houses: number; // 0..5 (5 = hôtel)
  mortgaged: boolean;
}

export interface AuctionState {
  space: number;
  highBid: number; // 0 = aucune offre
  highBidder: number | null;
  bidder: number; // joueur actuellement invité à enchérir ou passer
  alive: number[]; // joueurs n'ayant pas encore passé
}

export interface DebtState {
  amount: number;
  to: number | "bank";
  resume: "turn" | "jail"; // phase à reprendre une fois la dette réglée
}

export interface TradeOffer {
  from: number;
  to: number;
  giveMoney: number;
  giveProps: number[];
  receiveMoney: number;
  receiveProps: number[];
}

export interface GameState {
  id: string;
  phase: Phase;
  players: PlayerState[];
  current: number; // joueur actif
  dice: [number, number] | null;
  extraRollPending: boolean; // des doubles → le joueur rejoue après gestion
  doublesStreak: number;
  props: PropertyState[]; // 40 entrées alignées sur SPACES
  buySpace: number; // case en attente d'achat/enchère (-1 hors resolveBuy/auction)
  chanceDeck: string[]; // ids restants, file FIFO
  communityDeck: string[];
  auction: AuctionState | null;
  debt: DebtState | null;
  tradeOffer: TradeOffer | null;
  bankHouses: number;
  bankHotels: number;
  turn: number;
  winner: number | null;
  history: string[]; // journal lisible (borné par l'UI si besoin)
}

export type Command =
  | { type: "ROLL"; d1: number; d2: number }
  | { type: "BUY" }
  | { type: "SKIP_BUY" }
  | { type: "AUCTION_BID"; amount: number }
  | { type: "AUCTION_PASS" }
  | { type: "PAY_JAIL_FINE" }
  | { type: "USE_JAIL_CARD" }
  | { type: "BUILD"; space: number }
  | { type: "SELL_HOUSE"; space: number }
  | { type: "MORTGAGE"; space: number }
  | { type: "UNMORTGAGE"; space: number }
  | { type: "TRADE_PROPOSE"; to: number; giveMoney: number; giveProps: number[]; receiveMoney: number; receiveProps: number[] }
  | { type: "TRADE_ACCEPT" }
  | { type: "TRADE_REJECT" }
  | { type: "SETTLE_DEBT" }
  | { type: "DECLARE_BANKRUPT" }
  | { type: "END_TURN" };

export interface GameConfig {
  players: { name: string; token: string }[]; // 2 à 8, tokens uniques
}

export function isBuyable(s: GameState, spaceIdx: number): boolean {
  const p = s.props[spaceIdx]!;
  return p.owner === null && (s.phase === "resolveBuy" || s.phase === "auction");
}

export const GROUPS_LIST: ColorGroup[] = ["brun", "cyan", "magenta", "orange", "rouge", "jaune", "vert", "marine"];
