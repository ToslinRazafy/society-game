"use client";

import { useMemo } from "react";
import { SPACES } from "./board-data";
import { TOKEN_COLORS } from "./board-data";
import type { GameState } from "./state";

function Chip({ i }: { i: number }) {
  return <span className="h-2 w-2 shrink-0 rounded-full ring-1 ring-black/30" style={{ background: TOKEN_COLORS[i % TOKEN_COLORS.length] }} aria-hidden="true" />;
}

export function PlayerList({ s }: { s: GameState }) {
  return (
    <ul className="space-y-2">
      {s.players.map((p, i) => {
        const isTurn = i === s.current && s.phase !== "over";
        return (
          <li
            key={p.id}
            className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-sm ${
              p.bankrupt ? "border-slate-700 opacity-40" : isTurn ? "border-amber-400 bg-amber-500/10" : "border-slate-700"
            }`}
          >
            <Chip i={i} />
            <span className="font-semibold">{p.name}</span>
            {p.inJail && <span className="rounded bg-rose-900/60 px-1 text-[10px] font-bold uppercase text-rose-200">Prison</span>}
            <span className="ml-auto flex items-center gap-2 tabular-nums">
              <span className={p.balance < 100 ? "text-rose-300" : "text-emerald-300"}>{p.balance} F</span>
              {p.jailFreeCards.length > 0 && <span title="cartes Sortie de Prison">🎫{p.jailFreeCards.length}</span>}
            </span>
          </li>
        );
      })}
    </ul>
  );
}

export function PropertiesSummary({ s }: { s: GameState }) {
  const per = useMemo(
    () =>
      s.players.map((_, i) =>
        SPACES.filter((sp) => s.props[sp.index]!.owner === i).map((sp) => ({ index: sp.index, houses: s.props[sp.index]!.houses, mortgaged: s.props[sp.index]!.mortgaged }))
      ),
    [s]
  );
  return (
    <div className="space-y-3 text-xs">
      {s.players.map((p, i) =>
        per[i]!.length === 0 ? null : (
          <div key={p.id}>
            <p className="mb-1 flex items-center gap-2 font-semibold">
              <Chip i={i} /> {p.name} ({per[i]!.length})
            </p>
            <div className="flex flex-wrap gap-1">
              {per[i]!.map((x) => (
                <span key={x.index} className={`rounded border px-1 py-0.5 ${x.mortgaged ? "border-rose-600/60 text-rose-300" : "border-slate-600"}`}>
                  {SPACES[x.index]!.name}
                  {x.houses > 0 ? ` ${x.houses === 5 ? "H" : `+${x.houses}`}` : ""}
                </span>
              ))}
            </div>
          </div>
        )
      )}
    </div>
  );
}

export function History({ s }: { s: GameState }) {
  return (
    <div className="space-y-1 overflow-y-auto text-xs text-slate-300" style={{ maxHeight: 260 }}>
      {[...s.history].reverse().map((line, i) => (
        <p key={i} className={i === 0 ? "text-amber-200" : ""}>
          {line}
        </p>
      ))}
    </div>
  );
}

export function DiceDisplay({ s }: { s: GameState }) {
  if (!s.dice) return <p className="text-sm text-slate-400">En attente du lancer…</p>;
  return (
    <div className="flex items-center gap-2">
      {s.dice.map((d, i) => (
        <span key={i} className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-500 bg-slate-800 text-lg font-bold">
          {d}
        </span>
      ))}
      <span className="text-sm text-slate-300">= {s.dice[0] + s.dice[1]}</span>
      {s.dice[0] === s.dice[1] && <span className="text-xs font-bold uppercase text-amber-300">double !</span>}
    </div>
  );
}
