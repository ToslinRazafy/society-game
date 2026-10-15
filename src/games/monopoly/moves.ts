// Déroulement d'un tour : dés, prison, déplacement, résolution de case, cartes.
import { SPACES, JAIL_INDEX, SALARY, INCOME_TAX, LUXURY_TAX, JAIL_FINE, MAX_JAIL_ATTEMPTS, nextRailroad, nextUtility } from "./board-data";
import { CHANCE_MAP, COMMUNITY_MAP } from "./cards";
import { payTo, payCapped, receive, rentFor } from "./finance";
import type { GameState, PlayerState } from "./state";

function log(s: GameState, msg: string): string[] {
  return [...s.history, msg].slice(-200);
}

function setCurrent(s: GameState, patch: Partial<PlayerState>): PlayerState[] {
  return s.players.map((p, i) => (i === s.current ? { ...p, ...patch } : p));
}

// ---------- Dés / prison ----------

export function handleRoll(s: GameState, d1: number, d2: number): GameState {
  if (s.phase !== "roll" || d1 < 1 || d1 > 6 || d2 < 1 || d2 > 6) return s;
  const withDice: GameState = { ...s, dice: [d1, d2] };
  const p = s.players[s.current]!;
  if (p.inJail) return handleJailRoll(withDice, d1, d2);
  const doubles = d1 === d2;
  const streak = doubles ? s.doublesStreak + 1 : 0;
  if (streak === 3) {
    const next: GameState = { ...withDice, doublesStreak: 0, extraRollPending: false };
    return goToJail({ ...next, history: log(next, `${p.name} : troisième double → Prison`) });
  }
  const moved = advance({ ...withDice, doublesStreak: streak, extraRollPending: doubles }, d1 + d2);
  return finishResolution(moved);
}

export function finishResolution(s: GameState): GameState {
  const resolved = resolveLanding(s, 0, 1);
  return resolved.phase === "roll" ? { ...resolved, phase: "manage" } : resolved;
}

function handleJailRoll(s: GameState, d1: number, d2: number): GameState {
  const p = s.players[s.current]!;
  if (d1 === d2) {
    const freed: GameState = { ...s, players: setCurrent(s, { inJail: false, jailAttempts: 0 }), doublesStreak: 0, extraRollPending: false };
    return finishResolution(advance(freed, d1 + d2)); // sortie par double : pas de relance (règle officielle)
  }
  const attempts = p.jailAttempts + 1;
  if (attempts >= MAX_JAIL_ATTEMPTS) {
    const tried: GameState = { ...s, players: setCurrent(s, { jailAttempts: attempts }) };
    const after = payTo(tried, s.current, JAIL_FINE, "bank");
    if (after.phase === "awaitPayment") {
      return { ...after, debt: { amount: JAIL_FINE, to: "bank", resume: "jail" } };
    }
    const freed: GameState = { ...after, players: after.players.map((pl, i) => (i === s.current ? { ...pl, inJail: false, jailAttempts: 0 } : pl)) };
    return finishResolution(advance(freed, d1 + d2));
  }
  const next: GameState = { ...s, players: setCurrent(s, { jailAttempts: attempts }) };
  return { ...next, phase: "manage", extraRollPending: false, history: log(next, `${p.name} ne sort pas de prison (essai ${attempts}/${MAX_JAIL_ATTEMPTS})`) };
}

export function payJailFine(s: GameState): GameState {
  if (s.phase !== "roll" || !s.players[s.current]!.inJail) return s;
  const after = payTo(s, s.current, JAIL_FINE, "bank");
  if (after.phase === "awaitPayment") return { ...after, debt: { amount: JAIL_FINE, to: "bank", resume: "jail" } };
  return {
    ...after,
    players: after.players.map((p, i) => (i === s.current ? { ...p, inJail: false, jailAttempts: 0 } : p)),
    history: log(after, `${after.players[s.current]!.name} paie l'amende de ${JAIL_FINE} et sort de prison`),
  };
}

export function redeemJailCard(s: GameState): GameState {
  if (s.phase !== "roll") return s;
  const p = s.players[s.current]!;
  if (!p.inJail || p.jailFreeCards.length === 0) return s;
  const cardId = p.jailFreeCards[0]!;
  const deck = cardId.startsWith("ch-") ? "chanceDeck" : "communityDeck";
  return {
    ...s,
    players: s.players.map((pl, i) =>
      i === s.current ? { ...pl, inJail: false, jailAttempts: 0, jailFreeCards: pl.jailFreeCards.slice(1) } : pl
    ),
    [deck]: [...s[deck], cardId],
    history: log(s, `${p.name} utilise une carte « Sortie de Prison »`),
  } as GameState;
}

export function goToJail(s: GameState): GameState {
  const next: GameState = {
    ...s,
    players: setCurrent(s, { position: JAIL_INDEX, inJail: true, jailAttempts: 0 }),
    doublesStreak: 0,
    extraRollPending: false,
    phase: "manage",
  };
  return { ...next, history: log(next, `${s.players[s.current]!.name} va en Prison`) };
}

// ---------- Déplacement ----------

export function advance(s: GameState, steps: number): GameState {
  const pos = s.players[s.current]!.position;
  const target = (pos + steps) % 40;
  let next = { ...s, players: setCurrent(s, { position: target }) };
  if (pos + steps >= 40) {
    next = receive(next, s.current, SALARY);
    return { ...next, history: log(next, `${next.players[s.current]!.name} passe par Départ (+${SALARY})`) };
  }
  return next;
}

export function moveTo(s: GameState, target: number, collectGo: boolean): GameState {
  const pos = s.players[s.current]!.position;
  let next = { ...s, players: setCurrent(s, { position: target }) };
  if (collectGo && target !== pos && (target < pos || target === 0)) {
    next = receive(next, s.current, SALARY);
    return { ...next, history: log(next, `${next.players[s.current]!.name} passe par Départ (+${SALARY})`) };
  }
  return next;
}

export function moveBack(s: GameState, steps: number): GameState {
  const pos = s.players[s.current]!.position;
  const target = (pos - steps + 40) % 40; // jamais de salaire en reculant
  return { ...s, players: setCurrent(s, { position: target }) };
}

// ---------- Résolution ----------

export function resolveLanding(s: GameState, depth: number, rentMultiplier: number): GameState {
  if (depth > 3) return { ...s, phase: "manage" }; // garde anti-boucle documentée
  const idx = s.players[s.current]!.position;
  const space = SPACES[idx]!;
  switch (space.type) {
    case "street":
    case "railroad":
    case "utility": {
      const prop = s.props[idx]!;
      if (prop.owner === null) return { ...s, phase: "resolveBuy", buySpace: idx };
      if (prop.owner !== s.current && !prop.mortgaged) {
        const total = (s.dice?.[0] ?? 0) + (s.dice?.[1] ?? 0);
        const rent = rentFor(s, idx, total) * rentMultiplier;
        if (rent > 0) return payTo(s, s.current, rent, prop.owner);
      }
      return s;
    }
    case "tax-income":
      return payTo(s, s.current, INCOME_TAX, "bank");
    case "tax-luxury":
      return payTo(s, s.current, LUXURY_TAX, "bank");
    case "chance":
      return drawAndApply(s, "chance", depth);
    case "community":
      return drawAndApply(s, "community", depth);
    case "go-to-jail":
      return goToJail(s);
    default:
      return s; // go, jail-visiting, free-parking : rien
  }
}

function drawAndApply(s: GameState, deck: "chance" | "community", depth: number): GameState {
  const key = deck === "chance" ? "chanceDeck" : "communityDeck";
  const queue = s[key];
  if (queue.length === 0) return s;
  const id = queue[0]!;
  const rest = queue.slice(1);
  const card = (deck === "chance" ? CHANCE_MAP : COMMUNITY_MAP)[id]!;
  const afterDeck: GameState = { ...s, [key]: card.effect.kind === "jail-free" ? rest : [...rest, id] } as GameState;
  const name = afterDeck.players[afterDeck.current]!.name;
  const marked = { ...afterDeck, history: log(afterDeck, `${name} tire ${deck === "chance" ? "Chance" : "Caisse"} : ${card.text}`) };
  return applyCardEffect(marked, card.effect, depth, id);
}

function applyCardEffect(s: GameState, effect: import("./types").CardEffect, depth: number, cardId: string): GameState {
  const cur = s.current;
  switch (effect.kind) {
    case "collect":
      return receive(s, cur, effect.amount);
    case "pay":
      return payTo(s, cur, effect.amount, "bank");
    case "collect-each": {
      let next = s;
      for (let i = 0; i < s.players.length; i++) {
        if (i === cur || s.players[i]!.bankrupt) continue;
        const amt = Math.min(effect.amount, next.players[i]!.balance);
        if (amt > 0) next = payCapped(next, i, amt, cur);
      }
      return next;
    }
    case "pay-each": {
      let next = s;
      for (let i = 0; i < s.players.length; i++) {
        if (i === cur || s.players[i]!.bankrupt) continue;
        next = payTo(next, cur, effect.amount, i);
        if (next.phase === "awaitPayment") return next;
      }
      return next;
    }
    case "move-to": {
      const moved = moveTo(s, effect.space, effect.collectGo ?? false);
      return resolveLanding(moved, depth + 1, 1);
    }
    case "move-steps": {
      const moved = effect.steps >= 0 ? advance(s, effect.steps) : moveBack(s, -effect.steps);
      return resolveLanding(moved, depth + 1, 1);
    }
    case "move-nearest-railroad": {
      const target = nextRailroad(s.players[cur]!.position);
      const collectGo = target < s.players[cur]!.position; // passe éventuellement par Départ
      return resolveLanding(moveTo(s, target, collectGo), depth + 1, 2);
    }
    case "move-nearest-utility": {
      const pos = s.players[cur]!.position;
      const target = nextUtility(pos);
      const total = (s.dice?.[0] ?? 0) + (s.dice?.[1] ?? 0);
      const next = moveTo(s, target, target < pos);
      const prop = next.props[target]!;
      if (prop.owner !== null && prop.owner !== cur && !prop.mortgaged) {
        return payTo(next, cur, total * 10, prop.owner);
      }
      return next;
    }
    case "go-to-jail":
      return goToJail(s);
    case "jail-free": {
      const players = s.players.map((p, i) => (i === cur ? { ...p, jailFreeCards: [...p.jailFreeCards, cardId] } : p));
      return { ...s, players };
    }
    case "repairs": {
      let houses = 0;
      let hotels = 0;
      for (const p of s.props) {
        if (p.owner === cur) {
          if (p.houses === 5) hotels++;
          else houses += p.houses;
        }
      }
      return payTo(s, cur, effect.perHouse * houses + effect.perHotel * hotels, "bank");
    }
  }
}
