"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PLAYER_LABELS } from "@/game/engine";
import { animationsEnabled, setAnimationsEnabled } from "@/lib/settings";

type FirstChoice = "random" | "0" | "1" | "2" | "3";

export default function Home() {
  const router = useRouter();
  const [players, setPlayers] = useState<2 | 3 | 4>(4);
  const [axis, setAxis] = useState<"v" | "h">("v");
  const [first, setFirst] = useState<FirstChoice>("random");
  const [settingsOpen, setSettingsOpen] = useState(false);

  const play = () => {
    const firstIdx =
      first === "random" ? Math.floor(Math.random() * players) : Math.min(Number(first), players - 1);
    const axe = players === 2 ? `&axe=${axis}` : "";
    router.push(`/partie?joueurs=${players}${axe}&premier=${firstIdx}`);
  };

  const optionBtn = (activeState: boolean) =>
    `px-4 py-2 rounded-xl border font-medium transition-colors ${
      activeState
        ? "border-sky-400 bg-sky-500/20 text-sky-200"
        : "border-slate-600 hover:bg-slate-800"
    }`;

  return (
    <main className="flex-1 flex flex-col items-center justify-center gap-10 p-6 text-center">
      <header className="space-y-3">
        <h1 className="text-5xl sm:text-6xl font-extrabold tracking-tight">
          Fanorina <span className="text-sky-400">7</span>
        </h1>
        <p className="text-slate-300 max-w-md mx-auto">
          7 pierres par joueur. Déplacez, sautez, éliminez — soyez le dernier en jeu.
        </p>
      </header>

      <section className="space-y-6 w-full max-w-md">
        <div className="space-y-2">
          <p className="text-sm uppercase tracking-widest text-slate-400">Nombre de joueurs</p>
          <div className="flex justify-center gap-3">
            {([2, 3, 4] as const).map((n) => (
              <button key={n} onClick={() => setPlayers(n)} className={optionBtn(players === n)}>
                {n}
              </button>
            ))}
          </div>
        </div>

        {players === 2 && (
          <div className="space-y-2">
            <p className="text-sm uppercase tracking-widest text-slate-400">Axe du duel</p>
            <div className="flex justify-center gap-3">
              <button onClick={() => setAxis("v")} className={optionBtn(axis === "v")}>
                Haut ↔ Bas
              </button>
              <button onClick={() => setAxis("h")} className={optionBtn(axis === "h")}>
                Gauche ↔ Droite
              </button>
            </div>
          </div>
        )}

        <div className="space-y-2">
          <p className="text-sm uppercase tracking-widest text-slate-400">Premier joueur</p>
          <div className="flex flex-wrap justify-center gap-2">
            <button onClick={() => setFirst("random")} className={optionBtn(first === "random")}>
              Au hasard
            </button>
            {Array.from({ length: players }, (_, i) => (
              <button
                key={i}
                onClick={() => setFirst((String(i)) as FirstChoice)}
                className={optionBtn(first === String(i))}
              >
                {PLAYER_LABELS[i]}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={play}
          className="w-full py-4 rounded-2xl bg-sky-600 hover:bg-sky-500 active:scale-[0.99] text-xl font-bold shadow-lg shadow-sky-900/40"
        >
          Jouer
        </button>

        <div className="flex justify-center gap-3">
          <Link
            href="/regles"
            className="px-5 py-2.5 rounded-xl border border-slate-600 hover:bg-slate-800 font-medium"
          >
            Règles du jeu
          </Link>
          <button
            onClick={() => setSettingsOpen(true)}
            className="px-5 py-2.5 rounded-xl border border-slate-600 hover:bg-slate-800 font-medium"
          >
            Paramètres
          </button>
        </div>
      </section>

      {settingsOpen && (
        <div
          className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-20"
          onClick={() => setSettingsOpen(false)}
        >
          <div
            className="bg-slate-900 border border-slate-700 rounded-2xl p-6 max-w-sm w-full space-y-4 text-left"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-bold">Paramètres</h2>
            <label className="flex items-center justify-between gap-4 cursor-pointer">
              <span>Animations du plateau</span>
              <input
                type="checkbox"
                ref={(el) => {
                  if (el) el.checked = animationsEnabled();
                }}
                onChange={(e) => setAnimationsEnabled(e.target.checked)}
                className="w-5 h-5 accent-sky-500"
              />
            </label>
            <button
              onClick={() => setSettingsOpen(false)}
              className="w-full py-2 rounded-lg bg-sky-600 hover:bg-sky-500 font-medium"
            >
              Fermer
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
