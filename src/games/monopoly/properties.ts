// Propriétés : achat, enchère séquentielle, construction/vente équilibrées,
// hypothèque/déhypothèque, échanges validés.
import { SPACES, MAX_HOUSES_PER_STREET, spacesOfGroup } from "./board-data";
import { payTo, receive, ownsFullGroup } from "./finance";
import type { GameState, AuctionState, TradeOffer } from "./state";

function log(s: GameState, msg: string): string[] {
  return [...s.history, msg].slice(-200);
}

// ---------- Achat / enchère ----------

export function buyProperty(s: GameState, spaceIdx: number): GameState {
  if (s.phase !== "resolveBuy" || spaceIdx < 0) return s;
  const space = SPACES[spaceIdx]!;
  const price = space.price!;
  if (s.props[spaceIdx]!.owner !== null) return s;
  if (s.players[s.current]!.balance < price) return s; // achat impossible faute de fonds
  const next = payTo(s, s.current, price, "bank");
  const props = next.props.map((p, i) => (i === spaceIdx ? { ...p, owner: s.current } : p));
  const msg = `${next.players[s.current]!.name} achète ${space.name} pour ${price}`;
  return { ...next, props, phase: "manage", buySpace: -1, history: log({ ...next, props }, msg) };
}

/** Enchère séquentielle : rotation à partir du joueur suivant celui qui a décliné. */
export function openAuction(s: GameState, spaceIdx: number): GameState {
  if (s.phase !== "resolveBuy") return s;
  const order: number[] = [];
  for (let k = 1; k <= s.players.length; k++) order.push((s.current + k) % s.players.length);
  const auction: AuctionState = { space: spaceIdx, highBid: 0, highBidder: null, bidder: order[0]!, alive: order };
  return {
    ...s,
    phase: "auction",
    auction,
    buySpace: spaceIdx,
    history: log(s, `${SPACES[spaceIdx]!.name} part aux enchères`),
  };
}

export function auctionBid(s: GameState, amount: number): GameState {
  if (s.phase !== "auction" || !s.auction) return s;
  const a = s.auction;
  const bidder = s.players[a.bidder]!;
  if (amount <= a.highBid || amount > bidder.balance || amount < 1) return s;
  const idx = a.alive.indexOf(a.bidder);
  const nextBidder = a.alive[(idx + 1) % a.alive.length]!;
  return { ...s, auction: { ...a, highBid: amount, highBidder: a.bidder, bidder: nextBidder }, history: log(s, `${bidder.name} enchérit à ${amount}`) };
}

export function auctionPass(s: GameState): GameState {
  if (s.phase !== "auction" || !s.auction) return s;
  const a = s.auction;
  const alive = a.alive.filter((i) => i !== a.bidder);
  if (a.highBidder !== null && alive.length <= 1) {
    return finishAuction({ ...s, auction: null }, a.highBidder, a.highBid);
  }
  if (alive.length === 0) {
    return { ...s, auction: null, phase: "manage", buySpace: -1, history: log(s, `${SPACES[a.space]!.name} reste à la banque (aucune offre)`) };
  }
  return { ...s, auction: { ...a, alive, bidder: alive[0]! } };
}

function finishAuction(s: GameState, winner: number, price: number): GameState {
  const spaceIdx = s.buySpace;
  if (spaceIdx < 0) return s;
  const next = payTo(s, winner, price, "bank"); // solde vérifié à chaque offre : jamais insolvable
  const props = next.props.map((p, i) => (i === spaceIdx ? { ...p, owner: winner } : p));
  const msg = `${next.players[winner]!.name} remporte ${SPACES[spaceIdx]!.name} aux enchères pour ${price}`;
  return { ...next, props, auction: null, phase: "manage", buySpace: -1, history: log({ ...next, props }, msg) };
}

// ---------- Construction / vente ----------

export function canBuild(s: GameState, playerIdx: number, spaceIdx: number): boolean {
  const space = SPACES[spaceIdx]!;
  const prop = s.props[spaceIdx]!;
  if (space.type !== "street" || prop.owner !== playerIdx) return false;
  if (!ownsFullGroup(s, playerIdx, space.group!)) return false;
  if (spacesOfGroup(space.group!).some((sp) => s.props[sp.index]!.mortgaged)) return false;
  if (prop.houses >= MAX_HOUSES_PER_STREET) return false;
  const toHotel = prop.houses === 4;
  if (toHotel ? s.bankHotels < 1 : s.bankHouses < 1) return false;
  if (s.players[playerIdx]!.balance < space.houseCost!) return false;
  // construction équilibrée : jamais au-dessus du minimum du groupe
  const min = Math.min(...spacesOfGroup(space.group!).map((sp) => s.props[sp.index]!.houses));
  return prop.houses === min;
}

export function build(s: GameState, spaceIdx: number): GameState {
  if (s.phase !== "manage" || !canBuild(s, s.current, spaceIdx)) return s;
  const space = SPACES[spaceIdx]!;
  const toHotel = s.props[spaceIdx]!.houses === 4;
  const props = s.props.map((p, i) => (i === spaceIdx ? { ...p, houses: p.houses + 1 } : p));
  let next: GameState = {
    ...s,
    props,
    bankHouses: s.bankHouses - (toHotel ? 0 : 1),
    bankHotels: s.bankHotels - (toHotel ? 1 : 0),
  };
  next = payTo(next, s.current, space.houseCost!, "bank");
  const msg = toHotel
    ? `${next.players[s.current]!.name} construit un hôtel sur ${space.name}`
    : `${next.players[s.current]!.name} construit une maison sur ${space.name}`;
  return { ...next, history: log(next, msg) };
}

export function canSellHouse(s: GameState, playerIdx: number, spaceIdx: number): boolean {
  const space = SPACES[spaceIdx]!;
  const prop = s.props[spaceIdx]!;
  if (space.type !== "street" || prop.owner !== playerIdx || prop.houses < 1) return false;
  const max = Math.max(...spacesOfGroup(space.group!).map((sp) => s.props[sp.index]!.houses));
  return prop.houses === max; // vente équilibrée : on commence par le plus construit
}

export function sellHouse(s: GameState, spaceIdx: number): GameState {
  if (!canSellHouse(s, s.current, spaceIdx)) return s;
  const space = SPACES[spaceIdx]!;
  const isHotel = s.props[spaceIdx]!.houses === 5;
  const gain = isHotel ? Math.floor(space.houseCost! * 2.5) : Math.floor(space.houseCost! / 2);
  // variante documentée : la revente d'un hôtel retourne l'hôtel + ses 4 maisons à la banque
  const props = s.props.map((p, i) => (i === spaceIdx ? { ...p, houses: isHotel ? 0 : p.houses - 1 } : p));
  const bankHouses = s.bankHouses + (isHotel ? 4 : 1);
  const bankHotels = s.bankHotels + (isHotel ? 1 : 0);
  const next = receive({ ...s, props, bankHouses, bankHotels }, s.current, gain);
  return { ...next, history: log(next, `${next.players[s.current]!.name} vend ${isHotel ? "un hôtel" : "une maison"} de ${space.name} (+${gain})`) };
}

// ---------- Hypothèque ----------

export function canMortgage(s: GameState, playerIdx: number, spaceIdx: number): boolean {
  const prop = s.props[spaceIdx]!;
  return prop.owner === playerIdx && prop.houses === 0 && !prop.mortgaged;
}

export function mortgage(s: GameState, spaceIdx: number): GameState {
  if (!canMortgage(s, s.current, spaceIdx)) return s;
  const props = s.props.map((p, i) => (i === spaceIdx ? { ...p, mortgaged: true } : p));
  const next = receive({ ...s, props }, s.current, SPACES[spaceIdx]!.mortgageValue!);
  return { ...next, history: log(next, `${next.players[s.current]!.name} hypothèque ${SPACES[spaceIdx]!.name}`) };
}

export function unmortgageCost(s: GameState, spaceIdx: number): number {
  return Math.floor(SPACES[spaceIdx]!.mortgageValue! * 1.1); // intérêt 10 % — convention documentée
}

export function canUnmortgage(s: GameState, playerIdx: number, spaceIdx: number): boolean {
  const prop = s.props[spaceIdx]!;
  if (prop.owner !== playerIdx || !prop.mortgaged) return false;
  return s.players[playerIdx]!.balance >= unmortgageCost(s, spaceIdx);
}

export function unmortgage(s: GameState, spaceIdx: number): GameState {
  if (s.phase !== "manage" || !canUnmortgage(s, s.current, spaceIdx)) return s;
  let next = payTo(s, s.current, unmortgageCost(s, spaceIdx), "bank");
  const props = next.props.map((p, i) => (i === spaceIdx ? { ...p, mortgaged: false } : p));
  next = { ...next, props };
  return { ...next, history: log(next, `${next.players[s.current]!.name} déhypothèque ${SPACES[spaceIdx]!.name}`) };
}

// ---------- Échanges ----------

export function canTrade(
  s: GameState,
  from: number,
  to: number,
  give: number[],
  receiveProps: number[],
  giveMoney: number,
  receiveMoney: number
): boolean {
  if (from === to || s.players[from]!.bankrupt || s.players[to]!.bankrupt) return false;
  const all = [...give, ...receiveProps];
  if (new Set(all).size !== all.length) return false;
  if (give.some((i) => s.props[i]!.owner !== from)) return false;
  if (receiveProps.some((i) => s.props[i]!.owner !== to)) return false;
  if (giveMoney > s.players[from]!.balance || receiveMoney > s.players[to]!.balance) return false;
  // aucune construction ne doit exister dans les groupes concernés (règle officielle)
  const groups = new Set(all.map((i) => SPACES[i]!.group).filter(Boolean));
  for (const g of groups) {
    if (SPACES.some((sp) => sp.group === g && s.props[sp.index]!.houses > 0)) return false;
  }
  return true;
}

export function makeOffer(s: GameState, offer: TradeOffer): GameState {
  if (s.tradeOffer) return s;
  if (!canTrade(s, offer.from, offer.to, offer.giveProps, offer.receiveProps, offer.giveMoney, offer.receiveMoney)) return s;
  return { ...s, tradeOffer: offer, history: log(s, `Offre d'échange de ${s.players[offer.from]!.name} → ${s.players[offer.to]!.name}`) };
}

export function acceptTrade(s: GameState): GameState {
  const o = s.tradeOffer;
  if (!o) return s;
  // revalidation au moment de l'acceptation (fonds et propriétés peuvent avoir bougé)
  if (!canTrade(s, o.from, o.to, o.giveProps, o.receiveProps, o.giveMoney, o.receiveMoney)) {
    return { ...s, tradeOffer: null };
  }
  const props = s.props.map((p) => p);
  for (const i of o.giveProps) props[i] = { ...props[i]!, owner: o.to };
  for (const i of o.receiveProps) props[i] = { ...props[i]!, owner: o.from };
  let next: GameState = { ...s, props, tradeOffer: null };
  if (o.giveMoney > 0) next = payTo(next, o.from, o.giveMoney, o.to);
  if (o.receiveMoney > 0) next = payTo(next, o.to, o.receiveMoney, o.from);
  return { ...next, history: log(next, `Échange conclu entre ${s.players[o.from]!.name} et ${s.players[o.to]!.name}`) };
}

export function rejectTrade(s: GameState): GameState {
  if (!s.tradeOffer) return s;
  return { ...s, tradeOffer: null, history: log(s, "Échange refusé") };
}
