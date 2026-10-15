// Configuration des 40 cases — édition française classique (rues de Paris).
// Valeurs économiques identiques à l'édition standard (prices/rents en « francs » du jeu).
import type { ColorGroup, Space } from "./types";

export const SPACES: Space[] = [
  { index: 0, type: "go", name: "Départ", fullName: "Départ — Touchez votre salaire" },
  { index: 1, type: "street", name: "Bd de Belleville", fullName: "Boulevard de Belleville", group: "brun", price: 60, rent: [2, 10, 30, 90, 160, 250], houseCost: 50, mortgageValue: 30 },
  { index: 2, type: "community", name: "Caisse de communauté", fullName: "Caisse de communauté" },
  { index: 3, type: "street", name: "Rue Lecourbe", fullName: "Rue Lecourbe", group: "brun", price: 60, rent: [4, 20, 60, 180, 320, 450], houseCost: 50, mortgageValue: 30 },
  { index: 4, type: "tax-income", name: "Impôt sur le revenu", fullName: "Impôt sur le revenu — Payez 200" },
  { index: 5, type: "railroad", name: "Gare Montparnasse", fullName: "Gare Montparnasse", price: 200, rent: [25, 50, 100, 200], mortgageValue: 100 },
  { index: 6, type: "street", name: "Rue de Vaugirard", fullName: "Rue de Vaugirard", group: "cyan", price: 100, rent: [6, 30, 90, 270, 400, 550], houseCost: 50, mortgageValue: 50 },
  { index: 7, type: "chance", name: "Chance", fullName: "Chance" },
  { index: 8, type: "street", name: "Rue de Courcelles", fullName: "Rue de Courcelles", group: "cyan", price: 100, rent: [6, 30, 90, 270, 400, 550], houseCost: 50, mortgageValue: 50 },
  { index: 9, type: "street", name: "Av. de la République", fullName: "Avenue de la République", group: "cyan", price: 120, rent: [8, 40, 100, 300, 450, 600], houseCost: 50, mortgageValue: 60 },
  { index: 10, type: "jail-visiting", name: "Prison / Simple visite", fullName: "Prison — Simple visite" },
  { index: 11, type: "street", name: "Bd de la Villette", fullName: "Boulevard de la Villette", group: "magenta", price: 140, rent: [10, 50, 150, 450, 625, 750], houseCost: 100, mortgageValue: 70 },
  { index: 12, type: "utility", name: "Compagnie d'électricité", fullName: "Compagnie d'électricité", price: 150, mortgageValue: 75 },
  { index: 13, type: "street", name: "Av. de Neuilly", fullName: "Avenue de Neuilly", group: "magenta", price: 140, rent: [10, 50, 150, 450, 625, 750], houseCost: 100, mortgageValue: 70 },
  { index: 14, type: "street", name: "Rue de Paradis", fullName: "Rue de Paradis", group: "magenta", price: 160, rent: [12, 60, 180, 500, 700, 900], houseCost: 100, mortgageValue: 80 },
  { index: 15, type: "railroad", name: "Gare de Lyon", fullName: "Gare de Lyon", price: 200, rent: [25, 50, 100, 200], mortgageValue: 100 },
  { index: 16, type: "street", name: "Av. Mozart", fullName: "Avenue Mozart", group: "orange", price: 180, rent: [14, 70, 200, 550, 750, 950], houseCost: 100, mortgageValue: 90 },
  { index: 17, type: "community", name: "Caisse de communauté", fullName: "Caisse de communauté" },
  { index: 18, type: "street", name: "Bd Saint-Michel", fullName: "Boulevard Saint-Michel", group: "orange", price: 180, rent: [14, 70, 200, 550, 750, 950], houseCost: 100, mortgageValue: 90 },
  { index: 19, type: "street", name: "Place Pigalle", fullName: "Place Pigalle", group: "orange", price: 200, rent: [16, 80, 220, 600, 800, 1000], houseCost: 100, mortgageValue: 100 },
  { index: 20, type: "free-parking", name: "Parc gratuit", fullName: "Parc gratuit" },
  { index: 21, type: "street", name: "Av. Matignon", fullName: "Avenue Matignon", group: "rouge", price: 220, rent: [18, 90, 250, 700, 875, 1050], houseCost: 150, mortgageValue: 110 },
  { index: 22, type: "chance", name: "Chance", fullName: "Chance" },
  { index: 23, type: "street", name: "Bd Malesherbes", fullName: "Boulevard Malesherbes", group: "rouge", price: 220, rent: [18, 90, 250, 700, 875, 1050], houseCost: 150, mortgageValue: 110 },
  { index: 24, type: "street", name: "Av. Henri-Martin", fullName: "Avenue Henri-Martin", group: "rouge", price: 240, rent: [20, 100, 300, 750, 925, 1100], houseCost: 150, mortgageValue: 120 },
  { index: 25, type: "railroad", name: "Gare du Nord", fullName: "Gare du Nord", price: 200, rent: [25, 50, 100, 200], mortgageValue: 100 },
  { index: 26, type: "street", name: "Fbg Saint-Honoré", fullName: "Faubourg Saint-Honoré", group: "jaune", price: 260, rent: [22, 110, 330, 800, 975, 1150], houseCost: 150, mortgageValue: 130 },
  { index: 27, type: "street", name: "Place de la Bourse", fullName: "Place de la Bourse", group: "jaune", price: 260, rent: [22, 110, 330, 800, 975, 1150], houseCost: 150, mortgageValue: 130 },
  { index: 28, type: "utility", name: "Compagnie des Eaux", fullName: "Compagnie des Eaux", price: 150, mortgageValue: 75 },
  { index: 29, type: "street", name: "Rue La Fayette", fullName: "Rue La Fayette", group: "jaune", price: 280, rent: [24, 120, 360, 850, 1025, 1200], houseCost: 150, mortgageValue: 140 },
  { index: 30, type: "go-to-jail", name: "Allez en prison", fullName: "Allez en prison" },
  { index: 31, type: "street", name: "Av. de Breteuil", fullName: "Avenue de Breteuil", group: "vert", price: 300, rent: [26, 130, 390, 900, 1100, 1275], houseCost: 200, mortgageValue: 150 },
  { index: 32, type: "street", name: "Av. Foch", fullName: "Avenue Foch", group: "vert", price: 300, rent: [26, 130, 390, 900, 1100, 1275], houseCost: 200, mortgageValue: 150 },
  { index: 33, type: "community", name: "Caisse de communauté", fullName: "Caisse de communauté" },
  { index: 34, type: "street", name: "Bd des Capucines", fullName: "Boulevard des Capucines", group: "vert", price: 320, rent: [28, 150, 450, 1000, 1200, 1400], houseCost: 200, mortgageValue: 160 },
  { index: 35, type: "railroad", name: "Gare Saint-Lazare", fullName: "Gare Saint-Lazare", price: 200, rent: [25, 50, 100, 200], mortgageValue: 100 },
  { index: 36, type: "chance", name: "Chance", fullName: "Chance" },
  { index: 37, type: "street", name: "Champs-Élysées", fullName: "Les Champs-Élysées", group: "marine", price: 350, rent: [35, 175, 500, 1100, 1300, 1500], houseCost: 200, mortgageValue: 175 },
  { index: 38, type: "tax-luxury", name: "Taxe de luxe", fullName: "Taxe de luxe — Payez 100" },
  { index: 39, type: "street", name: "Rue de la Paix", fullName: "Rue de la Paix", group: "marine", price: 400, rent: [50, 200, 600, 1400, 1700, 2000], houseCost: 200, mortgageValue: 200 },
];

export const GROUP_COLORS: Record<ColorGroup, string> = {
  brun: "#955436",
  cyan: "#AAE0FA",
  magenta: "#D93A96",
  orange: "#F7941D",
  rouge: "#ED1B24",
  jaune: "#FEF200",
  vert: "#1FB25A",
  marine: "#0072BB",
};

export const GROUPS: ColorGroup[] = ["brun", "cyan", "magenta", "orange", "rouge", "jaune", "vert", "marine"];

export const JAIL_INDEX = 10;
export const GO_INDEX = 0;
export const SALARY = 200;
export const INCOME_TAX = 200; // simplification officielle documentée : montant fixe
export const LUXURY_TAX = 100;
export const JAIL_FINE = 50;
export const MAX_JAIL_ATTEMPTS = 3;
export const START_CAPITAL = 1500;
export const HOUSES_PER_PLAYER = 32;
export const HOTELS_PER_PLAYER = 12;
export const MAX_HOUSES_PER_STREET = 5; // 5 = hôtel

/** Pions — édition française classique. */
export const TOKENS = [
  { id: "chien", name: "Chien" },
  { id: "chat", name: "Chat" },
  { id: "sac", name: "Sac de billets" },
  { id: "chapeau", name: "Chapeau haut de forme" },
  { id: "desacoudre", name: "Dé à coudre" },
  { id: "canard", name: "Canard de bain" },
  { id: "voiture", name: "Voiture" },
  { id: "pingouin", name: "Pingouin" },
] as const;

// 8 couleurs de pions, distinctes des couleurs de groupes de rues.
export const TOKEN_COLORS = [
  "#E4002B",
  "#00A651",
  "#009CDE",
  "#F6EB61",
  "#FF8200",
  "#6C3FA0",
  "#0072BB",
  "#EC008C",
];

export type BoardSide = "bottom" | "left" | "top" | "right";

// Grille 11×11 (comme l'ancien CSS grid) : Départ index 0 en bas à droite, sens horaire.
export function gridPos(index: number): { row: number; col: number; side: BoardSide } {
  if (index <= 10) return { row: 11, col: 11 - index, side: "bottom" };
  if (index <= 20) return { row: 11 - (index - 10), col: 1, side: "left" };
  if (index <= 30) return { row: 1, col: index - 20 + 1, side: "top" };
  return { row: index - 30 + 1, col: 11, side: "right" };
}

/** Position monde (x, z) du centre d'une case — grille centrée en (0,0), 1 unité = 1 case. */
export function cellWorldPos(index: number): { x: number; z: number; side: BoardSide } {
  const { row, col, side } = gridPos(index);
  return { x: col - 6, z: row - 6, side };
}

/** Rotation Y (radians) pour que le texte d'une case se lise depuis l'extérieur du plateau. */
export const SIDE_ROT_Y: Record<BoardSide, number> = {
  bottom: 0,
  left: -Math.PI / 2,
  top: Math.PI,
  right: Math.PI / 2,
};

export function spacesOfGroup(group: ColorGroup): Space[] {
  return SPACES.filter((s) => s.group === group);
}

export function spaceAt(index: number): Space {
  return SPACES[index];
}

const RAILROADS = SPACES.filter((s) => s.type === "railroad").map((s) => s.index);
const UTILITIES = SPACES.filter((s) => s.type === "utility").map((s) => s.index);

/** Prochaine gare en avant depuis une position (indices 5,15,25,35). */
export function nextRailroad(from: number): number {
  for (let i = 1; i <= 40; i++) {
    const idx = (from + i) % 40;
    if (RAILROADS.includes(idx)) return idx;
  }
  return from; // inaccessible : les gares existent toujours
}

/** Prochaine compagnie en avant depuis une position (indices 12,28). */
export function nextUtility(from: number): number {
  for (let i = 1; i <= 40; i++) {
    const idx = (from + i) % 40;
    if (UTILITIES.includes(idx)) return idx;
  }
  return 12;
}

export { RAILROADS, UTILITIES };
