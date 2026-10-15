import { describe, it, expect } from "vitest";
import { SPACES, GROUPS, GROUP_COLORS, TOKENS, spacesOfGroup, nextRailroad, nextUtility, RAILROADS, UTILITIES, START_CAPITAL } from "./board-data";

describe("board-data — structure du plateau", () => {
  it("40 cases, indices 0..39 sans trou", () => {
    expect(SPACES).toHaveLength(40);
    SPACES.forEach((s, i) => expect(s.index).toBe(i));
  });

  it("répartition officielle des types", () => {
    const count = (t: string) => SPACES.filter((s) => s.type === t).length;
    expect(count("street")).toBe(22);
    expect(count("railroad")).toBe(4);
    expect(count("utility")).toBe(2);
    expect(count("chance")).toBe(3);
    expect(count("community")).toBe(3);
    expect(count("tax-income")).toBe(1);
    expect(count("tax-luxury")).toBe(1);
    expect(count("go")).toBe(1);
    expect(count("jail-visiting")).toBe(1);
    expect(count("free-parking")).toBe(1);
    expect(count("go-to-jail")).toBe(1);
  });

  it("8 groupes de 2 ou 3 rues", () => {
    for (const g of GROUPS) {
      const size = spacesOfGroup(g).length;
      expect(size === 2 || size === 3).toBe(true);
    }
    expect(spacesOfGroup("brun")).toHaveLength(2);
    expect(spacesOfGroup("marine")).toHaveLength(2);
  });

  it("chaque groupe a une couleur", () => {
    for (const g of GROUPS) expect(GROUP_COLORS[g]).toMatch(/^#[0-9A-Fa-f]{6}$/);
  });

  it("rues : loyers croissants [base,1..4,mssn→hôtel] et mortgage < prix", () => {
    for (const s of SPACES.filter((x) => x.type === "street")) {
      expect(s.rent).toHaveLength(6);
      for (let i = 1; i < 6; i++) expect(s.rent![i]).toBeGreaterThan(s.rent![i - 1]!);
      expect(s.mortgageValue!).toBeLessThan(s.price!);
      expect(s.houseCost!).toBeGreaterThan(0);
    }
  });

  it("gares : loyers [25,50,100,200] ; positions 5,15,25,35", () => {
    expect(RAILROADS).toEqual([5, 15, 25, 35]);
    for (const i of RAILROADS) {
      expect(SPACES[i].rent).toEqual([25, 50, 100, 200]);
      expect(SPACES[i].price).toBe(200);
    }
  });

  it("compagnies : positions 12,28, prix 150", () => {
    expect(UTILITIES).toEqual([12, 28]);
    for (const i of UTILITIES) {
      expect(SPACES[i].price).toBe(150);
      expect(SPACES[i].mortgageValue).toBe(75);
    }
  });

  it("mouvements de carte : cases Chance/Caisse jamais atteignables en cible directe invalide", () => {
    // les cibles move-to des cartes sont des propriétés ou Départ (0,9,19,37)
    expect([SPACES[0].type, SPACES[9].type, SPACES[19].type, SPACES[37].type]).toEqual(["go", "street", "street", "street"]);
  });

  it("gares adjacentes aux coins (5,15,25,35)", () => {
    for (const i of [5, 15, 25, 35]) expect(i % 10).toBe(5);
  });

  it("nextRailroad depuis n'importe quelle case", () => {
    expect(nextRailroad(0)).toBe(5);
    expect(nextRailroad(4)).toBe(5);
    expect(nextRailroad(5)).toBe(15);
    expect(nextRailroad(36)).toBe(5); // boucle via GO
  });

  it("nextUtility depuis n'importe quelle case", () => {
    expect(nextUtility(0)).toBe(12);
    expect(nextUtility(13)).toBe(28);
    expect(nextUtility(29)).toBe(12); // boucle via GO
  });

  it("8 pions uniques", () => {
    expect(TOKENS).toHaveLength(8);
    expect(new Set(TOKENS.map((t) => t.id)).size).toBe(8);
  });

  it("capital de départ 1500", () => {
    expect(START_CAPITAL).toBe(1500);
  });
});
