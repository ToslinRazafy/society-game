// Tests des effets Chance / Caisse de communauté (spec §23 — Cartes).
import { describe, it, expect } from "vitest";
import { applyCommand } from "./engine";
import { SPACES } from "./board-data";
import { newGame, atPos, setBalance, ownProp, forceChance, forceCommunity } from "./test-helpers";
import type { GameState } from "./state";

// atterrit sur la case Chance 7 (dés 1+2 depuis 4) avec la carte du dessus forcée.
function atChance(id: string, start = 4): GameState {
  let s = forceChance(newGame(2), id);
  s = atPos(s, 0, start);
  return applyCommand(s, { type: "ROLL", d1: 1, d2: 2 });
}

// atterrit sur la case Caisse 17 (dés 1+2 depuis 14).
function atCommunity(id: string): GameState {
  let s = forceCommunity(newGame(2), id);
  s = atPos(s, 0, 14);
  return applyCommand(s, { type: "ROLL", d1: 1, d2: 2 });
}

describe("Chance", () => {
  it("collecte : dividende 50 (ch-10)", () => {
    const s = atChance("ch-10");
    expect(s.players[0]!.balance).toBe(1550);
    expect(s.players[0]!.position).toBe(7);
    expect(s.phase).toBe("manage");
  });

  it("paiement : 15 aux nécessiteux (ch-14)", () => {
    expect(atChance("ch-14").players[0]!.balance).toBe(1485);
  });

  it("move-to avec loyer : avance jusqu'à un bien loué (ch-01 → 9)", () => {
    let s = atChance("ch-01"); // 7 → 9, Avenue République
    expect(s.players[0]!.position).toBe(9);
    expect(s.phase).toBe("resolveBuy"); // 9 libre
    s = applyCommand(s, { type: "SKIP_BUY" }); // → enchère
    expect(s.phase).toBe("auction");
  });

  it("move-to via Départ : salaire touché (ch-07 → 0)", () => {
    const s = atChance("ch-07");
    expect(s.players[0]!.position).toBe(0);
    expect(s.players[0]!.balance).toBe(1700);
  });

  it("move-to sans salary si cible derrière (ch-03 → 37)", () => {
    const s = atChance("ch-03");
    expect(s.players[0]!.balance).toBe(1500);
    expect(s.buySpace).toBe(37);
  });

  it("move-steps +3 : simple visite (ch-08 → 10)", () => {
    const s = atChance("ch-08");
    expect(s.players[0]!.position).toBe(10);
    expect(s.players[0]!.inJail).toBe(false);
  });

  it("move-steps −3 : taxe résolue en reculant (ch-09 → 4)", () => {
    const s = atChance("ch-09"); // 7 → 4 : Impôt sur le revenu
    expect(s.players[0]!.position).toBe(4);
    expect(s.players[0]!.balance).toBe(1500 - 200);
  });

  it("gare la plus proche : loyer doublé (ch-04)", () => {
    let s = newGame(2);
    s = ownProp(s, 15, 1);
    s = forceChance(s, "ch-04");
    s = atPos(s, 0, 4);
    s = applyCommand(s, { type: "ROLL", d1: 1, d2: 2 });
    expect(s.players[0]!.position).toBe(15);
    expect(s.players[0]!.balance).toBe(1500 - 25 * 2);
  });

  it("gare la plus proche via Départ : salaire + loyer doublé (ch-04 depuis 36)", () => {
    let s = newGame(2);
    s = ownProp(s, 5, 1);
    s = forceChance(s, "ch-04");
    s = atPos(s, 0, 33);
    s = applyCommand(s, { type: "ROLL", d1: 1, d2: 2 }); // → 36 Chance
    expect(s.players[0]!.position).toBe(5);
    expect(s.players[0]!.balance).toBe(1500 + 200 - 50);
  });

  it("compagnie la plus proche : dés ×10 (ch-06)", () => {
    let s = newGame(2);
    s = ownProp(s, 12, 1);
    s = forceChance(s, "ch-06");
    s = atPos(s, 0, 4);
    s = applyCommand(s, { type: "ROLL", d1: 1, d2: 2 }); // total 3 → 30
    expect(s.players[0]!.position).toBe(12);
    expect(s.players[0]!.balance).toBe(1500 - 30);
  });

  it("aller en Prison : position 10, pas de salaire (ch-12)", () => {
    const s = atChance("ch-12");
    expect(s.players[0]!.inJail).toBe(true);
    expect(s.players[0]!.position).toBe(10);
    expect(s.players[0]!.balance).toBe(1500);
    expect(s.phase).toBe("manage");
  });

  it("sortie de prison conservée : hors paquet (ch-11)", () => {
    const s = atChance("ch-11");
    expect(s.players[0]!.jailFreeCards).toEqual(["ch-11"]);
    expect(s.chanceDeck).not.toContain("ch-11");
    expect(s.chanceDeck.length).toBe(15);
  });

  it("réparations : 25/maison + 100/hôtel (ch-13)", () => {
    let s = newGame(2);
    s = ownProp(s, 6, 0, 3);
    s = ownProp(s, 8, 0, 5); // hôtel
    s = forceChance(s, "ch-13");
    s = atPos(s, 0, 4);
    s = applyCommand(s, { type: "ROLL", d1: 1, d2: 2 });
    expect(s.players[0]!.balance).toBe(1500 - (3 * 25 + 100));
  });

  it("enchère après vente refusée sur case atteinte par carte (ch-02 → 19)", () => {
    let s = atChance("ch-02"); // Place Pigalle libre
    expect(s.buySpace).toBe(19);
    s = applyCommand(s, { type: "BUY" });
    expect(s.props[19]!.owner).toBe(0);
    expect(s.players[0]!.balance).toBe(1500 - SPACES[19]!.price!);
  });
});

describe("Caisse de communauté", () => {
  it("collecte 200 (cc-02)", () => {
    expect(atCommunity("cc-02").players[0]!.balance).toBe(1700);
  });

  it("pay-each : 50 à chaque joueur (cc-14, 3 joueurs)", () => {
    let s = newGame(3);
    s = forceCommunity(s, "cc-14");
    s = atPos(s, 0, 14);
    s = applyCommand(s, { type: "ROLL", d1: 1, d2: 2 });
    expect(s.players[0]!.balance).toBe(1500 - 100);
    expect(s.players[1]!.balance).toBe(1550);
    expect(s.players[2]!.balance).toBe(1550);
  });

  it("collect-each : 10 de chaque joueur, plafonné au solde (cc-15)", () => {
    let s = newGame(3);
    s = setBalance(s, 1, 4); // J2 insolvable : ne paie que 4
    s = forceCommunity(s, "cc-15");
    s = atPos(s, 0, 14);
    s = applyCommand(s, { type: "ROLL", d1: 1, d2: 2 });
    expect(s.players[0]!.balance).toBe(1500 + 10 + 4);
    expect(s.players[1]!.balance).toBe(0);
    expect(s.players[2]!.balance).toBe(1490);
  });

  it("aller en Prison (cc-05)", () => {
    const s = atCommunity("cc-05");
    expect(s.players[0]!.inJail).toBe(true);
  });

  it("dette interrompue : insolvable sur une carte (cc-10)", () => {
    let s = newGame(2);
    s = setBalance(s, 0, 30);
    s = forceCommunity(s, "cc-10");
    s = atPos(s, 0, 14);
    s = applyCommand(s, { type: "ROLL", d1: 1, d2: 2 });
    expect(s.phase).toBe("awaitPayment");
    expect(s.debt).toEqual({ amount: 100, to: "bank", resume: "turn" });
    const settled = applyCommand(s, { type: "DECLARE_BANKRUPT" });
    expect(settled.players[0]!.bankrupt).toBe(true);
  });

  it("rotation du paquet : la carte tirée revient en bas", () => {
    const s = atCommunity("cc-02");
    expect(s.communityDeck.length).toBe(16);
    expect(s.communityDeck[s.communityDeck.length - 1]).toBe("cc-02");
  });
});
