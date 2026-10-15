"use client";

// Panneau d'actions contextuel : rendu des commandes autorisées par le moteur.
import { SPACES } from "./board-data";
import { rollDice } from "./rng";
import type { Command, GameState } from "./state";

export default function ActionBar({
  s,
  dispatch,
  onOpenTrade,
}: {
  s: GameState;
  dispatch: (c: Command) => void;
  onOpenTrade: () => void;
}) {
  const player = s.players[s.current]!;

  if (s.phase === "roll") {
    return (
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => {
            const [d1, d2] = rollDice(Math.random);
            dispatch({ type: "ROLL", d1, d2 });
          }}
          className="rounded-xl bg-amber-500 px-4 py-2 font-bold text-slate-950 hover:bg-amber-400"
        >
          Lancer les dés
        </button>
        {player.inJail && player.balance >= 50 && (
          <button onClick={() => dispatch({ type: "PAY_JAIL_FINE" })} className="rounded-xl border border-slate-600 px-4 py-2 font-semibold hover:bg-slate-800">
            Payer 50 F (sortie de prison)
          </button>
        )}
        {player.inJail && player.jailFreeCards.length > 0 && (
          <button onClick={() => dispatch({ type: "USE_JAIL_CARD" })} className="rounded-xl border border-emerald-500 px-4 py-2 font-semibold hover:bg-emerald-500/15">
            Utiliser une carte Sortie de Prison
          </button>
        )}
      </div>
    );
  }

  if (s.phase === "resolveBuy") {
    const space = SPACES[s.buySpace]!;
    return (
      <div className="space-y-2">
        <p className="text-sm text-slate-300">
          <strong>{space.name}</strong> — {space.price} F. Votre solde : {player.balance} F.
        </p>
        <div className="flex flex-wrap gap-2">
          <button onClick={() => dispatch({ type: "BUY" })} className="rounded-xl bg-emerald-600 px-4 py-2 font-bold hover:bg-emerald-500 disabled:opacity-50" disabled={player.balance < (space.price ?? 0)}>
            Acheter
          </button>
          <button onClick={() => dispatch({ type: "SKIP_BUY" })} className="rounded-xl border border-slate-600 px-4 py-2 font-semibold hover:bg-slate-800">
            Mettre aux enchères
          </button>
        </div>
      </div>
    );
  }

  if (s.phase === "manage") {
    return (
      <div className="flex flex-wrap gap-2">
        <button onClick={onOpenTrade} className="rounded-xl border border-slate-600 px-4 py-2 font-semibold hover:bg-slate-800">
          Proposer un échange
        </button>
        <button onClick={() => dispatch({ type: "END_TURN" })} className="rounded-xl bg-amber-500 px-4 py-2 font-bold text-slate-950 hover:bg-amber-400">
          Passer la main
        </button>
      </div>
    );
  }

  if (s.phase === "awaitPayment") {
    return (
      <div className="flex flex-wrap gap-2">
        <button onClick={onOpenTrade} className="rounded-xl border border-slate-600 px-4 py-2 font-semibold hover:bg-slate-800">
          Échanger
        </button>
        <button onClick={() => dispatch({ type: "SETTLE_DEBT" })} className="rounded-xl bg-emerald-600 px-4 py-2 font-bold hover:bg-emerald-500 disabled:opacity-40" disabled={player.balance < (s.debt?.amount ?? Infinity)}>
          Régler la dette
        </button>
        <button onClick={() => dispatch({ type: "DECLARE_BANKRUPT" })} className="rounded-xl border border-rose-600 px-4 py-2 font-semibold text-rose-200 hover:bg-rose-900/40">
          Déclarer faillite
        </button>
      </div>
    );
  }

  return <p className="text-sm text-slate-400">Enchère en cours — voir le panneau d&rsquo;enchère.</p>;
}
