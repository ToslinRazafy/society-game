"use client";

import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { useRouter, useSearchParams } from "next/navigation";
import GameShell from "@/components/GameShell";
import { TOKEN_COLORS } from "./board-data";
import ActionBar from "./ActionBar";
import TradeModal from "./TradeModal";
import PropertyPanel from "./PropertyPanel";
import { DiceDisplay, History, PlayerList, PropertiesSummary } from "./SidePanels";
import { applyCommand, createGame, type Command, type GameState } from "./engine";
import { netWorth } from "./finance";
import { SPACES, TOKENS } from "./board-data";

const Board3D = dynamic(() => import("./Board3D"), {
  ssr: false,
  loading: () => (
    <div className="aspect-square w-full max-w-full animate-pulse rounded-2xl border border-slate-700 bg-slate-900/70 lg:h-full lg:w-auto" aria-busy="true" />
  ),
});

type Tab = "joueurs" | "propriétés" | "journal";

function parseSetup(params: URLSearchParams): { name: string; token: string }[] {
  const count = Math.min(8, Math.max(2, Number(params.get("joueurs")) || 2));
  const names = (params.get("noms") ?? "").split("|");
  const tokens = (params.get("pions") ?? "").split("|");
  return Array.from({ length: count }, (_, i) => ({
    name: names[i]?.trim() || `Joueur ${i + 1}`,
    token: TOKENS.some((t) => t.id === tokens[i]) ? (tokens[i] as string) : TOKENS[i]!.id,
  }));
}

function AuctionPanel({ s, dispatch }: { s: GameState; dispatch: (c: Command) => void }) {
  const a = s.auction;
  const bidder = a ? s.players[a.bidder] : null;
  const min = a ? a.highBid + 1 : 1;
  const [amount, setAmount] = useState(String(min));
  if (!a || !bidder) return null;
  const value = Number(amount);
  const valid = Number.isInteger(value) && value >= min && value <= bidder.balance;

  return (
    <div className="space-y-3 rounded-2xl border border-amber-500/60 bg-amber-500/10 p-4">
      <p className="font-bold text-amber-200">Enchère — {bidder.name}</p>
      <p className="text-sm text-slate-200">
        Meilleure offre : <strong>{a.highBid || "—"}</strong> F ({a.highBidder !== null ? s.players[a.highBidder]!.name : "personne"}) · votre solde : {bidder.balance} F
      </p>
      <div className="flex flex-wrap items-center gap-2">
        <input
          type="number"
          min={min}
          max={bidder.balance}
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="w-24 rounded-lg border border-slate-600 bg-slate-950 px-2 py-1 text-sm"
          aria-label="Montant de l'enchère"
        />
        <button disabled={!valid} onClick={() => dispatch({ type: "AUCTION_BID", amount: value })} className="rounded-xl bg-emerald-600 px-3 py-1.5 text-sm font-bold hover:bg-emerald-500 disabled:opacity-40">
          Enchérir
        </button>
        <button onClick={() => dispatch({ type: "AUCTION_PASS" })} className="rounded-xl border border-slate-600 px-3 py-1.5 text-sm hover:bg-slate-800">
          Passer
        </button>
      </div>
      <p className="text-xs text-slate-400">Les autres joueurs restants (non passés) peuvent surenchérir ; le plus offrant remporte la case.</p>
    </div>
  );
}

function TradePrompt({ s, dispatch }: { s: GameState; dispatch: (c: Command) => void }) {
  const offer = s.tradeOffer;
  if (!offer) return null;
  const viewer = s.current;
  const from = s.players[offer.from]!.name;
  const to = s.players[offer.to]!.name;
  const fmt = (props: number[], money: number) =>
    [props.map((i) => SPACES[i]!.name).join(", ") || "rien", money ? `${money} F` : ""].filter(Boolean).join(" + ");

  return (
    <div className="space-y-2 rounded-2xl border border-sky-500/60 bg-sky-500/10 p-4 text-sm">
      <p className="font-bold text-sky-200">Offre d&rsquo;échange : {from} ⇄ {to}</p>
      <p>
        {from} donne {fmt(offer.giveProps, offer.giveMoney)} et reçoit {fmt(offer.receiveProps, offer.receiveMoney)}.
      </p>
      {viewer === offer.to ? (
        <div className="flex gap-2">
          <button onClick={() => dispatch({ type: "TRADE_ACCEPT" })} className="rounded-xl bg-emerald-600 px-3 py-1.5 font-bold hover:bg-emerald-500">Accepter</button>
          <button onClick={() => dispatch({ type: "TRADE_REJECT" })} className="rounded-xl border border-slate-600 px-3 py-1.5 hover:bg-slate-800">Refuser</button>
        </div>
      ) : (
        <p className="text-xs text-slate-400">En attente de la réponse de {to}.</p>
      )}
    </div>
  );
}

function DebtBanner({ s }: { s: GameState }) {
  if (s.phase !== "awaitPayment" || !s.debt) return null;
  const creditor = s.debt.to === "bank" ? "la banque" : s.players[s.debt.to]!.name;
  return (
    <div className="rounded-2xl border border-rose-500/60 bg-rose-500/10 p-4 text-sm">
      <p className="font-bold text-rose-200">Dette à régler : {s.debt.amount} F envers {creditor}</p>
      <p className="text-xs text-slate-300">
        Vendez des bâtiments, hypothéquez, ou échangez pour réunir la somme — sinon déclarez la faillite.
      </p>
    </div>
  );
}

function EndScreen({ s, onReplay }: { s: GameState; onReplay: () => void }) {
  const ranked = useMemo(
    () =>
      s.players
        .map((p, i) => ({ name: p.name, worth: netWorth(s, i), bankrupt: p.bankrupt, token: i }))
        .sort((a, b) => b.worth - a.worth),
    [s]
  );
  const winner = s.winner !== null ? s.players[s.winner] : null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
      <div className="w-full max-w-md space-y-4 rounded-2xl border border-slate-700 bg-slate-900 p-6 text-center">
        <h2 className="text-3xl font-black text-amber-300">{winner ? `${winner.name} gagne !` : "Partie terminée"}</h2>
        <ol className="space-y-1 text-left text-sm">
          {ranked.map((r, i) => (
            <li key={r.name} className="flex items-center gap-2 rounded-lg border border-slate-700 px-3 py-1.5">
              <span className="w-5 text-slate-500">{i + 1}.</span>
              <span className="h-2.5 w-2.5 rounded-full" style={{ background: TOKEN_COLORS[r.token % TOKEN_COLORS.length] }} />
              <span className="font-semibold">{r.name}</span>
              <span className="ml-auto tabular-nums">{r.bankrupt ? "failli" : `${r.worth} F`}</span>
            </li>
          ))}
        </ol>
        <div className="flex justify-center gap-3 pt-2">
          <button onClick={onReplay} className="rounded-xl bg-amber-500 px-5 py-2 font-bold text-slate-950 hover:bg-amber-400">
            Rejouer
          </button>
        </div>
      </div>
    </div>
  );
}

export default function MonopolyScreen() {
  const params = useSearchParams();
  const router = useRouter();
  const setup = useMemo(() => parseSetup(new URLSearchParams(params.toString())), [params]);
  const [game, setGame] = useState<GameState>(() => createGame({ players: setup }));
  const [tab, setTab] = useState<Tab>("joueurs");
  const [showTrade, setShowTrade] = useState(false);
  const [detail, setDetail] = useState<number | null>(null);

  const dispatch = (c: Command) => setGame((prev) => applyCommand(prev, c));

  const current = game.players[game.current]!;
  const statusMsg = (() => {
    switch (game.phase) {
      case "roll":
        return current.inJail ? `${current.name} est en prison — tentez un double, payez l'amende ou utilisez une carte.` : `Au tour de ${current.name} de lancer les dés.`;
      case "resolveBuy":
        return `${current.name} peut acheter la case ou la mettre aux enchères.`;
      case "auction":
        return `Enchère en cours — c'est à ${game.auction ? game.players[game.auction.bidder]!.name : "?"}.`;
      case "awaitPayment":
        return `${current.name} doit réunir des fonds ou déclarer la faillite.`;
      case "manage":
        return `${current.name} : constructions, hypothèques, échanges, puis passer la main.`;
      case "over":
        return "Partie terminée.";
    }
  })();

  const canViewTradePrompt = game.tradeOffer !== null && game.current === game.tradeOffer.to;

  return (
    <GameShell
      title="Monopoly"
      accent="text-amber-300"
      status={statusMsg}
      onQuit={() => router.push("/jeux")}
    >
      <section className="flex min-h-0 flex-1 flex-col items-center gap-2">
        <div className="flex min-h-[52vh] w-full flex-1 items-center justify-center lg:min-h-0">
          <Board3D
            s={game}
            onCellClick={setDetail}
            className="aspect-square w-full max-w-full lg:h-full lg:w-auto"
          />
        </div>
        <div className="w-full shrink-0 rounded-2xl border border-slate-700 bg-slate-900/70 p-3">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <DiceDisplay s={game} />
            <span className="ml-auto text-xs uppercase tracking-widest text-slate-500">
              Banque : {game.bankHouses} maisons · {game.bankHotels} hôtels · tour {game.turn}
            </span>
          </div>
        </div>
      </section>

      <aside className="flex w-full shrink-0 flex-col gap-3 lg:w-80">
        {game.phase === "auction" && <AuctionPanel s={game} dispatch={dispatch} />}
        {canViewTradePrompt && <TradePrompt s={game} dispatch={dispatch} />}
        {game.phase === "awaitPayment" && <DebtBanner s={game} />}

        <div className="rounded-2xl border border-slate-700 bg-slate-900/70 p-4">
          <ActionBar s={game} dispatch={dispatch} onOpenTrade={() => setShowTrade(true)} />
        </div>

        <div className="rounded-2xl border border-slate-700 bg-slate-900/70 p-4">
          <div className="mb-3 flex gap-2 text-xs" role="group" aria-label="Panneaux d'information">
            {(["joueurs", "propriétés", "journal"] as Tab[]).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                aria-pressed={tab === t}
                className={`rounded-lg px-3 py-1 font-semibold uppercase tracking-wide transition-colors ${
                  tab === t ? "bg-amber-500/20 text-amber-200" : "text-slate-400 hover:bg-slate-800"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
          {tab === "joueurs" && <PlayerList s={game} />}
          {tab === "propriétés" && <PropertiesSummary s={game} />}
          {tab === "journal" && <History s={game} />}
        </div>
      </aside>

      {showTrade && (
        <TradeModal s={game} dispatch={dispatch} onClose={() => setShowTrade(false)} />
      )}
      {detail !== null && (
        <PropertyPanel
          s={game}
          space={detail}
          dispatch={dispatch}
          onClose={() => setDetail(null)}
        />
      )}
      {game.phase === "over" && (
        <EndScreen s={game} onReplay={() => setGame(createGame({ players: setup }))} />
      )}
    </GameShell>
  );
}
