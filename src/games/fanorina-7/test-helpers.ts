// Helpers partagés par les tests Fanorina 7 (moteur et bot).
// makeState construit des états arbitraires sans passer par createGame.

import { GameState, PlayerState } from "./engine";
import { NodeId, nodeId } from "./board";

const N = nodeId;

const ZONES_CYCLE = ["top", "right", "bottom", "left"] as const;

export function makeState(opts: {
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
