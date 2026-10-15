// Tests des échanges et de la faillite (spec §23 — Échanges / Faillite).
import { describe, it, expect } from "vitest";
import { applyCommand } from "./engine";
import { netWorth } from "./finance";
import { newGame, atPos, setBalance, ownProp, ownGroup, inManage } from "./test-helpers";
import type { GameState } from "./state";

function tradeCmd(to: number, giveProps: number[], receiveProps: number[], giveMoney = 0, receiveMoney = 0) {
  return { type: "TRADE_PROPOSE", to, giveProps, receiveProps, giveMoney, receiveMoney } as const;
}

describe("échanges", () => {
  it("échange simple : proprietés et argent transférés", () => {
    let s = inManage(ownProp(newGame(2), 1, 0));
    s = ownProp(s, 3, 1);
    s = applyCommand(s, tradeCmd(1, [1], [3], 20));
    expect(s.tradeOffer).not.toBeNull();
    s = applyCommand(s, { type: "TRADE_ACCEPT" });
    expect(s.props[1]!.owner).toBe(1);
    expect(s.props[3]!.owner).toBe(0);
    expect(s.players[0]!.balance).toBe(1480);
    expect(s.players[1]!.balance).toBe(1520);
    expect(s.tradeOffer).toBeNull();
  });

  it("proposition portant sur un bien d'autrui : ignorée", () => {
    const s = inManage(ownProp(newGame(2), 1, 1));
    expect(applyCommand(s, tradeCmd(1, [1], []))).toBe(s);
  });

  it("groupe avec maisons : échange refusé (règle officielle)", () => {
    let s = ownGroup(newGame(2), "cyan", 0);
    s = inManage(s);
    s = applyCommand(s, { type: "BUILD", space: 6 });
    expect(applyCommand(s, tradeCmd(1, [8], []))).toBe(s); // 8 : même groupe que 6
  });

  it("maisons hors du groupe échangé : échange possible", () => {
    let s = ownGroup(newGame(2), "cyan", 0);
    s = inManage(s);
    s = applyCommand(s, { type: "BUILD", space: 6 });
    s = ownProp(s, 12, 0);
    const after = applyCommand(s, tradeCmd(1, [12], []));
    expect(after.tradeOffer).not.toBeNull();
  });

  it("argent supérieur au solde : refusé", () => {
    const s = inManage(newGame(2));
    expect(applyCommand(s, tradeCmd(1, [], [], 2000))).toBe(s);
  });

  it("refus : l'offre est annulée, rien ne bouge", () => {
    let s = inManage(ownProp(newGame(2), 1, 0));
    s = applyCommand(s, tradeCmd(1, [1], []));
    const after = applyCommand(s, { type: "TRADE_REJECT" });
    expect(after.tradeOffer).toBeNull();
    expect(after.props[1]!.owner).toBe(0);
  });

  it("revalidation à l'acceptation : état changé → offre annulée", () => {
    let s = inManage(ownProp(newGame(2), 1, 0));
    s = applyCommand(s, tradeCmd(1, [1], []));
    s = { ...s, props: s.props.map((p, i) => (i === 1 ? { ...p, owner: 1 } : p)) }; // 1 n'appartient plus à J0
    const after = applyCommand(s, { type: "TRADE_ACCEPT" });
    expect(after.tradeOffer).toBeNull();
    expect(after.props[1]!.owner).toBe(1); // pas de transfert
  });

  it("bien hypothéqué échangeable (convention documentée)", () => {
    let s = inManage(ownProp(newGame(2), 1, 0, 0, true));
    s = applyCommand(s, tradeCmd(1, [1], []));
    expect(s.tradeOffer).not.toBeNull();
    s = applyCommand(s, { type: "TRADE_ACCEPT" });
    expect(s.props[1]!.mortgaged).toBe(true); // reste hypothéquée chez le nouveau propriétaire
  });
});

describe("faillite", () => {
  // J0 insolvable vis-à-vis de J1 (loyer case 8, base 6).
  function rentDebt(): GameState {
    let s = ownProp(newGame(2), 8, 1);
    s = setBalance(s, 0, 3);
    s = atPos(s, 0, 5);
    s = applyCommand(s, { type: "ROLL", d1: 1, d2: 2 });
    expect(s.phase).toBe("awaitPayment");
    return s;
  }

  it("declare_bankrupt hors dette : ignoré", () => {
    const s = inManage(newGame(2));
    expect(applyCommand(s, { type: "DECLARE_BANKRUPT" })).toBe(s);
  });

  it("faillite envers un joueur : cash + biens + cartes transférés", () => {
    let s = rentDebt();
    s = { ...s, players: s.players.map((p, i) => (i === 0 ? { ...p, jailFreeCards: ["ch-11"] } : p)) };
    s = ownProp(s, 12, 0, 0, true);
    const after = applyCommand(s, { type: "DECLARE_BANKRUPT" });
    expect(after.players[0]!.bankrupt).toBe(true);
    expect(after.players[0]!.balance).toBe(0);
    expect(after.props[12]!.owner).toBe(1);
    expect(after.props[12]!.mortgaged).toBe(true); // le créancier hérite de l'hypothèque
    expect(after.players[1]!.jailFreeCards).toEqual(["ch-11"]);
    expect(after.debt).toBeNull();
  });

  it("faillite envers la banque : biens neutralisés, cartes retournées aux paquets", () => {
    let s = setBalance(newGame(2), 0, 10);
    s = ownProp(s, 1, 0);
    s = { ...s, players: s.players.map((p, i) => (i === 0 ? { ...p, jailFreeCards: ["cc-04"] } : p)) };
    s = atPos(s, 0, 35);
    s = applyCommand(s, { type: "ROLL", d1: 1, d2: 2 }); // → 38 : taxe de luxe 100 > solde
    expect(s.phase).toBe("awaitPayment");
    const before = s.communityDeck.length;
    const after = applyCommand(s, { type: "DECLARE_BANKRUPT" });
    expect(after.props[1]!.owner).toBeNull();
    expect(after.players[1]!.balance).toBe(1500); // la banque ne compense pas
    expect(after.communityDeck.length).toBe(before + 1);
  });

  it("faillite : bâtiments retournés à la banque", () => {
    let s = rentDebt();
    s = inManage(ownGroup(s, "cyan", 0));
    s = applyCommand(s, { type: "BUILD", space: 6 });
    s = applyCommand(s, { type: "BUILD", space: 8 });
    s = { ...s, phase: "awaitPayment", debt: { amount: 6, to: 1, resume: "turn" } };
    const after = applyCommand(s, { type: "DECLARE_BANKRUPT" });
    expect(after.bankHouses).toBe(32); // les 2 maisons retournées au stock
    expect(after.props[6]!.houses).toBe(0);
  });

  it("dernier joueur en faillite : partie terminée, plus aucune commande", () => {
    const s = rentDebt();
    const after = applyCommand(s, { type: "DECLARE_BANKRUPT" });
    expect(after.phase).toBe("over");
    expect(after.winner).toBe(1);
    expect(applyCommand(after, { type: "ROLL", d1: 1, d2: 2 })).toBe(after);
  });

  it("trois joueurs : la partie continue après une faillite, le tour saute le failli", () => {
    let s = ownProp(newGame(3), 8, 2);
    s = setBalance(s, 0, 3);
    s = atPos(s, 0, 5);
    s = applyCommand(s, { type: "ROLL", d1: 1, d2: 2 });
    s = applyCommand(s, { type: "DECLARE_BANKRUPT" });
    expect(s.players[0]!.bankrupt).toBe(true);
    expect(s.phase).not.toBe("over");
    expect(s.current).toBe(1);
    let t = s;
    t = applyCommand(t, { type: "END_TURN" }); // J1
    t = applyCommand(t, { type: "END_TURN" }); // J2 saute J0 failli
    const roll = t.current === 2 ? t : applyCommand(t, { type: "ROLL", d1: 1, d2: 1 });
    expect(roll.players.some((p) => p.bankrupt)).toBe(true);
  });

  it("netWorth : argent + biens, moitié si hypothéqué", () => {
    let s = inManage(newGame(2));
    s = ownProp(s, 1, 0); // 60
    s = ownProp(s, 3, 0, 0, true); // valeur hypothèque 30
    s = { ...s, players: s.players.map((p, i) => (i === 0 ? { ...p, balance: 100 } : p)) };
    expect(netWorth(s, 0)).toBe(100 + 60 + 30);
    expect(netWorth(s, 1)).toBe(1500);
  });
});
