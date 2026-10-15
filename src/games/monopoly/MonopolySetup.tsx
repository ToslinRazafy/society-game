"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { TOKENS } from "./board-data";
import { TOKEN_COLORS } from "./Board";

const DEFAULT_NAMES = ["Joueur 1", "Joueur 2", "Joueur 3", "Joueur 4", "Joueur 5", "Joueur 6", "Joueur 7", "Joueur 8"];

export default function MonopolySetup() {
  const router = useRouter();
  const [count, setCount] = useState(2);
  const [names, setNames] = useState<string[]>(DEFAULT_NAMES.slice());
  const [tokens, setTokens] = useState<string[]>(TOKENS.map((t) => t.id));

  const tokenChoices = useMemo(() => Array.from({ length: count }, (_, i) => tokens[i] ?? TOKENS[i]!.id), [count, tokens]);

  const setToken = (i: number, id: string) => {
    setTokens((prev) => {
      const from = prev.indexOf(id);
      const to = prev.indexOf(prev[i]!);
      if (from === -1 || from === to) return prev;
      const next = [...prev];
      next[to] = next[i]!;
      next[i] = id;
      return next;
    });
  };

  const valid = useMemo(() => {
    const trimmed = names.slice(0, count).map((n) => n.trim());
    return trimmed.every((n) => n.length > 0) && new Set(tokenChoices).size === count;
  }, [names, count, tokenChoices]);

  const play = () => {
    if (!valid) return;
    const q = new URLSearchParams({ joueurs: String(count) });
    q.set("noms", names.slice(0, count).map((n) => n.trim()).join("|"));
    q.set("pions", tokenChoices.join("|"));
    router.push(`/jeux/monopoly/partie?${q.toString()}`);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <p className="text-sm uppercase tracking-widest text-slate-400">Nombre de joueurs</p>
        <div className="flex flex-wrap gap-2">
          {[2, 3, 4, 5, 6, 7, 8].map((n) => (
            <button
              key={n}
              onClick={() => setCount(n)}
              aria-pressed={count === n}
              className={`min-w-11 flex-1 rounded-xl border px-3 py-2 font-semibold transition-colors ${
                count === n ? "border-emerald-400 bg-emerald-500/20 text-emerald-100" : "border-slate-600 hover:bg-slate-800"
              }`}
            >
              {n}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <p className="text-sm uppercase tracking-widest text-slate-400">Joueurs</p>
        <ul className="space-y-2">
          {Array.from({ length: count }, (_, i) => {
            const token = tokenChoices[i] ?? TOKENS[i]!.id;
            return (
              <li key={i} className="flex items-center gap-3 rounded-xl border border-slate-700 bg-slate-950/40 p-2">
                <span className="h-4 w-4 shrink-0 rounded-full ring-2 ring-black/30" style={{ background: TOKEN_COLORS[i % TOKEN_COLORS.length] }} />
                <input
                  type="text"
                  value={names[i]}
                  maxLength={16}
                  onChange={(e) => setNames((prev) => prev.map((n, j) => (j === i ? e.target.value : n)))}
                  aria-label={`Nom du joueur ${i + 1}`}
                  className="w-32 rounded-lg border border-slate-600 bg-slate-950/60 px-2 py-1 text-sm sm:flex-1"
                />
                <label className="flex items-center gap-2 text-xs text-slate-300">
                  <span>Pion</span>
                  <select
                    value={token}
                    onChange={(e) => setToken(i, e.target.value)}
                    aria-label={`Pion du joueur ${i + 1}`}
                    className="rounded-lg border border-slate-600 bg-slate-950 px-2 py-1"
                  >
                    {TOKENS.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                </label>
              </li>
            );
          })}
        </ul>
      </div>

      <button
        onClick={play}
        disabled={!valid}
        className="w-full rounded-2xl bg-emerald-600 py-4 text-lg font-bold text-white shadow-lg shadow-emerald-900/40 transition-colors enabled:hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-50"
      >
        Commencer la partie
      </button>
      {!valid && <p className="text-center text-xs text-rose-300">Chaque joueur doit avoir un nom et un pion unique.</p>}
    </div>
  );
}
