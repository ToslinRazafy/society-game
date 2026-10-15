import { describe, it, expect } from "vitest";
import { createGame, applyCommand } from "./engine";
import { TOKENS } from "./board-data";
import { newGame, atPos } from "./test-helpers";
import type { GameState } from "./state";

describe("initialisation", () => {
  it("2 joueurs : soldes, positions, phase", () => {
    const s = newGame(2);
    expect(s.players).toHaveLength(2);
    expect(s.players.every((p) => p.balance === 1500)).toBe(true);
    expect(s.players.every((p) => p.position === 0)).toBe(true);
    expect(s.phase).toBe("roll");
    expect(s.current).toBe(0);
  });

  it("8 joueurs accepté", () => {
    expect(newGame(8).players).toHaveLength(8);
  });

  it("1 ou 9 joueurs refusés", () => {
    const cfg = (n: number) => ({ players: Array.from({ length: n }, (_, i) => ({ name: `J${i}`, token: TOKENS[i % 8]!.id })) });
    expect(() => createGame(cfg(1))).toThrow(RangeError);
    expect(() => createGame(cfg(9))).toThrow(RangeError);
  });

  it("pions uniques exigés", () => {
    expect(() =>
      createGame({ players: [{ name: "A", token: "chat" }, { name: "B", token: "chat" }] })
    ).toThrow(RangeError);
  });

  it("paquets complets et sans doublon", () => {
    const s = newGame(2);
    expect(s.chanceDeck).toHaveLength(16);
    expect(s.communityDeck).toHaveLength(16);
    expect(new Set(s.chanceDeck).size).toBe(16);
  });

  it("stock banque : 32 maisons, 12 hôtels", () => {
    const s = newGame(2);
    expect(s.bankHouses).toBe(32);
    expect(s.bankHotels).toBe(12);
  });
});

describe("dés et déplacements", () => {
  it("déplacement normal et arrêt sur propriété libre", () => {
    let s = newGame(2);
    s = applyCommand(s, { type: "ROLL", d1: 1, d2: 2 }); // 0→3 Rue Lecourbe
    expect(s.players[0]!.position).toBe(3);
    expect(s.phase).toBe("resolveBuy");
    expect(s.buySpace).toBe(3);
  });

  it("dés hors bornes = commande invalide, état inchangé", () => {
    const s = newGame(2);
    expect(applyCommand(s, { type: "ROLL", d1: 0, d2: 3 })).toBe(s);
    expect(applyCommand(s, { type: "ROLL", d1: 7, d2: 1 })).toBe(s);
  });

  it("passage par Départ : salaire une seule fois", () => {
    let s = newGame(2);
    s = atPos(s, 0, 36);
    s = applyCommand(s, { type: "ROLL", d1: 5, d2: 4 }); // 36→5, un tour de plateau
    expect(s.players[0]!.position).toBe(5);
    expect(s.players[0]!.balance).toBe(1700); // 1500 + 200 (une seule fois)
  });

  it("doubles : le joueur rejoue après gestion", () => {
    let s = newGame(2);
    s = applyCommand(s, { type: "ROLL", d1: 2, d2: 2 }); // →4 impôt, Manage
    expect(s.players[0]!.balance).toBe(1300); // impôt 200
    expect(s.phase).toBe("manage");
    s = applyCommand(s, { type: "END_TURN" });
    expect(s.current).toBe(0); // rejoue
    expect(s.phase).toBe("roll");
  });

  it("troisième double consécutif → prison, tour fini", () => {
    let s = newGame(2);
    s = { ...s, doublesStreak: 2, players: s.players.map((p, i) => (i === 0 ? { ...p, position: 5 } : p)) };
    s = applyCommand(s, { type: "ROLL", d1: 3, d2: 3 });
    expect(s.players[0]!.inJail).toBe(true);
    expect(s.players[0]!.position).toBe(10);
    expect(s.phase).toBe("manage");
    expect(s.extraRollPending).toBe(false);
    s = applyCommand(s, { type: "END_TURN" });
    expect(s.current).toBe(1);
  });

  it("pas de relance après sortie de prison par double", () => {
    let s = jailedThen(newGame(2));
    s = applyCommand(s, { type: "ROLL", d1: 4, d2: 4 });
    expect(s.players[0]!.inJail).toBe(false);
    expect(s.players[0]!.position).toBe(18);
    expect(s.extraRollPending).toBe(false);
  });

  it("aucune commande acceptée après fin de partie", () => {
    let s: GameState = { ...newGame(2), phase: "over", winner: 0 };
    const before = s;
    s = applyCommand(s, { type: "ROLL", d1: 1, d2: 1 });
    expect(s).toBe(before);
    s = applyCommand(s, { type: "END_TURN" });
    expect(s).toBe(before);
  });

  it("déplacement vers la prison par la case 30", () => {
    let s = newGame(2);
    s = atPos(s, 0, 25);
    s = applyCommand(s, { type: "ROLL", d1: 2, d2: 3 }); // 25→30
    expect(s.players[0]!.inJail).toBe(true);
    expect(s.players[0]!.position).toBe(10);
  });

  it("simple visite de la prison (case 10) sans emprisonnement", () => {
    let s = atPos(newGame(2), 0, 8);
    s = applyCommand(s, { type: "ROLL", d1: 1, d2: 1 }); // double → 10 simple visite
    expect(s.players[0]!.inJail).toBe(false);
    expect(s.phase).toBe("manage");
    expect(s.extraRollPending).toBe(true);
  });
});

function jailedThen(s: GameState): GameState {
  return { ...s, players: s.players.map((p, i) => (i === 0 ? { ...p, inJail: true, position: 10 } : p)) };
}
