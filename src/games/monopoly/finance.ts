// Finance : loyers, paiements atomiques, insolvabilité, faillite, patrimoine net.
import { SPACES, JAIL_FINE, HOUSES_PER_PLAYER, HOTELS_PER_PLAYER } from "./board-data";
import type { ColorGroup } from "./types";
import type { GameState } from "./state";

export function groupOwnedBy(s: GameState, playerIdx: number, group: ColorGroup): number {
  return SPACES.filter((sp) => sp.group === group && s.props[sp.index]!.owner === playerIdx).length;
}

export function ownsFullGroup(s: GameState, playerIdx: number, group: ColorGroup): boolean {
  return groupOwnedBy(s, playerIdx, group) === SPACES.filter((sp) => sp.group === group).length;
}

/** Loyer d'une case bâtie, 0 si banque ou hypothéquée. diceTotal requis pour les compagnies. */
export function rentFor(s: GameState, spaceIdx: number, diceTotal: number): number {
  const space = SPACES[spaceIdx]!;
  const prop = s.props[spaceIdx]!;
  if (prop.owner === null || prop.mortgaged) return 0;
  if (space.type === "street") {
    if (prop.houses > 0) return space.rent![prop.houses]!;
    const base = space.rent![0]!;
    return ownsFullGroup(s, prop.owner, space.group!) ? base * 2 : base;
  }
  if (space.type === "railroad") {
    const n = countRailroads(s, prop.owner);
    return space.rent![n - 1]!;
  }
  if (space.type === "utility") {
    const n = countUtilities(s, prop.owner);
    return diceTotal * (n >= 2 ? 10 : 4);
  }
  return 0;
}

export function countRailroads(s: GameState, playerIdx: number): number {
  return SPACES.filter((sp) => sp.type === "railroad" && s.props[sp.index]!.owner === playerIdx).length;
}

export function countUtilities(s: GameState, playerIdx: number): number {
  return SPACES.filter((sp) => sp.type === "utility" && s.props[sp.index]!.owner === playerIdx).length;
}

function log(s: GameState, msg: string): string[] {
  return [...s.history, msg].slice(-200); // journal borné
}

/**
 * Paiement atomique du joueur `from` vers un joueur ou la banque.
 * Solde insuffisant → dette enregistrée, phase awaitPayment (aucun demi-paiement).
 * Pour les paiements envers des joueurs NON actifs (cartes anniversaire etc.),
 * variante documentée : le payeur règle jusqu'à concurrence de son solde,
 * l'insolvabilité formelle ne concerne que le joueur actif.
 */
export function payTo(s: GameState, from: number, amount: number, to: number | "bank"): GameState {
  if (amount <= 0) return s;
  const payer = s.players[from]!;
  if (to === "bank") {
    if (payer.balance < amount) {
      return {
        ...s,
        phase: "awaitPayment",
        debt: { amount, to: "bank", resume: "turn" },
        history: log(s, `${payer.name} ne peut pas payer ${amount} → insolvabilité`),
      };
    }
    const players = s.players.map((p, i) => (i === from ? { ...p, balance: p.balance - amount } : p));
    return { ...s, players, history: log(s, `${payer.name} paye ${amount} à la banque`) };
  }
  if (to === from) return s;
  const payee = s.players[to]!;
  if (payer.balance < amount) {
    return {
      ...s,
      phase: "awaitPayment",
      debt: { amount, to, resume: "turn" },
      history: log(s, `${payer.name} doit ${amount} à ${payee.name} → insolvabilité`),
    };
  }
  const players = s.players.map((p, i) =>
    i === from ? { ...p, balance: p.balance - amount } : i === to ? { ...p, balance: p.balance + amount } : p
  );
  return { ...s, players, history: log(s, `${payer.name} paye ${amount} à ${payee.name}`) };
}

/** Paiement plafonné au solde (payeur non actif, variante documentée). */
export function payCapped(s: GameState, from: number, amount: number, to: number): GameState {
  const real = Math.min(amount, s.players[from]!.balance);
  return payTo(s, from, real, to);
}

export function receive(s: GameState, idx: number, amount: number): GameState {
  if (amount <= 0) return s;
  const players = s.players.map((p, i) => (i === idx ? { ...p, balance: p.balance + amount } : p));
  return { ...s, players, history: log(s, `${s.players[idx]!.name} reçoit ${amount}`) };
}

/** Règle de la dette de prison : reprise du tour après paiement. */
export function jailFineDebt(s: GameState): GameState {
  return {
    ...s,
    phase: "awaitPayment",
    debt: { amount: JAIL_FINE, to: "bank", resume: "jail" },
    history: log(s, `${s.players[s.current]!.name} ne peut pas payer l'amende de ${JAIL_FINE}`),
  };
}

function returnBuildingsToBank(s: GameState, indices: number[]): { s: GameState; houses: number; hotels: number } {
  let houses = 0;
  let hotels = 0;
  const props = s.props.map((p, i) => {
    if (!indices.includes(i) || p.houses === 0) return p;
    if (p.houses === 5) {
      hotels++;
      return { ...p, houses: 0 };
    }
    houses += p.houses;
    return { ...p, houses: 0 };
  });
  return {
    s: { ...s, props, bankHouses: s.bankHouses + houses, bankHotels: s.bankHotels + hotels },
    houses,
    hotels,
  };
}

/**
 * Faillite du joueur `who` (dette déjà constatée).
 * - Envers un joueur : transfert de tout l'argent et des propriétés (hypothèques conservées —
 *   variante documentée : le créancier n'immediate pas de frais de 10 %).
 * - Envers la banque : retour des actifs à la banque, argent perdu.
 */
export function applyBankruptcy(s: GameState, who: number): GameState {
  const debt = s.debt!;
  const victim = s.players[who]!;
  const owned = SPACES.filter((sp) => s.props[sp.index]!.owner === who).map((sp) => sp.index);
  let next = returnBuildingsToBank(s, owned).s;
  const cards = victim.jailFreeCards;

  if (debt.to !== "bank") {
    const to = debt.to;
    const players = next.players.map((p, i) => {
      if (i === who) return p;
      if (i === to) return { ...p, balance: p.balance + victim.balance, jailFreeCards: [...p.jailFreeCards, ...cards] };
      return p;
    });
    next = { ...next, players };
  } else if (cards.length > 0) {
    const chanceDeck = [...next.chanceDeck];
    const communityDeck = [...next.communityDeck];
    for (const id of cards) (id.startsWith("ch-") ? chanceDeck : communityDeck).push(id);
    next = { ...next, chanceDeck, communityDeck };
  }

  const props = next.props.map((p, i) =>
    debt.to === "bank"
      ? owned.includes(i)
        ? { owner: null, houses: 0, mortgaged: false }
        : p
      : owned.includes(i)
        ? { ...p, owner: debt.to }
        : p
  );
  const players = next.players.map((p, i) =>
    i === who ? { ...p, bankrupt: true, balance: 0, inJail: false, jailAttempts: 0, jailFreeCards: [], position: p.position } : p
  );
  const history = log({ ...next, props, players }, `${victim.name} est en FAILLITE`);
  const withState: GameState = { ...next, props, players, debt: null, history };
  return checkGameOver(withState);
}

export function activePlayers(s: GameState): number[] {
  return s.players.map((p, i) => (p.bankrupt ? -1 : i)).filter((i) => i >= 0);
}

export function checkGameOver(s: GameState): GameState {
  const alive = activePlayers(s);
  if (alive.length <= 1 && s.phase !== "over") {
    return {
      ...s,
      phase: "over",
      winner: alive[0] ?? null,
      extraRollPending: false,
      tradeOffer: null,
      auction: null,
      debt: null,
      history: log(s, alive[0] !== undefined ? `${s.players[alive[0]]!.name} remporte la partie` : "Partie terminée"),
    };
  }
  return s;
}

/** Patrimoine net : argent + propriétés (valeur de revente si hypothéquée). */
export function netWorth(s: GameState, idx: number): number {
  const p = s.players[idx]!;
  let total = p.bankrupt ? 0 : p.balance;
  for (const sp of SPACES) {
    const prop = s.props[sp.index]!;
    if (prop.owner !== idx) continue;
    if (prop.mortgaged) {
      total += prop.houses > 0 ? sp.houseCost! * (prop.houses === 5 ? 5 : prop.houses) * 0.5 : sp.mortgageValue!;
    } else {
      total += sp.price!;
      if (prop.houses === 5) total += sp.houseCost! * 2.5;
      else total += sp.houseCost! * prop.houses;
    }
  }
  return total;
}

export function propertiesOf(s: GameState, idx: number): number[] {
  return SPACES.filter((sp) => s.props[sp.index]!.owner === idx).map((sp) => sp.index);
}

export { HOUSES_PER_PLAYER, HOTELS_PER_PLAYER };
