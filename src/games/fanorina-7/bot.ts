// Bot Fanorina 7 — adversaire IA (ADR-0009). Client externe PUR du moteur :
// ce module ne modifie jamais GameState/GameConfig, il consomme
// allLegalMovesFor/applyMove comme les clics d'un humain. Duel 2 joueurs.

import {
  GameState,
  Move,
  allLegalMovesFor,
  applyMove,
  countStones,
  stonesOf,
} from "./engine";
import { GRID, NodeId, START_NODES, Zone, neighbors } from "./board";
import type { Rng } from "@/lib/rng";

export type BotLevel = "facile" | "moyen" | "difficile";

export const BOT_LEVELS: readonly BotLevel[] = ["facile", "moyen", "difficile"];

export interface BotOptions {
  rng?: Rng; // injectable pour tests déterministes (défaut : Math.random)
  maxDepth?: number; // difficile : plafond d'itération (défaut 6) ; moyen : profondeur exacte (défaut 2)
  nodeBudget?: number; // garde de recherche (défaut 80 000)
  timeLimitMs?: number; // limite douce, 0 = désactivé (défaut 400)
}

const WIN = 1_000_000;
const W_MATERIAL = 1000;
const W_CAPTURE_MOVES = 120;
const W_MOBILITY = 20;
const W_ADVANCE = 8;
const CAPTURE_WEIGHT = 3;
const DEFAULT_NODE_BUDGET = 80_000;
const DEFAULT_TIME_LIMIT_MS = 400;
const DEFAULT_MAX_DEPTH = 6;

const TIMEOUT = Symbol("bot-timeout");

// ── distances au foyer d'une zone (BFS multi-sources, précalcul paresseux) ──

const homeDistCache = new Map<Zone, number[]>();

function homeDistances(zone: Zone): number[] {
  const cached = homeDistCache.get(zone);
  if (cached) return cached;
  const dist = new Array<number>(GRID * GRID).fill(Number.POSITIVE_INFINITY);
  const queue: NodeId[] = [];
  for (const n of START_NODES[zone]) {
    dist[n] = 0;
    queue.push(n);
  }
  for (let head = 0; head < queue.length; head++) {
    const cur = queue[head]!;
    for (const nb of neighbors(cur)) {
      if (dist[nb] === Number.POSITIVE_INFINITY) {
        dist[nb] = dist[cur]! + 1;
        queue.push(nb);
      }
    }
  }
  homeDistCache.set(zone, dist);
  return dist;
}

// ── mobilité : allLegalMovesFor ne voit que les pierres du joueur actif ──

export function movesAsPlayer(state: GameState, player: number): Move[] {
  if (state.phase === "over") return [];
  if (state.phase === "bonus")
    return state.current === player ? allLegalMovesFor(state, player) : [];
  if (player === state.current) return allLegalMovesFor(state, player);
  return allLegalMovesFor({ ...state, current: player }, player);
}

function captureCount(moves: Move[]): number {
  let c = 0;
  for (const m of moves) if (m.type === "capture") c++;
  return c;
}

// Évaluation depuis la vue de `me` (valeur absolue, cf. search).
function evaluate(state: GameState, me: number): number {
  if (state.phase === "over") return state.winner === me ? WIN : -WIN;
  const opp = state.players.find((p) => p.index !== me)!.index;
  let s = W_MATERIAL * (countStones(state, me) - countStones(state, opp));

  const myMoves = movesAsPlayer(state, me);
  const oppMoves = movesAsPlayer(state, opp);
  s += W_MOBILITY * (myMoves.length - oppMoves.length);
  s += W_CAPTURE_MOVES * (captureCount(myMoves) - captureCount(oppMoves));

  const dEnemy = homeDistances(state.players[opp].zone);
  const dHome = homeDistances(state.players[me].zone);
  for (const n of stonesOf(state, me)) s -= W_ADVANCE * Math.min(dEnemy[n]!, 10);
  for (const n of stonesOf(state, opp)) s += W_ADVANCE * Math.min(dHome[n]!, 10);
  return s;
}

// ── clés de position (anti-garage : une répétition dans la ligne vaut nulle) ──

function positionKey(state: GameState): string {
  const parts: string[] = [];
  for (const [n, stone] of Object.entries(state.stones))
    parts.push(`${n}:${stone!.player}`);
  parts.sort();
  parts.push(`c${state.current}`, `b${state.bonusStone ?? -1}`);
  return parts.join(",");
}

interface Ctx {
  nodes: number;
  budget: number;
  deadline: number; // 0 = pas de limite
  path: Set<string>;
  ply: number;
  me: number; // le joueur pour qui on maximise
}

function orderMoves(moves: Move[]): Move[] {
  return [...moves].sort((a, b) => {
    const ca = a.type === "capture" ? 0 : 1;
    const cb = b.type === "capture" ? 0 : 1;
    return ca - cb;
  });
}

// Minimax à valeur ABSOLUE (toujours du point de vue de ctx.me). Un negamax
// classique supposerait une alternance stricte des traits, ce que le moteur
// ne garantit pas : en phase bonus et en fin de partie, `current` ne change
// pas. Donc on maximise/minimise selon que `state.current` est bien `me`.
function search(state: GameState, depth: number, alpha: number, beta: number, ctx: Ctx): number {
  if (state.phase === "over") return (state.winner === ctx.me ? WIN : -WIN) - ctx.ply;
  if (depth === 0) return evaluate(state, ctx.me);

  const key = positionKey(state);
  if (ctx.path.has(key)) return 0;
  ctx.path.add(key);

  const maximizing = state.current === ctx.me;
  const moves = orderMoves(allLegalMovesFor(state, state.current));
  let best = maximizing ? Number.NEGATIVE_INFINITY : Number.POSITIVE_INFINITY;
  if (moves.length === 0) {
    best = evaluate(state, ctx.me); // garde-fou, ne doit pas arriver
  } else {
    for (const m of moves) {
      // le budget compte les UNITÉS DE TRAVAIL réelles (arête = applyMove +
      // évaluation éventuelle), sinon les feuilles non comptées exploseraient
      ctx.nodes++;
      if (ctx.nodes > ctx.budget) throw TIMEOUT;
      if (ctx.deadline && (ctx.nodes & 255) === 0 && Date.now() > ctx.deadline) throw TIMEOUT;
      const r = applyMove(state, m);
      if (!r.ok) continue; // coups issus du moteur : jamais, mais pur
      ctx.ply++;
      const v = search(r.state, depth - 1, alpha, beta, ctx);
      ctx.ply--;
      if (maximizing ? v > best : v < best) best = v;
      if (maximizing) {
        if (best > alpha) alpha = best;
        if (alpha >= beta) break;
      } else {
        if (best < beta) beta = best;
        if (beta <= alpha) break;
      }
    }
  }
  ctx.path.delete(key);
  return best;
}

// Racine : fenêtre pleine par coup (pas d'élagage entre coups racine),
// départage aléatoire parmi les ex aequo. Le Ctx (nœuds consommés, deadline)
// est PARTAGÉ sur tous les coups racine : le budget borne l'appel chooseMove
// entier, pas chaque sous-arbre. Sur TIMEOUT en cours de route, le meilleur
// coup déjà prouvé est RENVOYÉ (coups triés captures d'abord) ; null sinon.
function searchRoot(
  state: GameState,
  rootMoves: Move[],
  depth: number,
  ctx: Ctx,
  rng: Rng,
): Move | null {
  const rootKey = positionKey(state);
  let bestScore = Number.NEGATIVE_INFINITY;
  let best: Move[] = [];
  try {
    for (const m of orderMoves(rootMoves)) {
      const r = applyMove(state, m);
      if (!r.ok) continue;
      ctx.path = new Set([rootKey]);
      ctx.ply = 1;
      const v = search(r.state, depth - 1, Number.NEGATIVE_INFINITY, Number.POSITIVE_INFINITY, ctx);
      if (v > bestScore) {
        bestScore = v;
        best = [m];
      } else if (v === bestScore) {
        best.push(m);
      }
    }
  } catch (e) {
    if (e !== TIMEOUT) throw e;
  }
  if (best.length === 0) return null; // budget épuisé avant le premier coup fini
  return best[Math.floor(rng() * best.length)]!;
}

function weightedPick(moves: Move[], rng: Rng): Move {
  let total = 0;
  for (const m of moves) total += m.type === "capture" ? CAPTURE_WEIGHT : 1;
  let r = rng() * total;
  for (const m of moves) {
    r -= m.type === "capture" ? CAPTURE_WEIGHT : 1;
    if (r < 0) return m;
  }
  return moves[moves.length - 1]!;
}

/**
 * Coup du bot pour le joueur actif de `state` (l'appelant doit garantir
 * `state.current === indexDuBot` et `state.phase !== "over"`).
 * Retourne null si aucun coup (défensif).
 */
export function chooseMove(state: GameState, level: BotLevel, opts: BotOptions = {}): Move | null {
  if (state.phase === "over") return null;
  const moves = allLegalMovesFor(state, state.current);
  if (moves.length === 0) return null;
  if (moves.length === 1) return moves[0]!;

  const rng = opts.rng ?? Math.random;
  const budget = opts.nodeBudget ?? DEFAULT_NODE_BUDGET;
  const limit = opts.timeLimitMs ?? DEFAULT_TIME_LIMIT_MS;
  const deadline = limit > 0 && level !== "facile" ? Date.now() + limit : 0;

  if (level === "facile") return weightedPick(moves, rng);

  const ctx: Ctx = { nodes: 0, budget, deadline, path: new Set(), ply: 0, me: state.current };

  if (level === "moyen") {
    return searchRoot(state, moves, opts.maxDepth ?? 2, ctx, rng) ?? weightedPick(moves, rng);
  }

  // difficile : itération en profondeur, meilleur coup de la dernière passe finie
  const maxDepth = opts.maxDepth ?? DEFAULT_MAX_DEPTH;
  let chosen: Move | null = null;
  let pool = moves;
  for (let d = 1; d <= maxDepth; d++) {
    const candidate = chosen ? [chosen, ...pool.filter((m) => m !== chosen)] : pool;
    const partial = searchRoot(state, candidate, d, ctx, rng);
    if (!partial) break; // budget épuisé avant la fin de cette passe
    chosen = partial;
    pool = candidate;
  }
  return chosen ?? weightedPick(moves, rng);
}

/** Validation du paramètre d'URL `diff`, fallback « moyen ». */
export function botLevelFromParam(raw: string | null | undefined): BotLevel {
  return raw === "facile" || raw === "moyen" || raw === "difficile" ? raw : "moyen";
}
