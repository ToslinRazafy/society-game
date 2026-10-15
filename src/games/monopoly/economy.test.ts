import { describe, it, expect } from "vitest";
import { applyCommand, availableActions } from "./engine";
import { SPACES } from "./board-data";
import { canBuild, canSellHouse, canMortgage } from "./properties";
import { newGame, atPos, setBalance, ownProp, ownGroup, inManage } from "./test-helpers";
import type { GameState } from "./state";

function buyPhase(spaceIdx: number): GameState {
  // arrive sur une case libre par un lancer réel (1+2) : position départ = spaceIdx - 3
  let s = atPos(newGame(2), 0, (spaceIdx - 3 + 40) % 40);
  s = applyCommand(s, { type: "ROLL", d1: 1, d2: 2 });
  expect(s.phase).toBe("resolveBuy");
  expect(s.buySpace).toBe(spaceIdx);
  return s;
}

describe("achats et enchères", () => {
  it("achat valide : argent, propriétaire, phase gestion", () => {
    const s = buyPhase(1); // case 1 : Bd de Belleville, 60
    const after = applyCommand(s, { type: "BUY" });
    expect(after.props[1]!.owner).toBe(0);
    expect(after.players[0]!.balance).toBe(1500 - 60 + 200); // +salaire car 5→1 passe par Départ
    expect(after.phase).toBe("manage");
    expect(after.buySpace).toBe(-1);
  });

  it("achat impossible faute de fonds : commande ignorée", () => {
    let s = buyPhase(39); // Rue de la Paix 400
    s = setBalance(s, 0, 100);
    expect(applyCommand(s, { type: "BUY" })).toBe(s);
    expect(availableActions(s)).toEqual(["SKIP_BUY"]);
  });

  it("refus d'achat → enchère séquentielle adjugée au déclinant", () => {
    let s = buyPhase(3); // Rue Lecourbe, départ position 0 → 3 (sans passage par Départ)
    s = applyCommand(s, { type: "SKIP_BUY" });
    expect(s.phase).toBe("auction");
    expect(s.auction!.bidder).toBe(1); // rotation : joueur suivant
    s = applyCommand(s, { type: "AUCTION_PASS" });
    s = applyCommand(s, { type: "AUCTION_BID", amount: 50 }); // le déclinant (retour sur 0)
    expect(s.auction!.highBidder).toBe(0);
    s = applyCommand(s, { type: "AUCTION_PASS" });
    expect(s.phase).toBe("manage");
    expect(s.props[3]!.owner).toBe(0);
    expect(s.players[0]!.balance).toBe(1500 - 50);
  });

  it("enchère sans aucune offre reste à la banque", () => {
    let s = buyPhase(3);
    s = applyCommand(s, { type: "SKIP_BUY" });
    s = applyCommand(s, { type: "AUCTION_PASS" });
    s = applyCommand(s, { type: "AUCTION_PASS" });
    expect(s.props[3]!.owner).toBeNull();
    expect(s.phase).toBe("manage");
  });

  it("enchère invalide : offre ≤ prix courant ou hors solde", () => {
    let s = buyPhase(3);
    s = applyCommand(s, { type: "SKIP_BUY" });
    const before = s;
    expect(applyCommand(s, { type: "AUCTION_BID", amount: 0 })).toBe(before);
    s = applyCommand(s, { type: "AUCTION_BID", amount: 5 });
    expect(applyCommand(s, { type: "AUCTION_BID", amount: 5 })).toBe(s); // doit strictement augmenter
    s = setBalance(s, s.auction!.bidder, 3);
    expect(applyCommand(s, { type: "AUCTION_BID", amount: 9999 })).toBe(s);
  });

  it("enchérisseur insolvable écarté : seul le solde borne l'offre", () => {
    let s = buyPhase(5); // Gare Montparnasse
    s = applyCommand(s, { type: "SKIP_BUY" });
    s = setBalance(s, 1, 40);
    s = applyCommand(s, { type: "AUCTION_BID", amount: 40 });
    s = applyCommand(s, { type: "AUCTION_PASS" }); // J0
    expect(s.props[5]!.owner).toBe(1);
    expect(s.players[1]!.balance).toBe(0);
  });
});

describe("loyers", () => {
  it("rue détenue : loyer de base", () => {
    let s = ownProp(newGame(2), 8, 1); // Rue de Courcelles, base 6
    s = atPos(s, 0, 5);
    s = applyCommand(s, { type: "ROLL", d1: 1, d2: 2 }); // 5→8
    expect(s.players[0]!.balance).toBe(1500 - 6);
    expect(s.players[1]!.balance).toBe(1500 + 6);
    expect(s.phase).toBe("manage");
  });

  it("monopole sans construction : loyer doublé", () => {
    let s = ownGroup(newGame(2), "cyan", 1);
    s = atPos(s, 0, 5);
    s = applyCommand(s, { type: "ROLL", d1: 1, d2: 2 }); // →8 cyan base 6 ×2
    expect(s.players[0]!.balance).toBe(1500 - 12);
  });

  it("loyer avec maisons : barème de la fiche", () => {
    let s = ownGroup(newGame(2), "cyan", 1);
    s = ownProp(s, 8, 1, 2); // 2 maisons → 90
    s = atPos(s, 0, 5);
    s = applyCommand(s, { type: "ROLL", d1: 1, d2: 2 });
    expect(s.players[0]!.balance).toBe(1500 - 90);
  });

  it("gares : 2 gares = 50", () => {
    let s = ownProp(newGame(2), 5, 1);
    s = ownProp(s, 15, 1);
    s = atPos(s, 0, 2);
    s = applyCommand(s, { type: "ROLL", d1: 1, d2: 2 }); // →5
    expect(s.players[0]!.balance).toBe(1500 - 50);
  });

  it("compagnie : 1 seule = dés ×4", () => {
    let s = ownProp(newGame(2), 12, 1);
    s = atPos(s, 0, 8);
    s = applyCommand(s, { type: "ROLL", d1: 3, d2: 1 }); // →12, total 4
    expect(s.players[0]!.balance).toBe(1500 - 16);
  });

  it("compagnies : les deux = dés ×10", () => {
    let s = ownProp(ownProp(newGame(2), 12, 1), 28, 1);
    s = atPos(s, 0, 8);
    s = applyCommand(s, { type: "ROLL", d1: 3, d2: 1 });
    expect(s.players[0]!.balance).toBe(1500 - 40);
  });

  it("propriété hypothéquée : pas de loyer", () => {
    let s = ownProp(newGame(2), 8, 1, 0, true);
    s = atPos(s, 0, 5);
    s = applyCommand(s, { type: "ROLL", d1: 1, d2: 2 });
    expect(s.players[0]!.balance).toBe(1500);
    expect(s.players[1]!.balance).toBe(1500);
  });

  it("case appartenant au joueur actif : rien à payer", () => {
    let s = ownProp(newGame(2), 8, 0);
    s = atPos(s, 0, 5);
    s = applyCommand(s, { type: "ROLL", d1: 1, d2: 2 });
    expect(s.players[0]!.balance).toBe(1500);
  });
});

describe("construction", () => {
  function buildSetup(): GameState {
    return inManage(ownGroup(newGame(2), "cyan", 0)); // 6,8,9 à J0
  }

  it("groupe incomplet : construction refusée", () => {
    const s = inManage(ownProp(newGame(2), 6, 0));
    expect(canBuild(s, 0, 6)).toBe(false);
    expect(applyCommand(s, { type: "BUILD", space: 6 })).toBe(s);
  });

  it("groupe complet : construction + paiement + stock banque", () => {
    const s = buildSetup();
    const after = applyCommand(s, { type: "BUILD", space: 6 });
    expect(after.props[6]!.houses).toBe(1);
    expect(after.players[0]!.balance).toBe(1500 - 50);
    expect(after.bankHouses).toBe(31);
  });

  it("construction équilibrée : pas de 2e maison avant la 1re ailleurs", () => {
    let s = buildSetup();
    s = applyCommand(s, { type: "BUILD", space: 6 });
    expect(canBuild(s, 0, 6)).toBe(false); // 6 a déjà 1, les autres 0
    expect(canBuild(s, 0, 8)).toBe(true);
    s = applyCommand(s, { type: "BUILD", space: 8 });
    expect(applyCommand(s, { type: "BUILD", space: 6 })).toBe(s); // 9 encore à 0 → refus
    s = applyCommand(s, { type: "BUILD", space: 9 });
    expect(applyCommand(s, { type: "BUILD", space: 6 }).props[6]!.houses).toBe(2);
  });

  it("hôtel : 5e niveau consomme un hôtel de la banque", () => {
    let s = buildSetup();
    for (let h = 0; h < 4; h++) for (const idx of [6, 8, 9]) s = applyCommand(s, { type: "BUILD", space: idx });
    s = applyCommand(s, { type: "BUILD", space: 6 }); // → hôtel
    expect(s.props[6]!.houses).toBe(5);
    expect(s.bankHotels).toBe(11);
    expect(s.bankHouses).toBe(32 - 12); // 12 maisons posées, hôtel en plus
    expect(applyCommand(s, { type: "BUILD", space: 6 })).toBe(s); // plus de niveau
  });

  it("banque sans maisons : construction refusée", () => {
    const s = { ...buildSetup(), bankHouses: 0 };
    expect(canBuild(s, 0, 6)).toBe(false);
  });

  it("rue hypothéquée du groupe : construction refusée", () => {
    let s = buildSetup();
    s = ownProp(s, 9, 0, 0, true);
    expect(canBuild(s, 0, 6)).toBe(false);
  });

  it("vente équilibrée : uniquement depuis le plus construit", () => {
    let s = buildSetup();
    for (const idx of [6, 8, 9]) s = applyCommand(s, { type: "BUILD", space: idx });
    s = applyCommand(s, { type: "BUILD", space: 6 }); // 6:2, 8:1, 9:1
    expect(canSellHouse(s, 0, 9)).toBe(false);
    expect(canSellHouse(s, 0, 6)).toBe(true);
    const after = applyCommand(s, { type: "SELL_HOUSE", space: 6 });
    expect(after.props[6]!.houses).toBe(1);
    expect(after.players[0]!.balance).toBe(s.players[0]!.balance + 25);
  });

  it("vente d'hôtel : retour banque, solde = moitié ×5", () => {
    let s = buildSetup();
    for (let h = 0; h < 5; h++) for (const idx of [6, 8, 9]) s = applyCommand(s, { type: "BUILD", space: idx });
    const hotels = s.bankHotels;
    const before = s.players[0]!.balance;
    s = applyCommand(s, { type: "SELL_HOUSE", space: 6 });
    expect(s.props[6]!.houses).toBe(0);
    expect(s.players[0]!.balance).toBe(before + 125);
    expect(s.bankHotels).toBe(hotels + 1);
  });
});

describe("hypothèques", () => {
  it("hypothèque : valeur inscrite, revente interdite si bâtiments", () => {
    let s = inManage(ownProp(newGame(2), 6, 0, 1));
    expect(canMortgage(s, 0, 6)).toBe(false);
    s = ownProp(s, 6, 0, 0);
    const after = applyCommand(s, { type: "MORTGAGE", space: 6 });
    expect(after.props[6]!.mortgaged).toBe(true);
    expect(after.players[0]!.balance).toBe(1500 + SPACES[6]!.mortgageValue!);
  });

  it("déhypothèque : valeur + 10 %", () => {
    const s = inManage(ownProp(newGame(2), 6, 0, 0, true));
    const after = applyCommand(s, { type: "UNMORTGAGE", space: 6 });
    expect(after.props[6]!.mortgaged).toBe(false);
    expect(after.players[0]!.balance).toBe(1500 - Math.floor(50 * 1.1));
  });

  it("déhypothèque sans fonds : refus", () => {
    let s = inManage(ownProp(newGame(2), 6, 0, 0, true));
    s = setBalance(s, 0, 10);
    expect(applyCommand(s, { type: "UNMORTGAGE", space: 6 })).toBe(s);
  });
});
