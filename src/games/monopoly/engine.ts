// Point d'entrée du moteur Monopoly : création de partie et application de commandes.
// Commande invalide → état rigoureusement inchangé (même référence).
import { SPACES, START_CAPITAL, TOKENS, HOUSES_PER_PLAYER, HOTELS_PER_PLAYER } from "./board-data";
import { CHANCE_CARDS, COMMUNITY_CARDS } from "./cards";
import { applyBankruptcy, checkGameOver, payTo } from "./finance";
import { handleRoll, payJailFine, redeemJailCard, advance, finishResolution, goToJail } from "./moves";
import {
  buyProperty,
  openAuction,
  auctionBid,
  auctionPass,
  build,
  sellHouse,
  mortgage,
  unmortgage,
  makeOffer,
  acceptTrade,
  rejectTrade,
} from "./properties";
import { makeRng, shuffle, type Rng } from "./rng";
import type { Command, GameConfig, GameState, PropertyState } from "./state";

export function createGame(config: GameConfig, rng: Rng = makeRng(Date.now())): GameState {
  const n = config.players.length;
  if (n < 2 || n > 8) throw new RangeError("Monopoly : 2 à 8 joueurs");
  const tokens = config.players.map((p) => p.token);
  if (new Set(tokens).size !== tokens.length) throw new RangeError("Pions dupliqués");
  if (tokens.some((t) => !TOKENS.some((x) => x.id === t))) throw new RangeError("Pion inconnu");
  if (config.players.some((p) => !p.name.trim())) throw new RangeError("Nom de joueur vide");

  const props: PropertyState[] = SPACES.map(() => ({ owner: null, houses: 0, mortgaged: false }));
  return {
    id: `mp-${rng().toString(36).slice(2, 10)}`,
    phase: "roll",
    players: config.players.map((p, i) => ({
      id: `p${i}`,
      name: p.name.trim(),
      token: p.token,
      balance: START_CAPITAL,
      position: 0,
      jailFreeCards: [],
      inJail: false,
      jailAttempts: 0,
      bankrupt: false,
    })),
    current: 0,
    dice: null,
    extraRollPending: false,
    doublesStreak: 0,
    props,
    buySpace: -1,
    chanceDeck: shuffle(CHANCE_CARDS.map((c) => c.id), rng),
    communityDeck: shuffle(COMMUNITY_CARDS.map((c) => c.id), rng),
    auction: null,
    debt: null,
    tradeOffer: null,
    bankHouses: HOUSES_PER_PLAYER,
    bankHotels: HOTELS_PER_PLAYER,
    turn: 1,
    winner: null,
    history: ["Nouvelle partie — c'est à " + config.players[0]!.name.trim()],
  };
}

function nextPlayer(s: GameState): GameState {
  let i = s.current;
  do {
    i = (i + 1) % s.players.length;
  } while (s.players[i]!.bankrupt && i !== s.current);
  return {
    ...s,
    current: i,
    turn: s.turn + 1,
    phase: "roll",
    dice: null,
    extraRollPending: false,
    doublesStreak: 0,
    tradeOffer: null,
    history: [...s.history.slice(-200), `Au tour de ${s.players[i]!.name}`],
  };
}

function settleDebt(s: GameState): GameState {
  const debt = s.debt;
  if (!debt || s.phase !== "awaitPayment") return s;
  if (s.players[s.current]!.balance < debt.amount) return s;
  const paid = payTo({ ...s, debt: null }, s.current, debt.amount, debt.to);
  if (debt.resume === "jail") {
    const diceTotal = (s.dice?.[0] ?? 0) + (s.dice?.[1] ?? 0);
    const freed: GameState = {
      ...paid,
      players: paid.players.map((p, i) => (i === s.current ? { ...p, inJail: false, jailAttempts: 0 } : p)),
    };
    return finishResolution(advance(freed, diceTotal));
  }
  return { ...paid, phase: "manage" };
}

function declareBankrupt(s: GameState): GameState {
  if (s.phase !== "awaitPayment" || !s.debt) return s;
  const after = applyBankruptcy(s, s.current);
  if (after.phase === "over") return after;
  return nextPlayer(after);
}

function endTurn(s: GameState): GameState {
  if (s.phase !== "manage") return s;
  if (s.extraRollPending && !s.players[s.current]!.inJail) {
    return { ...s, phase: "roll", dice: null, extraRollPending: false, history: [...s.history.slice(-200), `${s.players[s.current]!.name} rejoue (double)`] };
  }
  return nextPlayer(s);
}

/** Le dispatcher unique : valide la commande selon la phase, ne mute jamais l'état. */
export function applyCommand(state: GameState, cmd: Command): GameState {
  if (state.phase === "over") return state;
  switch (cmd.type) {
    case "ROLL":
      return state.phase === "roll" ? handleRoll(state, cmd.d1, cmd.d2) : state;
    case "PAY_JAIL_FINE":
      return payJailFine(state);
    case "USE_JAIL_CARD":
      return redeemJailCard(state);
    case "BUY":
      return state.phase === "resolveBuy" ? buyProperty(state, state.buySpace) : state;
    case "SKIP_BUY":
      return state.phase === "resolveBuy" ? openAuction(state, state.buySpace) : state;
    case "AUCTION_BID":
      return auctionBid(state, cmd.amount);
    case "AUCTION_PASS":
      return auctionPass(state);
    case "BUILD":
      return build(state, cmd.space);
    case "SELL_HOUSE":
      return state.phase === "manage" || state.phase === "awaitPayment" ? sellHouse(state, cmd.space) : state;
    case "MORTGAGE":
      return state.phase === "manage" || state.phase === "awaitPayment" ? mortgage(state, cmd.space) : state;
    case "UNMORTGAGE":
      return unmortgage(state, cmd.space);
    case "TRADE_PROPOSE":
      return state.phase === "manage" || state.phase === "awaitPayment"
        ? makeOffer(state, {
            from: state.current,
            to: cmd.to,
            giveMoney: cmd.giveMoney,
            giveProps: cmd.giveProps,
            receiveMoney: cmd.receiveMoney,
            receiveProps: cmd.receiveProps,
          })
        : state;
    case "TRADE_ACCEPT":
      return acceptTrade(state);
    case "TRADE_REJECT":
      return rejectTrade(state);
    case "SETTLE_DEBT":
      return settleDebt(state);
    case "DECLARE_BANKRUPT":
      return declareBankrupt(state);
    case "END_TURN":
      return endTurn(state);
    default:
      return state;
  }
}

/** Actions disponibles pour le panneau contextuel de l'UI (les cibles détaillées restent aux selectors). */
export function availableActions(s: GameState): Command["type"][] {
  switch (s.phase) {
    case "roll": {
      const p = s.players[s.current]!;
      const acts: Command["type"][] = ["ROLL"];
      if (p.inJail) {
        if (p.balance >= 50) acts.push("PAY_JAIL_FINE");
        if (p.jailFreeCards.length > 0) acts.push("USE_JAIL_CARD");
      }
      return acts;
    }
    case "resolveBuy": {
      const price = SPACES[s.buySpace]?.price ?? 0;
      const can = s.players[s.current]!.balance >= price;
      return can ? ["BUY", "SKIP_BUY"] : ["SKIP_BUY"];
    }
    case "auction":
      return ["AUCTION_BID", "AUCTION_PASS"];
    case "awaitPayment":
      return ["SELL_HOUSE", "MORTGAGE", "TRADE_PROPOSE", "SETTLE_DEBT", "DECLARE_BANKRUPT"];
    case "manage":
      return ["BUILD", "SELL_HOUSE", "MORTGAGE", "UNMORTGAGE", "TRADE_PROPOSE", "END_TURN"];
    case "over":
      return [];
  }
}

export { goToJail, checkGameOver };
export * from "./state";
