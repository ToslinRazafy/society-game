// Helpers de test — construction d'états ciblés pour le moteur Monopoly.
import { createGame } from "./engine";
import { makeRng } from "./rng";
import { TOKENS, JAIL_INDEX, SPACES } from "./board-data";
import type { GameState } from "./state";

export function newGame(playerCount = 2, seed = 42): GameState {
  return createGame(
    { players: Array.from({ length: playerCount }, (_, i) => ({ name: `J${i + 1}`, token: TOKENS[i]!.id })) },
    makeRng(seed)
  );
}

export function atPos(s: GameState, playerIdx: number, pos: number): GameState {
  return { ...s, players: s.players.map((p, i) => (i === playerIdx ? { ...p, position: pos } : p)) };
}

export function setBalance(s: GameState, playerIdx: number, amount: number): GameState {
  return { ...s, players: s.players.map((p, i) => (i === playerIdx ? { ...p, balance: amount } : p)) };
}

export function ownProp(s: GameState, spaceIdx: number, owner: number, houses = 0, mortgaged = false): GameState {
  return { ...s, props: s.props.map((p, i) => (i === spaceIdx ? { owner, houses, mortgaged } : p)) };
}

export function ownGroup(s: GameState, group: string, owner: number): GameState {
  return { ...s, props: s.props.map((p, i) => (SPACES[i]!.group === group ? { ...p, owner } : p)) };
}

export function inManage(s: GameState): GameState {
  return { ...s, phase: "manage" };
}

export function jailed(s: GameState, playerIdx = s.current): GameState {
  return {
    ...s,
    players: s.players.map((p, i) => (i === playerIdx ? { ...p, inJail: true, position: JAIL_INDEX, jailAttempts: 0 } : p)),
  };
}

export function forceChance(s: GameState, topId: string): GameState {
  return { ...s, chanceDeck: [topId, ...s.chanceDeck.filter((id) => id !== topId)] };
}

export function forceCommunity(s: GameState, topId: string): GameState {
  return { ...s, communityDeck: [topId, ...s.communityDeck.filter((id) => id !== topId)] };
}
