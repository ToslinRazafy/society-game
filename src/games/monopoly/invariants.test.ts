// Test de robustesse : parties simulées avec commandes aléatoires légalement distribuées.
// Aucun état ne doit violer les invariants du jeu (spec §23 — invariants).
import { describe, it, expect } from "vitest";
import { applyCommand, availableActions, createGame } from "./engine";
import { makeRng } from "./rng";
import { TOKENS } from "./board-data";
import type { Command, GameState } from "./state";

/** Vérification pure (sans expect) : renvoie la liste des violations, vide si tout est cohérent. */
function findViolations(s: GameState): string[] {
  const errs: string[] = [];
  for (let i = 0; i < s.players.length; i++) {
    const p = s.players[i]!;
    if (p.balance < 0) errs.push(`joueur ${i} solde négatif ${p.balance}`);
    if (p.position < 0 || p.position >= 40) errs.push(`joueur ${i} position hors plateau ${p.position}`);
    if (p.bankrupt && p.balance !== 0) errs.push(`joueur ${i} failli mais solde ${p.balance}`);
  }
  for (let idx = 0; idx < s.props.length; idx++) {
    const prop = s.props[idx]!;
    if (prop.houses < 0 || prop.houses > 5) errs.push(`case ${idx} maisons ${prop.houses}`);
    if (prop.owner !== null && (prop.owner < 0 || prop.owner >= s.players.length)) errs.push(`case ${idx} propriétaire invalide`);
    if (prop.houses > 0 && prop.mortgaged) errs.push(`case ${idx} construite et hypothéquée`);
  }
  if (s.bankHouses < 0 || s.bankHouses > 32) errs.push(`stock maisons banque ${s.bankHouses}`);
  if (s.bankHotels < 0 || s.bankHotels > 12) errs.push(`stock hôtels banque ${s.bankHotels}`);
  if (s.phase === "over" && s.winner !== null && s.players[s.winner]!.bankrupt) errs.push("vainqueur déjà en faillite");
  return errs;
}

function randomCommand(s: GameState, rng: () => number): Command {
  const acts = availableActions(s);
  const pick = acts[Math.floor(rng() * acts.length)]!;
  switch (pick) {
    case "ROLL":
      return { type: "ROLL", d1: 1 + Math.floor(rng() * 6), d2: 1 + Math.floor(rng() * 6) };
    case "AUCTION_BID":
      return { type: "AUCTION_BID", amount: (s.auction?.highBid ?? 0) + 1 + Math.floor(rng() * 20) };
    case "BUILD":
    case "SELL_HOUSE":
    case "MORTGAGE":
    case "UNMORTGAGE": {
      const owned = s.props.map((p, i) => (p.owner === s.current ? i : -1)).filter((i) => i >= 0);
      const space = owned.length > 0 ? owned[Math.floor(rng() * owned.length)]! : 1;
      return { type: pick, space } as Command;
    }
    case "TRADE_PROPOSE": {
      const to = (s.current + 1 + Math.floor(rng() * (s.players.length - 1))) % s.players.length;
      return { type: "TRADE_PROPOSE", to, giveProps: [], receiveProps: [], giveMoney: 0, receiveMoney: 0 };
    }
    default:
      return { type: pick } as Command;
  }
}

const PHASES = new Set(["roll", "resolveBuy", "auction", "awaitPayment", "manage", "over"]);

describe("invariants sur parties simulées", () => {
  it(
    "200 parties aléatoires : aucun invariant violé, phases valides",
    () => {
      for (let seed = 1; seed <= 200; seed++) {
        const rng = makeRng(seed * 977);
        const n = 2 + Math.floor(rng() * 7); // 2..8 joueurs
        let s = createGame(
          { players: Array.from({ length: n }, (_, i) => ({ name: `P${i}`, token: TOKENS[i]!.id })) },
          rng
        );
        for (let step = 0; step < 600; step++) {
          const next = applyCommand(s, randomCommand(s, rng));
          expect(findViolations(next), `seed ${seed} step ${step}`).toEqual([]);
          expect(PHASES.has(next.phase), `seed ${seed} step ${step} phase inconnue`).toBe(true);
          if (next.phase === "over") {
            expect(applyCommand(next, { type: "END_TURN" })).toBe(next);
            expect(applyCommand(next, { type: "ROLL", d1: 6, d2: 6 })).toBe(next);
            break;
          }
          s = next;
        }
      }
    },
    180_000
  );

  it("commandes invalides : référence conservée, zéro mutation", () => {
    const s = createGame(
      {
        players: [
          { name: "A", token: TOKENS[0]!.id },
          { name: "B", token: TOKENS[1]!.id },
        ],
      },
      makeRng(7)
    );
    const snap = JSON.stringify(s);
    expect(JSON.stringify(applyCommand(s, { type: "ROLL", d1: 0, d2: 7 }))).toBe(snap); // dés hors bornes
    expect(applyCommand(s, { type: "BUY" })).toBe(s); // phase roll, pas resolveBuy
    expect(applyCommand(s, { type: "END_TURN" })).toBe(s); // pas en manage
    expect(applyCommand(s, { type: "SETTLE_DEBT" })).toBe(s); // pas de dette
    expect(applyCommand(s, { type: "TRADE_ACCEPT" })).toBe(s); // pas d'offre
  });
});
