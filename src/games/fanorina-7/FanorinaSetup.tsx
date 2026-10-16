"use client";

import { useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { PLAYER_COLORS, PLAYER_LABELS } from "@/games/fanorina-7/engine";
import { animationsEnabled, setAnimationsEnabled } from "@/lib/settings";
import { requestFullscreen } from "@/lib/use-fullscreen";

type FirstChoice = "random" | "0" | "1" | "2" | "3";

const noopSubscribe = () => () => {};
const serverAnimationsOn = () => true;

export default function FanorinaSetup() {
  const router = useRouter();
  const [players, setPlayers] = useState<2 | 3 | 4>(4);
  const [names, setNames] = useState<string[]>(["", "", "", ""]);
  const [axis, setAxis] = useState<"v" | "h">("v");
  const [first, setFirst] = useState<FirstChoice>("random");
  const anim = useSyncExternalStore(noopSubscribe, animationsEnabled, serverAnimationsOn);

  const setName = (i: number, value: string) =>
    setNames((prev) => prev.map((n, j) => (j === i ? value : n)));

  const play = () => {
    const firstIdx =
      first === "random"
        ? Math.floor(Math.random() * players)
        : Math.min(Number(first), players - 1);
    const q = new URLSearchParams({ joueurs: String(players), premier: String(firstIdx) });
    if (players === 2) q.set("axe", axis);
    const trimmed = names.slice(0, players).map((n) => n.trim());
    if (trimmed.some(Boolean)) q.set("noms", trimmed.join("|"));
    requestFullscreen();
    router.push(`/jeux/fanorina-7/partie?${q.toString()}`);
  };

  const optionBtn = (activeState: boolean) =>
    `px-4 py-2 rounded-xl border font-medium text-slate-200 transition-colors ${
      activeState
        ? "border-amber-400 bg-amber-500/15 text-amber-100"
        : "border-slate-600 hover:border-slate-500 hover:bg-slate-800"
    }`;

  return (
    <div className="space-y-6 text-left">
      <div className="space-y-2">
        <p className="text-sm uppercase tracking-widest text-slate-400">Nombre de joueurs</p>
        <div className="flex gap-3">
          {([2, 3, 4] as const).map((n) => (
            <button
              key={n}
              onClick={() => setPlayers(n)}
              aria-pressed={players === n}
              className={`${optionBtn(players === n)} flex-1`}
            >
              {n}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-sm uppercase tracking-widest text-slate-400">
          Prénoms <span className="normal-case text-slate-500">(facultatif)</span>
        </p>
        <div className="grid gap-2 sm:grid-cols-2">
          {Array.from({ length: players }, (_, i) => (
            <label key={i} className="flex items-center gap-2">
              <span
                className="h-4 w-4 shrink-0 rounded-full border border-slate-500"
                style={{ background: PLAYER_COLORS[i] }}
                aria-hidden="true"
              />
              <input
                type="text"
                value={names[i]}
                maxLength={16}
                onChange={(e) => setName(i, e.target.value)}
                placeholder={PLAYER_LABELS[i]}
                aria-label={`Nom du ${PLAYER_LABELS[i].toLowerCase()}`}
                className="w-full rounded-xl border border-slate-600 bg-slate-950/60 px-3 py-2 text-sm placeholder:text-slate-500 focus:border-amber-400 focus:outline-none"
              />
            </label>
          ))}
        </div>
      </div>

      {players === 2 && (
        <div className="space-y-2">
          <p className="text-sm uppercase tracking-widest text-slate-400">Axe du duel</p>
          <div className="flex gap-3">
            <button onClick={() => setAxis("v")} aria-pressed={axis === "v"} className={`${optionBtn(axis === "v")} flex-1`}>
              Haut ↔ Bas
            </button>
            <button onClick={() => setAxis("h")} aria-pressed={axis === "h"} className={`${optionBtn(axis === "h")} flex-1`}>
              Gauche ↔ Droite
            </button>
          </div>
        </div>
      )}

      <div className="space-y-2">
        <p className="text-sm uppercase tracking-widest text-slate-400">Premier joueur</p>
        <div className="flex flex-wrap gap-2">
          <button onClick={() => setFirst("random")} aria-pressed={first === "random"} className={optionBtn(first === "random")}>
            Au hasard
          </button>
          {Array.from({ length: players }, (_, i) => (
            <button
              key={i}
              onClick={() => setFirst(String(i) as FirstChoice)}
              aria-pressed={first === String(i)}
              className={optionBtn(first === String(i))}
            >
              {names[i].trim() || PLAYER_LABELS[i]}
            </button>
          ))}
        </div>
      </div>

      <label className="flex cursor-pointer items-center justify-between gap-4 rounded-xl border border-slate-700 px-4 py-3 text-sm">
        <span className="font-medium">Animations du plateau 3D</span>
        <input
          type="checkbox"
          checked={anim}
          onChange={(e) => setAnimationsEnabled(e.target.checked)}
          className="h-5 w-5 accent-amber-500"
        />
      </label>

      <button
        onClick={play}
        className="w-full rounded-2xl bg-amber-500 py-4 text-xl font-bold text-slate-950 shadow-lg shadow-amber-900/40 transition-all hover:-translate-y-0.5 hover:bg-amber-400 active:translate-y-0"
      >
        Commencer la partie
      </button>
    </div>
  );
}
