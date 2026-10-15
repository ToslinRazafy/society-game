"use client";

// Fiche de propriété : détails + actions de construction/vente/hypothèque.
import { GROUP_COLORS, SPACES } from "./board-data";
import { rentFor } from "./finance";
import { canBuild, canMortgage, canSellHouse, canUnmortgage, unmortgageCost } from "./properties";
import type { Command, GameState } from "./state";

export default function PropertyPanel({ s, space, dispatch, onClose }: { s: GameState; space: number; dispatch: (c: Command) => void; onClose: () => void }) {
  const data = SPACES[space]!;
  const prop = s.props[space]!;
  const owner = prop.owner !== null ? s.players[prop.owner] : null;
  const me = s.current;
  const isMine = prop.owner === me;
  const diceTotal = (s.dice?.[0] ?? 0) + (s.dice?.[1] ?? 0);

  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/70 p-4" onClick={onClose}>
      <div className="w-full max-w-sm overflow-hidden rounded-2xl border border-slate-700 bg-slate-900" onClick={(e) => e.stopPropagation()}>
        {data.group && <div className="h-8 w-full" style={{ background: GROUP_COLORS[data.group] }} />}
        <div className="space-y-3 p-5">
          <h2 className="text-lg font-bold leading-tight">{data.fullName}</h2>
          <p className="text-sm text-slate-300">
            {owner ? `Propriété de ${owner.name}` : "Non achetée"}
            {prop.mortgaged && " — hypothéquée"}
            {prop.houses > 0 && ` — ${prop.houses === 5 ? "hôtel" : `${prop.houses} maison${prop.houses > 1 ? "s" : ""}`}`}
          </p>
          <ul className="space-y-1 text-xs text-slate-400">
            {data.price !== undefined && <li>Prix : {data.price} F · Hypothèque : {data.mortgageValue} F</li>}
            {data.type === "street" && data.rent && (
              <li>Loyers : {data.rent.slice(0, 5).join(" / ")} F (base / 1 à 4 maisons) — hôtel : {data.rent[5]} F</li>
            )}
            {data.type === "railroad" && data.rent && <li>Loyers par nombre de gares : {data.rent.join(" / ")} F</li>}
            {data.type === "utility" && <li>Loyer : ×4 dés (une compagnie) ou ×10 (les deux)</li>}
            {owner && <li>Loyer actuel sur cette case : {rentFor(s, space, diceTotal || 7)} F</li>}
            {data.houseCost !== undefined && <li>Coût maison : {data.houseCost} F</li>}
          </ul>

          {isMine && (s.phase === "manage" || s.phase === "awaitPayment") && (
            <div className="flex flex-wrap gap-2 pt-1">
              {data.type === "street" && canBuild(s, me, space) && (
                <button onClick={() => dispatch({ type: "BUILD", space })} className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-bold hover:bg-emerald-500">
                  Construire ({data.houseCost} F)
                </button>
              )}
              {data.type === "street" && canSellHouse(s, me, space) && (
                <button onClick={() => dispatch({ type: "SELL_HOUSE", space })} className="rounded-lg border border-slate-600 px-3 py-1.5 text-xs hover:bg-slate-800">
                  Vendre un bâtiment
                </button>
              )}
              {canMortgage(s, me, space) && (
                <button onClick={() => dispatch({ type: "MORTGAGE", space })} className="rounded-lg border border-slate-600 px-3 py-1.5 text-xs hover:bg-slate-800">
                  Hypothéquer (+{data.mortgageValue} F)
                </button>
              )}
              {canUnmortgage(s, me, space) && (
                <button onClick={() => dispatch({ type: "UNMORTGAGE", space })} className="rounded-lg border border-slate-600 px-3 py-1.5 text-xs hover:bg-slate-800">
                  Déhypothéquer (−{unmortgageCost(s, space)} F)
                </button>
              )}
            </div>
          )}

          <button onClick={onClose} className="mt-2 w-full rounded-xl border border-slate-600 py-2 text-sm hover:bg-slate-800">
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}
