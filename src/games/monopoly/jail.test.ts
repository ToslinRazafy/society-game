// Tests de la prison (spec §23 — Prison).
import { describe, it, expect } from "vitest";
import { applyCommand, availableActions } from "./engine";
import { newGame, jailed, setBalance } from "./test-helpers";
import type { GameState } from "./state";

describe("prison", () => {
  it("lancer raté (essai 1) : reste en prison, phase gestion", () => {
    const s = applyCommand(jailed(newGame(2)), { type: "ROLL", d1: 1, d2: 2 });
    expect(s.players[0]!.inJail).toBe(true);
    expect(s.players[0]!.jailAttempts).toBe(1);
    expect(s.players[0]!.position).toBe(10);
    expect(s.phase).toBe("manage");
  });

  it("double en prison : sortie, déplacement, PAS de relance", () => {
    let s = applyCommand(jailed(newGame(2)), { type: "ROLL", d1: 5, d2: 5 });
    expect(s.players[0]!.inJail).toBe(false);
    expect(s.players[0]!.position).toBe(20); // 10 + 10 → Parc gratuit
    expect(s.extraRollPending).toBe(false);
    s = applyCommand(s, { type: "END_TURN" });
    expect(s.current).toBe(1); // tour passé au joueur suivant
  });

  it("troisième échec : amende forcée puis déplacement", () => {
    const base = jailed(newGame(2));
    const start: GameState = { ...base, players: base.players.map((p, i) => (i === 0 ? { ...p, jailAttempts: 2 } : p)) };
    const s = applyCommand(start, { type: "ROLL", d1: 1, d2: 2 });
    expect(s.players[0]!.inJail).toBe(false);
    expect(s.players[0]!.balance).toBe(1450);
    expect(s.players[0]!.position).toBe(13); // 10 + 3
  });

  it("troisième échec sans fonds : dette avec reprise « jail »", () => {
    let base = jailed(newGame(2));
    base = { ...base, players: base.players.map((p, i) => (i === 0 ? { ...p, jailAttempts: 2, balance: 30 } : p)) };
    const s = applyCommand(base, { type: "ROLL", d1: 1, d2: 2 });
    expect(s.phase).toBe("awaitPayment");
    expect(s.debt).toEqual({ amount: 50, to: "bank", resume: "jail" });
    // le joueur vend/se renchérit puis règle : sortie + déplacement aux dés déjà lancés
    const fixed = setBalance(s, 0, 60);
    const settled = applyCommand(fixed, { type: "SETTLE_DEBT" });
    expect(settled.players[0]!.inJail).toBe(false);
    expect(settled.players[0]!.balance).toBe(10);
    expect(settled.players[0]!.position).toBe(13);
  });

  it("payer l'amende : sortie puis lancer normal", () => {
    let s = applyCommand(jailed(newGame(2)), { type: "PAY_JAIL_FINE" });
    expect(s.players[0]!.inJail).toBe(false);
    expect(s.players[0]!.balance).toBe(1450);
    expect(s.phase).toBe("roll");
    s = applyCommand(s, { type: "ROLL", d1: 5, d2: 6 });
    expect(s.players[0]!.position).toBe(21);
  });

  it("payer l'amende sans fonds : dette reprise en prison", () => {
    const s = applyCommand(setBalance(jailed(newGame(2)), 0, 20), { type: "PAY_JAIL_FINE" });
    expect(s.phase).toBe("awaitPayment");
    expect(s.debt).toEqual({ amount: 50, to: "bank", resume: "jail" });
  });

  it("carte sortie de prison : utilisée, remise en bas du paquet", () => {
    let s = jailed(newGame(2));
    s = { ...s, players: s.players.map((p, i) => (i === 0 ? { ...p, jailFreeCards: ["ch-11"] } : p)), chanceDeck: ["ch-10"] };
    s = applyCommand(s, { type: "USE_JAIL_CARD" });
    expect(s.players[0]!.inJail).toBe(false);
    expect(s.players[0]!.jailFreeCards).toEqual([]);
    expect(s.chanceDeck).toEqual(["ch-10", "ch-11"]);
    expect(s.phase).toBe("roll");
  });

  it("carte de communauté retournée au bon paquet (cc-04)", () => {
    let s = jailed(newGame(2));
    s = { ...s, players: s.players.map((p, i) => (i === 0 ? { ...p, jailFreeCards: ["cc-04"] } : p)) };
    const before = s.communityDeck.length;
    s = applyCommand(s, { type: "USE_JAIL_CARD" });
    expect(s.communityDeck.length).toBe(before + 1);
    expect(s.communityDeck[s.communityDeck.length - 1]).toBe("cc-04");
  });

  it("actions proposées en prison selon fonds et cartes", () => {
    let s = jailed(newGame(2));
    expect(availableActions(s)).toEqual(["ROLL", "PAY_JAIL_FINE"]);
    s = { ...s, players: s.players.map((p, i) => (i === 0 ? { ...p, balance: 10 } : p)) };
    expect(availableActions(s)).toEqual(["ROLL"]); // trop pauvre pour l'amende
    s = { ...s, players: s.players.map((p, i) => (i === 0 ? { ...p, jailFreeCards: ["ch-11"] } : p)) };
    expect(availableActions(s)).toEqual(["ROLL", "USE_JAIL_CARD"]);
  });

  it("USE_JAIL_CARD hors prison : ignorée (même référence)", () => {
    const s = newGame(2);
    expect(applyCommand(s, { type: "USE_JAIL_CARD" })).toBe(s);
  });

  it("case « Allez en Prison » : déplacement immédiat, amende non due", () => {
    let s = newGame(2);
    s = { ...s, players: s.players.map((p, i) => (i === 0 ? { ...p, position: 27 } : p)) };
    s = applyCommand(s, { type: "ROLL", d1: 1, d2: 2 }); // 27+3 = 30
    expect(s.players[0]!.position).toBe(10);
    expect(s.players[0]!.inJail).toBe(true);
    expect(s.players[0]!.balance).toBe(1500);
    expect(s.phase).toBe("manage");
  });
});
