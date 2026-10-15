import { describe, it, expect } from "vitest";
import {
  createGame,
  legalMoves,
  applyMove,
  countStones,
  allLegalMovesFor,
  GameState,
  zonesForConfig,
  PlayerState,
} from "./engine";
import { NodeId, nodeId } from "./board";

const N = nodeId;

const ZONES_CYCLE = ["top", "right", "bottom", "left"] as const;

function makeState(opts: {
  stones: Array<[x: number, y: number, player: number]>;
  players?: PlayerState[];
  current?: number;
  phase?: GameState["phase"];
  bonusStone?: NodeId | null;
}): GameState {
  const stones: GameState["stones"] = {};
  let id = 0;
  for (const [x, y, player] of opts.stones) stones[N(x, y)] = { id: id++, player };
  const playerCount = Math.max(...opts.stones.map(([, , p]) => p)) + 1;
  return {
    stones,
    nextStoneId: id,
    players:
      opts.players ??
      Array.from({ length: playerCount }, (_, i) => ({
        index: i,
        zone: ZONES_CYCLE[i],
        eliminated: false,
      })),
    current: opts.current ?? 0,
    phase: opts.phase ?? "select",
    bonusStone: opts.bonusStone ?? null,
    lastCapture: null,
    winner: null,
    history: [],
  };
}

describe("configuration de partie", () => {
  it("4 joueurs : 28 pierres, 4 positions libres (coins du carré central)", () => {
    const s = createGame({ playerCount: 4, firstPlayer: 0 });
    expect(Object.keys(s.stones)).toHaveLength(28);
    for (const p of [0, 1, 2, 3]) expect(countStones(s, p)).toBe(7);
    expect(s.phase).toBe("select");
    expect(s.current).toBe(0); // firstPlayer respecté
  });

  it("2 joueurs vertical vs horizontal : zones différentes, mêmes règles", () => {
    expect(zonesForConfig({ playerCount: 2, axis: "vertical", firstPlayer: 0 })).toEqual([
      "top",
      "bottom",
    ]);
    expect(zonesForConfig({ playerCount: 2, axis: "horizontal", firstPlayer: 0 })).toEqual([
      "left",
      "right",
    ]);
  });

  it("3 joueurs : 3 zones distinctes, 21 pierres", () => {
    const s = createGame({ playerCount: 3, firstPlayer: 1 });
    expect(Object.keys(s.stones)).toHaveLength(21);
    expect(s.current).toBe(1);
  });
});

describe("déplacement normal", () => {
  it("une pierre peut aller vers une position voisine libre", () => {
    const s = makeState({
      stones: [
        [3, 2, 0],
        [1, 2, 1],
      ],
      current: 0,
    });
    const moves = legalMoves(s, N(3, 2));
    expect(moves.map((m) => m.to)).toContain(N(2, 2)); // voisine libre
  });

  it("interdit de jouer une pierre adverse ou de bouger hors tour", () => {
    const s = makeState({ stones: [[3, 2, 1]], current: 0 });
    expect(legalMoves(s, N(3, 2))).toHaveLength(0); // pierre adverse
  });

  it("un voisin occupé bloque le déplacement normal", () => {
    const s = makeState({
      stones: [
        [3, 2, 0],
        [2, 2, 1],
      ],
      current: 0,
    });
    const moves = legalMoves(s, N(3, 2));
    expect(moves.map((m) => m.to)).not.toContain(N(2, 2));
  });
});

describe("élimination par saut", () => {
  it("saut par-dessus une pierre adverse vers une arrivée libre : capture", () => {
    const s = makeState({
      stones: [
        [3, 2, 0], // sauteur
        [2, 2, 1], // victime
        [5, 2, 2], // occupée ailleurs
      ],
      current: 0,
    });
    const capture = legalMoves(s, N(3, 2)).find((m) => m.type === "capture");
    expect(capture).toBeDefined();
    expect(capture!.to).toBe(N(1, 2));
    const r = applyMove(s, capture!);
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    const after = r.state;
    expect(countStones(after, 1)).toBe(0); // victime retirée
    expect(after.stones[N(1, 2)]?.player).toBe(0);
    expect(after.phase).toBe("bonus");
    expect(after.bonusStone).toBe(N(1, 2));
    expect(after.current).toBe(0); // le tour ne passe qu'après le bonus
  });

  it("pas de capture si la position d'arrivée est occupée", () => {
    const s = makeState({
      stones: [
        [3, 2, 0],
        [2, 2, 1],
        [1, 2, 2], // arrivée bloquée
      ],
      current: 0,
    });
    const captures = legalMoves(s, N(3, 2)).filter((m) => m.type === "capture");
    expect(captures.map((m) => m.captured)).not.toContain(N(2, 2));
  });

  it("pas de capture d'une pierre de sa couleur", () => {
    const s = makeState({
      stones: [
        [3, 2, 0],
        [2, 2, 0],
      ],
      current: 0,
    });
    expect(legalMoves(s, N(3, 2)).filter((m) => m.type === "capture")).toHaveLength(0);
  });

  it("pas de saut sans connexion géométrique (direction inventée)", () => {
    // (3,2) -> (2,1) : non adjacentes, donc aucune ligne de saut possible
    const s = makeState({
      stones: [
        [3, 2, 0],
        [2, 1, 1],
      ],
      current: 0,
    });
    expect(legalMoves(s, N(3, 2)).map((m) => m.to)).not.toContain(N(1, 0));
  });

  it("impossible de capturer hors de son tour (applyMove rejette)", () => {
    const s = makeState({
      stones: [
        [3, 2, 1],
        [2, 2, 0],
      ],
      current: 0,
    });
    const r = applyMove(s, { from: N(3, 2), to: N(1, 2), type: "capture", captured: N(2, 2) });
    expect(r.ok).toBe(false);
  });
});

describe("déplacement supplémentaire après capture", () => {
  const afterCapture = () => {
    const s = makeState({
      stones: [
        [3, 2, 0],
        [2, 2, 1],
        [5, 2, 1], // P1 garde une pierre : la partie continue après le saut
      ],
      current: 0,
    });
    const capture = legalMoves(s, N(3, 2)).find((m) => m.type === "capture")!;
    return (applyMove(s, capture) as { ok: true; state: GameState }).state;
  };

  it("phase bonus : seul le sauteur peut rejouer", () => {
    const s = afterCapture();
    expect(s.phase).toBe("bonus");
    // une autre pierre de 0 n'a aucun coup légal en phase bonus
    const other = makeState({
      stones: [
        [1, 2, 0], // le sauteur
        [3, 2, 0], // autre pierre
      ],
      current: 0,
      phase: "bonus",
      bonusStone: N(1, 2),
    });
    expect(legalMoves(other, N(3, 2))).toHaveLength(0);
  });

  it("en phase bonus, le sauteur peut capturer à nouveau (chaîne de sauts)", () => {
    const s = makeState({
      stones: [
        [3, 2, 0], // sauteur en phase bonus
        [2, 2, 1], // nouvelle victime
        [5, 2, 1], // P1 survit : la partie continue
      ],
      current: 0,
      phase: "bonus",
      bonusStone: N(3, 2),
    });
    const capture = legalMoves(s, N(3, 2)).find((m) => m.type === "capture");
    expect(capture).toBeDefined();
    expect(capture!.to).toBe(N(1, 2));
    const r = applyMove(s, capture!);
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(countStones(r.state, 1)).toBe(1); // victime retirée
    expect(r.state.phase).toBe("bonus"); // la chaîne continue
    expect(r.state.bonusStone).toBe(N(1, 2));
    expect(r.state.current).toBe(0); // le tour ne passe toujours pas
  });

  it("un déplacement normal en phase bonus met fin au tour", () => {
    const s = makeState({
      stones: [
        [3, 2, 0],
        [2, 2, 1],
        [5, 2, 1],
      ],
      current: 0,
      phase: "bonus",
      bonusStone: N(3, 2),
    });
    // même si une capture est possible, le joueur peut choisir un coup normal
    const normal = legalMoves(s, N(3, 2)).find((m) => m.type === "normal" && m.to === N(3, 1));
    expect(normal).toBeDefined();
    const r = applyMove(s, normal!);
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.state.current).toBe(1);
    expect(r.state.phase).toBe("select");
  });

  it("victoire immédiate si la dernière pierre adverse tombe pendant la chaîne", () => {
    const s = makeState({
      stones: [
        [3, 2, 0], // sauteur en phase bonus
        [2, 2, 1], // unique pierre adverse
      ],
      current: 0,
      phase: "bonus",
      bonusStone: N(3, 2),
    });
    const capture = legalMoves(s, N(3, 2)).find((m) => m.type === "capture")!;
    const r = applyMove(s, capture);
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.state.phase).toBe("over");
    expect(r.state.winner).toBe(0);
  });

  it("après le bonus, le tour passe au joueur suivant", () => {
    const s = afterCapture();
    const bonus = legalMoves(s, s.bonusStone!)[0];
    const r = applyMove(s, bonus);
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.state.current).toBe(1);
    expect(r.state.phase).toBe("select");
  });

  it("la case libérée par le saut reste une destination de bonus valide", () => {
    // géométriquement, la position d'arrivée est toujours voisine de la case
    // capturée : le bonus ne peut donc jamais être vide après un saut réussi
    const s = afterCapture();
    expect(s.phase).toBe("bonus");
    const bonusMoves = legalMoves(s, s.bonusStone!);
    expect(bonusMoves.map((m) => m.to)).toContain(N(2, 2));
  });
});

describe("tours, élimination et victoire", () => {
  it("le tour ignore un joueur déjà sans pierres", () => {
    const s = makeState({
      stones: [
        [3, 2, 0],
        [3, 1, 2], // joueur 1 éliminé d'office (aucune pierre)
      ],
      current: 0,
    });
    const move = legalMoves(s, N(3, 2))[0];
    const r = applyMove(s, move);
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.state.players[1].eliminated).toBe(true);
    expect(r.state.current).toBe(2); // saute le joueur 1
  });

  it("victoire quand le dernier adversaire perd sa dernière pierre", () => {
    const s = makeState({
      stones: [
        [3, 2, 0],
        [2, 2, 1], // unique pierre adverse, capturée
      ],
      current: 0,
    });
    const capture = legalMoves(s, N(3, 2)).find((m) => m.type === "capture")!;
    const r = applyMove(s, capture);
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    // après capture, plus aucun joueur vivant sauf 0 → fin immédiate
    expect(r.state.phase).toBe("over");
    expect(r.state.winner).toBe(0);
  });

  it("un joueur sans aucun coup légal est sauté", () => {
    // P0 : pierre (0,2) totalement cernée (aucun voisin libre, toutes
    // les arrivées de saut occupées) ; P1 : mobile en (3,2)
    const s = makeState({
      stones: [
        [0, 2, 0],
        [1, 2, 1],
        [0, 3, 1],
        [1, 3, 1],
        [0, 4, 1],
        [2, 4, 1],
        [3, 2, 1],
      ],
      current: 1,
      players: [
        { index: 0, zone: "top", eliminated: false },
        { index: 1, zone: "bottom", eliminated: false },
      ],
    });
    expect(allLegalMovesFor(s, 0)).toHaveLength(0);
    const move = legalMoves(s, N(3, 2)).find((m) => m.to === N(2, 2))!;
    const r = applyMove(s, move);
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.state.current).toBe(1); // P0 sauté, le tour revient à P1
  });
});
