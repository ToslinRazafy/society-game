import { describe, expect, it } from "vitest";
import { GAMES, categories, getGame } from "./registry";

describe("registre des jeux", () => {
  it("les slugs sont uniques et non vides", () => {
    const slugs = GAMES.map((g) => g.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    for (const s of slugs) expect(s).toMatch(/^[a-z0-9-]+$/);
  });

  it("chaque jeu a des métadonnées exploitables par le catalogue", () => {
    for (const g of GAMES) {
      expect(g.name.length).toBeGreaterThan(0);
      expect(g.tagline.length).toBeGreaterThan(0);
      expect(g.description.length).toBeGreaterThan(0);
      expect(g.category.length).toBeGreaterThan(0);
      expect(g.duration.length).toBeGreaterThan(0);
      expect(g.players.min).toBeGreaterThanOrEqual(1);
      expect(g.players.min).toBeLessThanOrEqual(g.players.max);
      expect(["live", "soon"]).toContain(g.status);
    }
  });

  it("les jeux jouables ont une illustration et un slug de route", () => {
    for (const g of GAMES.filter((x) => x.status === "live")) {
      expect(g.illustration).toBeTruthy();
      expect(getGame(g.slug)).toBe(g);
    }
  });

  it("au moins un jeu est disponible", () => {
    expect(GAMES.some((g) => g.status === "live")).toBe(true);
  });

  it("getGame renvoie undefined pour un slug inconnu", () => {
    expect(getGame("inconnu")).toBeUndefined();
  });

  it("categories liste chaque catégorie une fois", () => {
    const cats = categories();
    expect(new Set(cats).size).toBe(cats.length);
    expect(cats).toContain("Stratégie");
  });
});
