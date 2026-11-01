import { describe, it, expect } from "vitest";
import { createGame, applyMove, allLegalMovesFor, GameState, Move } from "./engine";
import { nodeId } from "./board";
import { makeState } from "./test-helpers";
import { chooseMove, botLevelFromParam, BotOptions, BotLevel } from "./bot";
import { makeRng } from "@/lib/rng";

const N = nodeId;

// Deadline douce + budget en unités de travail : chaque chooseMove reste
// ~borné en temps, sinon les parties fuzz (jusqu'au plafond de pas)
// domineraient toute la suite.
const FAST: BotOptions = { nodeBudget: 1_500, timeLimitMs: 20, maxDepth: 3 };

function isSameMove(a: Move, b: Move): boolean {
  return a.from === b.from && a.to === b.to && a.type === b.type && a.captured === b.captured;
}

/** Partie simulée : retourne l'état final ; assertit à chaque pas la légalité
 *  stricte des coups du bot (motif fuzz de monopoly/invariants.test.ts).
 *  Plafond de pas : le moteur n'a pas de règle de nulle, les niveaux bas
 *  peuvent théoriquement garenfler (documenté ADR-0009). */
function playGame(
  levelA: BotLevel,
  levelB: BotLevel,
  seed: number,
  cap = 120,
  opts: BotOptions = FAST,
): { state: GameState; steps: number; hitCap: boolean } {
  let state = createGame({
    playerCount: 2,
    axis: seed % 2 === 0 ? "vertical" : "horizontal",
    firstPlayer: seed % 2,
  });
  const rngs = [makeRng(seed * 97 + 1), makeRng(seed * 97 + 2)];
  let steps = 0;
  for (; steps < cap && state.phase !== "over"; steps++) {
    const legal = allLegalMovesFor(state, state.current);
    expect(legal.length).toBeGreaterThan(0); // invariant du moteur hors over
    const mv = chooseMove(state, state.current === 0 ? levelA : levelB, {
      ...opts,
      rng: rngs[state.current],
    });
    expect(mv).not.toBeNull();
    if (!mv) break;
    expect(legal.some((m) => isSameMove(m, mv))).toBe(true);
    const r = applyMove(state, mv);
    expect(r.ok).toBe(true);
    if (!r.ok) break;
    state = r.state;
  }
  return { state, steps, hitCap: steps >= cap };
}

describe("bot — invariants par niveau (fuzz)", () => {
  for (const [a, b] of [
    ["facile", "facile"],
    ["facile", "moyen"],
    ["moyen", "moyen"],
    ["moyen", "difficile"],
    ["difficile", "difficile"],
  ] as Array<[BotLevel, BotLevel]>) {
    it(
      `${a} vs ${b} : ne joue que des coups légaux applicables`,
      () => {
        for (let seed = 1; seed <= 4; seed++) {
          const { state } = playGame(a, b, seed);
          expect(["select", "bonus", "over"]).toContain(state.phase);
        }
      },
      90_000,
    );
  }
});

describe("bot — phase bonus", () => {
  const bonusState = () =>
    makeState({
      stones: [
        [3, 2, 0], // sauteur (bonusStone)
        [2, 2, 1], // victime potentielle
        [5, 3, 1],
        [1, 1, 0], // autre pierre du bot : ne doit PAS bouger
      ],
      players: [
        { index: 0, zone: "top", eliminated: false },
        { index: 1, zone: "bottom", eliminated: false },
      ],
      current: 0,
      phase: "bonus",
      bonusStone: N(3, 2),
    });

  for (const level of ["facile", "moyen", "difficile"] as BotLevel[]) {
    it(`${level} : seul le sauteur joue (from === bonusStone)`, () => {
      const mv = chooseMove(bonusState(), level, { ...FAST, rng: makeRng(7) });
      expect(mv).not.toBeNull();
      expect(mv!.from).toBe(N(3, 2));
    });
  }
});

describe("bot — fin de partie", () => {
  it("phase over → null, quel que soit le niveau", () => {
    const s = makeState({
      stones: [[3, 2, 0]],
      current: 0,
      phase: "over",
    });
    for (const level of ["facile", "moyen", "difficile"] as BotLevel[])
      expect(chooseMove(s, level, FAST)).toBeNull();
  });
});

describe("bot — tactique", () => {
  it("difficile et moyen trouvent la capture gagnante immédiate", () => {
    // P1 n'a qu'une pierre : la capturer finit la partie (engine.applyMove)
    const s = makeState({
      stones: [
        [3, 2, 0],
        [2, 2, 1], // unique pierre adverse
      ],
      players: [
        { index: 0, zone: "top", eliminated: false },
        { index: 1, zone: "bottom", eliminated: false },
      ],
      current: 0,
    });
    for (const level of ["moyen", "difficile"] as BotLevel[]) {
      const mv = chooseMove(s, level, { ...FAST, timeLimitMs: 0, rng: makeRng(3) });
      expect(mv!.type).toBe("capture");
      expect(mv!.captured).toBe(N(2, 2));
    }
  });

  it("facile : biais capture (statique, rng seedé)", () => {
    const s = makeState({
      stones: [
        [3, 2, 0],
        [2, 2, 1], // unique pierre adverse → capture = victoire
      ],
      players: [
        { index: 0, zone: "top", eliminated: false },
        { index: 1, zone: "bottom", eliminated: false },
      ],
      current: 0,
    });
    let captures = 0;
    for (let seed = 1; seed <= 100; seed++) {
      const mv = chooseMove(s, "facile", { rng: makeRng(seed) });
      if (mv?.type === "capture") captures++;
    }
    // 1 capture (poids 3) vs 2 coups normaux (poids 1) → espérance 60 %
    expect(captures).toBeGreaterThan(35);
  });

  it("difficile préfère une capture libre à un coup laissant sa pierre prenable", () => {
    // (3,1) est prenable par (3,0) adverse ; (2,2) et (4,2) sont capturable
    const s = makeState({
      stones: [
        [3, 2, 0],
        [2, 2, 1],
        [4, 2, 1],
        [3, 0, 1],
      ],
      players: [
        { index: 0, zone: "top", eliminated: false },
        { index: 1, zone: "bottom", eliminated: false },
      ],
      current: 0,
    });
    const mv = chooseMove(s, "difficile", { ...FAST, timeLimitMs: 0, maxDepth: 5, rng: makeRng(11) });
    expect(mv!.type).toBe("capture");
  });
});

describe("bot — déterminisme et performance", () => {
  it("même seed → même coup (20 exécutions)", () => {
    const s = createGame({ playerCount: 2, axis: "vertical", firstPlayer: 0 });
    const opts: BotOptions = { ...FAST, timeLimitMs: 0, nodeBudget: 1_200 };
    for (const level of ["facile", "moyen"] as BotLevel[]) {
      const first = chooseMove(s, level, { ...opts, rng: makeRng(42) });
      for (let i = 0; i < 20; i++) {
        const mv = chooseMove(s, level, { ...opts, rng: makeRng(42) });
        expect(mv && isSameMove(first!, mv)).toBe(true);
      }
    }
  });

  it("difficile sur ouverture : borné en temps (budget nœuds + deadline)", () => {
    const s = createGame({ playerCount: 2, axis: "vertical", firstPlayer: 0 });
    const t0 = Date.now();
    const mv = chooseMove(s, "difficile", { ...FAST, maxDepth: 6 });
    expect(mv).not.toBeNull();
    expect(Date.now() - t0).toBeLessThan(3_000);

    const t1 = Date.now();
    const bounded = chooseMove(s, "difficile", { nodeBudget: 200_000, timeLimitMs: 150 });
    expect(bounded).not.toBeNull();
    expect(Date.now() - t1).toBeLessThan(1_500); // la deadline douce coupe
  });
});

describe("botLevelFromParam", () => {
  it("valeurs valides / invalides / absentes", () => {
    expect(botLevelFromParam("facile")).toBe("facile");
    expect(botLevelFromParam("moyen")).toBe("moyen");
    expect(botLevelFromParam("difficile")).toBe("difficile");
    expect(botLevelFromParam(null)).toBe("moyen");
    expect(botLevelFromParam("nimporte-quoi")).toBe("moyen");
    expect(botLevelFromParam(undefined)).toBe("moyen");
  });
});

describe("bot — fumée de force", () => {
  it(
    "difficile bat facile sur la majorité des seeds",
    () => {
      let difficileWins = 0;
      const total = 6;
      for (let seed = 1; seed <= total; seed++) {
        const { state } = playGame("difficile", "facile", seed, 150, {
          nodeBudget: 1_500,
          timeLimitMs: 25,
          maxDepth: 3,
        });
        if (state.phase === "over" && state.winner === 0) difficileWins++;
      }
      console.log(`difficile a gagné ${difficileWins}/${total}`);
      expect(difficileWins).toBeGreaterThanOrEqual(4);
    },
    120_000,
  );
});
