// Moteur Fanorina 7 — logique pure, sans DOM ni React (ADR-0002).
// Toutes les règles (déplacement, saut-élimination, déplacement
// supplémentaire, tours, victoire) sont centralisées ici.

import {
  NodeId,
  Zone,
  START_NODES,
  neighbors,
  nodePoint,
  nodeId,
  isPlayable,
  areAdjacent,
} from "./board";

export interface Stone {
  id: number; // identité stable pour animer les déplacements
  player: number; // index dans GameState.players
}

export interface Move {
  from: NodeId;
  to: NodeId;
  type: "normal" | "capture";
  captured?: NodeId;
}

export interface PlayerState {
  index: number;
  zone: Zone;
  eliminated: boolean;
}

export type Phase = "select" | "bonus" | "over";

export interface HistoryEntry {
  player: number;
  move: Move;
  bonus?: Move;
  autoBonusSkipped?: boolean;
}

export interface GameState {
  stones: Partial<Record<NodeId, Stone>>;
  nextStoneId: number;
  players: PlayerState[];
  current: number; // index du joueur actif dans players
  phase: Phase;
  bonusStone: NodeId | null;
  lastCapture: NodeId | null; // pour l'UI (toast / animation)
  winner: number | null;
  history: HistoryEntry[];
}

export const PLAYER_COLORS = ["#2563eb", "#16a34a", "#dc2626", "#eab308"];
export const PLAYER_LABELS = ["Bleu", "Vert", "Rouge", "Jaune"];

export type Axis = "vertical" | "horizontal";

export interface GameConfig {
  playerCount: 2 | 3 | 4;
  axis?: Axis; // utilisé uniquement en 2 joueurs
  firstPlayer: number; // index du joueur qui commence
}

const ZONE_ORDER_4: Zone[] = ["top", "right", "bottom", "left"];

export function zonesForConfig(config: GameConfig): Zone[] {
  if (config.playerCount === 2)
    return config.axis === "horizontal" ? ["left", "right"] : ["top", "bottom"];
  if (config.playerCount === 3) return ["top", "right", "bottom"];
  return ZONE_ORDER_4;
}

export function createGame(config: GameConfig): GameState {
  const zones = zonesForConfig(config);
  const players: PlayerState[] = zones.map((zone, i) => ({
    index: i,
    zone,
    eliminated: false,
  }));
  const stones: Partial<Record<NodeId, Stone>> = {};
  let nextStoneId = 0;
  players.forEach((p) => {
    for (const n of START_NODES[p.zone]) stones[n] = { id: nextStoneId++, player: p.index };
  });
  return {
    stones,
    nextStoneId,
    players,
    current: config.firstPlayer,
    phase: "select",
    bonusStone: null,
    lastCapture: null,
    winner: null,
    history: [],
  };
}

export function stonesOf(state: GameState, player: number): NodeId[] {
  return Object.keys(state.stones)
    .map(Number)
    .filter((n) => state.stones[n]?.player === player);
}

export function countStones(state: GameState, player: number): number {
  return stonesOf(state, player).length;
}

function captureLanding(from: NodeId, over: NodeId): NodeId | null {
  const a = nodePoint(from);
  const b = nodePoint(over);
  const lx = 2 * b.x - a.x;
  const ly = 2 * b.y - a.y;
  if (!isPlayable(lx, ly)) return null;
  if (!areAdjacent(over, nodeId(lx, ly))) return null;
  return nodeId(lx, ly);
}

// Coups légaux depuis une position, en respectant la phase du tour.
// En phase bonus, seul le sauteur joue — et il peut capturer à nouveau
// pour enchaîner les sauts (ADR-0004).
export function legalMoves(state: GameState, from: NodeId): Move[] {
  if (state.phase === "over") return [];
  const stone = state.stones[from];
  if (!stone) return [];
  if (stone.player !== state.current) return [];
  if (state.phase === "bonus" && from !== state.bonusStone) return [];
  const moves: Move[] = [];
  for (const via of neighbors(from)) {
    const occupant = state.stones[via];
    if (!occupant) {
      moves.push({ from, to: via, type: "normal" });
      continue;
    }
    if (occupant.player === stone.player) continue;
    const landing = captureLanding(from, via);
    if (landing !== null && !state.stones[landing])
      moves.push({ from, to: landing, type: "capture", captured: via });
  }
  return moves;
}

export function allLegalMovesFor(state: GameState, player: number): Move[] {
  if (state.phase === "bonus")
    return state.bonusStone !== null ? legalMoves(state, state.bonusStone) : [];
  return stonesOf(state, player).flatMap((n) => legalMoves(state, n));
}

function withAdvancedTurn(state: GameState): GameState {
  const players = state.players.map((p) => ({
    ...p,
    eliminated: stonesOf(state, p.index).length === 0,
  }));
  const alive = players.filter((p) => !p.eliminated).map((p) => p.index);

  if (alive.length <= 1) {
    return {
      ...state,
      players,
      phase: "over",
      winner: alive[0] ?? null,
      bonusStone: null,
      current: state.current,
    };
  }
  // joueur suivant vivant disposant d'au moins un coup ; les joueurs sans
  // coup sont sautés automatiquement (deadlock total → victoire au plus de
  // pierres, cf. ADR-0002)
  for (let step = 1; step <= players.length; step++) {
    const candidate = (state.current + step) % players.length;
    if (!alive.includes(candidate)) continue;
    // legalMoves n'accepte que les pierres du joueur actif : on déplace la
    // référence « current » sur le candidat pour tester sa mobilité réelle
    const probePlayer: GameState = {
      ...state,
      players,
      phase: "select",
      bonusStone: null,
      current: candidate,
    };
    const hasMove = stonesOf(probePlayer, candidate).some(
      (n) => legalMoves(probePlayer, n).length > 0,
    );
    if (hasMove)
      return { ...state, players, current: candidate, phase: "select", bonusStone: null };
  }
  const best = alive.reduce((a, b) =>
    countStones(state, a) >= countStones(state, b) ? a : b,
  );
  return { ...state, players, phase: "over", winner: best, bonusStone: null };
}

export type ApplyResult = { ok: true; state: GameState } | { ok: false; error: string };

export function applyMove(state: GameState, move: Move): ApplyResult {
  const legal = legalMoves(state, move.from);
  const exact = legal.find((m) => m.to === move.to && m.type === move.type);
  if (!exact) return { ok: false, error: "Coup interdit par les règles." };

  const stones = { ...state.stones };
  const stone = stones[move.from]!;
  delete stones[move.from];
  stones[move.to] = stone;
  let lastCapture: NodeId | null = null;

  if (exact.type === "capture") {
    delete stones[exact.captured!];
    lastCapture = exact.captured!;
  }

  const moved: GameState = { ...state, stones, lastCapture };

  if (exact.type === "capture") {
    const alive = state.players.filter((p) => countStones(moved, p.index) > 0);
    if (alive.length <= 1) {
      // la partie est finie : plus de bonus après la dernière pierre adverse
      const entry: HistoryEntry = { player: state.current, move: exact };
      const next = withAdvancedTurn(moved);
      return { ok: true, state: { ...next, history: [...state.history, entry] } };
    }
    // le sauteur rejoue : si un nouveau saut est possible, la chaîne continue
    const bonus = legalMoves({ ...moved, phase: "bonus", bonusStone: move.to }, move.to);
    if (bonus.length === 0) {
      const entry: HistoryEntry = { player: state.current, move: exact, autoBonusSkipped: true };
      const next = withAdvancedTurn(moved);
      return { ok: true, state: { ...next, history: [...state.history, entry] } };
    }
    const entry: HistoryEntry = { player: state.current, move: exact };
    return {
      ok: true,
      state: { ...moved, phase: "bonus", bonusStone: move.to, history: [...state.history, entry] },
    };
  }

  const entry: HistoryEntry = { player: state.current, move: exact };
  const next = withAdvancedTurn(moved);
  return { ok: true, state: { ...next, history: [...state.history, entry] } };
}
