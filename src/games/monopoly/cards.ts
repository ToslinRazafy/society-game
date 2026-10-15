// Paquets Chance et Caisse de communauté — 16 cartes chacun.
// Adaptation française documentée du paquet classique (effets identiques, rues de Paris).
import type { GameCard } from "./types";

export const CHANCE_CARDS: GameCard[] = [
  { id: "ch-01", text: "Avancez jusqu'à l'Avenue de la République.", effect: { kind: "move-to", space: 9, collectGo: true } },
  { id: "ch-02", text: "Avancez jusqu'à la Place Pigalle.", effect: { kind: "move-to", space: 19, collectGo: true } },
  { id: "ch-03", text: "Avancez jusqu'aux Champs-Élysées.", effect: { kind: "move-to", space: 37, collectGo: true } },
  { id: "ch-04", text: "Rendez-vous à la gare la plus proche. Si elle appartient à un autre joueur, payez le DOUBLE du loyer.", effect: { kind: "move-nearest-railroad" } },
  { id: "ch-05", text: "Rendez-vous à la gare la plus proche. Si elle appartient à un autre joueur, payez le DOUBLE du loyer.", effect: { kind: "move-nearest-railroad" } },
  { id: "ch-06", text: "Rendez-vous à la compagnie la plus proche. Payez 10 fois les dés si elle appartient à un autre joueur.", effect: { kind: "move-nearest-utility" } },
  { id: "ch-07", text: "Avancez jusqu'à la case Départ. Touchez votre salaire.", effect: { kind: "move-to", space: 0, collectGo: true } },
  { id: "ch-08", text: "Avancez de 3 cases.", effect: { kind: "move-steps", steps: 3 } },
  { id: "ch-09", text: "Revenez 3 cases en arrière.", effect: { kind: "move-steps", steps: -3 } },
  { id: "ch-10", text: "La banque vous verse un dividende de 50.", effect: { kind: "collect", amount: 50 } },
  { id: "ch-11", text: "Carte « Sortie de Prison » gratuite. Conservez-la jusqu'à son utilisation.", effect: { kind: "jail-free", keep: true } },
  { id: "ch-12", text: "Allez en Prison. Ne passez pas par Départ, ne touchez pas 200.", effect: { kind: "go-to-jail" } },
  { id: "ch-13", text: "Faites des réparations générales : payez 25 par maison et 100 par hôtel.", effect: { kind: "repairs", perHouse: 25, perHotel: 100 } },
  { id: "ch-14", text: "Payez 15 aux nécessiteux.", effect: { kind: "pay", amount: 15 } },
  { id: "ch-15", text: "Vous gagnez le deuxième prix d'un concours de beauté. Recevez 10.", effect: { kind: "collect", amount: 10 } },
  { id: "ch-16", text: "Votre emprunt de construction arrive à échéance. Recevez 150.", effect: { kind: "collect", amount: 150 } },
];

export const COMMUNITY_CARDS: GameCard[] = [
  { id: "cc-01", text: "Avancez jusqu'à la case Départ. Touchez votre salaire.", effect: { kind: "move-to", space: 0, collectGo: true } },
  { id: "cc-02", text: "Erreur de la banque en votre faveur. Recevez 200.", effect: { kind: "collect", amount: 200 } },
  { id: "cc-03", text: "Honoraires médicaux. Payez 50.", effect: { kind: "pay", amount: 50 } },
  { id: "cc-04", text: "Carte « Sortie de Prison » gratuite. Conservez-la jusqu'à son utilisation.", effect: { kind: "jail-free", keep: true } },
  { id: "cc-05", text: "Allez en Prison. Ne passez pas par Départ, ne touchez pas 200.", effect: { kind: "go-to-jail" } },
  { id: "cc-06", text: "Votre fonds de vacances arrive à échéance. Recevez 100.", effect: { kind: "collect", amount: 100 } },
  { id: "cc-07", text: "Remboursement d'impôt sur le revenu. Recevez 20.", effect: { kind: "collect", amount: 20 } },
  { id: "cc-08", text: "Votre police d'assurance arrive à échéance. Recevez 100.", effect: { kind: "collect", amount: 100 } },
  { id: "cc-09", text: "Vous héritez de 100.", effect: { kind: "collect", amount: 100 } },
  { id: "cc-10", text: "Frais d'hôpital. Payez 100.", effect: { kind: "pay", amount: 100 } },
  { id: "cc-11", text: "Frais de scolarité. Payez 50.", effect: { kind: "pay", amount: 50 } },
  { id: "cc-12", text: "Honoraires de consultation. Recevez 25.", effect: { kind: "collect", amount: 25 } },
  { id: "cc-13", text: "Taxe de voirie : payez 40 par maison et 115 par hôtel.", effect: { kind: "repairs", perHouse: 40, perHotel: 115 } },
  { id: "cc-14", text: "Vous êtes élu juge. Payez 50 à chaque joueur.", effect: { kind: "pay-each", amount: 50 } },
  { id: "cc-15", text: "C'est votre anniversaire. Recevez 10 de chaque joueur.", effect: { kind: "collect-each", amount: 10 } },
  { id: "cc-16", text: "Vous gagnez le concours de mots croisés. Recevez 100.", effect: { kind: "collect", amount: 100 } },
];

export const CHANCE_MAP: Record<string, GameCard> = Object.fromEntries(CHANCE_CARDS.map((c) => [c.id, c]));
export const COMMUNITY_MAP: Record<string, GameCard> = Object.fromEntries(COMMUNITY_CARDS.map((c) => [c.id, c]));
