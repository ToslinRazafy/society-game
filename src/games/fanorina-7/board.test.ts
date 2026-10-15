import { describe, it, expect } from "vitest";
import {
  NODES,
  EDGES,
  ADJACENCY,
  START_NODES,
  isPlayable,
  nodeId,
  nodePoint,
  neighbors,
  areAdjacent,
} from "./board";

describe("graphe du plateau (ADR-0002)", () => {
  it("compte 32 positions jouables", () => {
    expect(NODES).toHaveLength(32);
    expect(isPlayable(3, 3)).toBe(false); // centre non jouable
    expect(isPlayable(0, 0)).toBe(false); // hors croix
    expect(isPlayable(2, 2)).toBe(true); // coin intérieur (libre au départ)
  });

  it("le point central n'apparaît dans aucune arête", () => {
    const center = nodeId(3, 3);
    expect(EDGES.every(([a, b]) => a !== center && b !== center)).toBe(true);
    expect(neighbors(center)).toHaveLength(0);
  });

  it("chaque nœud jouable a au moins 3 connexions", () => {
    for (const n of NODES) expect(ADJACENCY.get(n)!.length).toBeGreaterThanOrEqual(3);
  });

  it("les arêtes sont symétriques et sans doublons", () => {
    expect(new Set(EDGES.map(([a, b]) => `${a}-${b}`)).size).toBe(EDGES.length);
    for (const [a, b] of EDGES) {
      expect(neighbors(a)).toContain(b);
      expect(neighbors(b)).toContain(a);
    }
  });

  it("un bras compte 8 arêtes de grille + 4 diagonales via son centre", () => {
    // bras top : centre (3,1) relié à ses 4 coins
    const c = nodeId(3, 1);
    for (const corner of [
      [2, 0],
      [4, 0],
      [2, 2],
      [4, 2],
    ])
      expect(areAdjacent(c, nodeId(corner[0], corner[1]))).toBe(true);
    // pas de diagonale entre coins opposés sans passer par le centre :
    expect(areAdjacent(nodeId(2, 0), nodeId(4, 2))).toBe(false);
  });

  it("chaque zone de départ compte 7 positions, hors coins du carré central", () => {
    for (const zone of ["top", "right", "bottom", "left"] as const) {
      expect(START_NODES[zone]).toHaveLength(7);
      for (const n of START_NODES[zone])
        expect([nodeId(2, 2), nodeId(4, 2), nodeId(2, 4), nodeId(4, 4)]).not.toContain(n);
    }
  });

  it("les zones de départ ne se chevauchent jamais", () => {
    const all = Object.values(START_NODES).flat();
    expect(new Set(all).size).toBe(all.length);
    expect(all).toHaveLength(28);
  });

  it("nodeId/nodePoint sont inverses", () => {
    for (const n of NODES) expect(nodeId(nodePoint(n).x, nodePoint(n).y)).toBe(n);
  });
});
