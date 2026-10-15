"use client";

// Modale d'échange : sélection des propriétés et montants, validation locale
// via canTrade (le moteur revalide à l'acceptation).
import { useMemo, useState } from "react";
import { SPACES } from "./board-data";
import { canTrade } from "./properties";
import type { Command, GameState } from "./state";

function toggle(list: number[], i: number): number[] {
  return list.includes(i) ? list.filter((x) => x !== i) : [...list, i];
}

function PropPicker({ s, owner, selected, onToggle, disabled }: { s: GameState; owner: number; selected: number[]; onToggle: (i: number) => void; disabled: boolean }) {
  const owned = s.props.map((p, i) => (p.owner === owner ? i : -1)).filter((i) => i >= 0);
  if (owned.length === 0) return <p className="text-xs text-slate-500">Aucune propriété</p>;
  return (
    <div className="flex flex-wrap gap-1">
      {owned.map((i) => {
        const prop = s.props[i]!;
        const on = selected.includes(i);
        return (
          <button
            key={i}
            type="button"
            disabled={disabled}
            onClick={() => onToggle(i)}
            aria-pressed={on}
            className={`rounded-lg border px-2 py-1 text-xs ${on ? "border-amber-400 bg-amber-500/20" : "border-slate-600"} ${disabled ? "opacity-40" : "hover:bg-slate-800"}`}
          >
            {SPACES[i]!.name}
            {prop.mortgaged ? " (hyp)" : ""}
            {prop.houses > 0 ? ` +${prop.houses}` : ""}
          </button>
        );
      })}
    </div>
  );
}

export default function TradeModal({ s, dispatch, onClose }: { s: GameState; dispatch: (c: Command) => void; onClose: () => void }) {
  const me = s.current;
  const others = s.players.map((p, i) => (i !== me && !p.bankrupt ? i : -1)).filter((i) => i >= 0);
  const [to, setTo] = useState(others[0] ?? 0);
  const [giveProps, setGiveProps] = useState<number[]>([]);
  const [receiveProps, setReceiveProps] = useState<number[]>([]);
  const [giveMoney, setGiveMoney] = useState(0);
  const [receiveMoney, setReceiveMoney] = useState(0);

  const ok = useMemo(
    () => canTrade(s, me, to, giveProps, receiveProps, giveMoney, receiveMoney),
    [s, me, to, giveProps, receiveProps, giveMoney, receiveMoney],
  );

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/70 p-4">
      <div className="max-h-[90vh] w-full max-w-lg space-y-4 overflow-y-auto rounded-2xl border border-slate-700 bg-slate-900 p-5">
        <h2 className="text-lg font-bold">Proposer un échange</h2>

        <label className="block text-sm">
          <span className="text-slate-400">Adversaire</span>
          <select value={to} onChange={(e) => setTo(Number(e.target.value))} className="mt-1 w-full rounded-lg border border-slate-600 bg-slate-950 px-2 py-1">
            {others.map((i) => (
              <option key={i} value={i}>
                {s.players[i]!.name}
              </option>
            ))}
          </select>
        </label>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2 rounded-xl border border-slate-700 p-3">
            <p className="text-sm font-semibold text-emerald-300">Je donne</p>
            <PropPicker s={s} owner={me} selected={giveProps} disabled={false} onToggle={(i) => setGiveProps((p) => toggle(p, i))} />
            <input type="number" min={0} value={giveMoney} onChange={(e) => setGiveMoney(Math.max(0, Number(e.target.value)))} className="w-full rounded-lg border border-slate-600 bg-slate-950 px-2 py-1 text-sm" aria-label="Argent donné" />
          </div>
          <div className="space-y-2 rounded-xl border border-slate-700 p-3">
            <p className="text-sm font-semibold text-sky-300">Je reçois</p>
            <PropPicker s={s} owner={to} selected={receiveProps} disabled={false} onToggle={(i) => setReceiveProps((p) => toggle(p, i))} />
            <input type="number" min={0} value={receiveMoney} onChange={(e) => setReceiveMoney(Math.max(0, Number(e.target.value)))} className="w-full rounded-lg border border-slate-600 bg-slate-950 px-2 py-1 text-sm" aria-label="Argent reçu" />
          </div>
        </div>

        {!ok && (
          <p className="text-xs text-rose-300">
            Échange refusé par les règles : fonds insuffisants, propriété invalide, ou groupe avec maisons.
          </p>
        )}

        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="rounded-xl border border-slate-600 px-4 py-2 text-sm hover:bg-slate-800">
            Annuler
          </button>
          <button
            disabled={!ok}
            onClick={() => {
              dispatch({ type: "TRADE_PROPOSE", to, giveProps, receiveProps, giveMoney, receiveMoney });
              onClose();
            }}
            className="rounded-xl bg-amber-500 px-4 py-2 text-sm font-bold text-slate-950 hover:bg-amber-400 disabled:opacity-40"
          >
            Proposer
          </button>
        </div>
      </div>
    </div>
  );
}
