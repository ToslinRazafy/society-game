"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import BoardSVG from "./BoardSVG";
import { NodeId } from "@/game/board";
import {
  Axis,
  GameConfig,
  GameState,
  Move,
  PLAYER_COLORS,
  PLAYER_LABELS,
  applyMove,
  countStones,
  createGame,
  legalMoves,
} from "@/game/engine";
import { applyAnimations, animationsEnabled } from "@/lib/settings";

function parseConfig(params: URLSearchParams): GameConfig {
  const count = ([2, 3, 4] as number[]).includes(Number(params.get("joueurs")))
    ? (Number(params.get("joueurs")) as 2 | 3 | 4)
    : 4;
  const axis: Axis = params.get("axe") === "h" ? "horizontal" : "vertical";
  const premierRaw = Number(params.get("premier"));
  const firstPlayer =
    Number.isInteger(premierRaw) && premierRaw >= 0 && premierRaw < count ? premierRaw : 0;
  return { playerCount: count, axis, firstPlayer };
}

export default function GameScreen() {
  const params = useSearchParams();
  const router = useRouter();
  const config = useMemo(() => parseConfig(new URLSearchParams(params.toString())), [params]);

  const [game, setGame] = useState<GameState>(() => createGame(config));
  const [selected, setSelected] = useState<NodeId | null>(null);
  const [moves, setMoves] = useState<Move[]>([]);
  const [toast, setToast] = useState<string | null>(null);
  const [confirm, setConfirm] = useState<"restart" | "quit" | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    applyAnimations(animationsEnabled());
  }, []);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 1800);
  }, []);

  const reset = useCallback(() => {
    setGame(createGame(config));
    setSelected(null);
    setMoves([]);
    setConfirm(null);
  }, [config]);

  const handleNode = useCallback(
    (id: NodeId) => {
      if (game.phase === "over") return;
      // coup sur une destination légale de la pierre sélectionnée
      if (selected !== null) {
        const move = moves.find((m) => m.to === id);
        if (move) {
          const result = applyMove(game, move);
          if (!result.ok) {
            showToast(result.error);
            setSelected(null);
            setMoves([]);
            return;
          }
          if (move.type === "capture")
            showToast(
              result.state.phase === "bonus"
                ? "Pierre éliminée ! Cette pierre peut sauter à nouveau."
                : "Pierre éliminée !",
            );
          setGame(result.state);
          setSelected(null);
          setMoves([]);
          return;
        }
      }
      // sélection d'une pierre
      const stone = game.stones[id];
      if (stone && stone.player === game.current) {
        if (game.phase === "bonus" && id !== game.bonusStone) {
          showToast("Seule la pierre qui a sauté peut rejouer — elle peut capturer à nouveau.");
          return;
        }
        const ms = legalMoves(game, id);
        if (ms.length === 0) {
          showToast("Cette pierre n'a aucun coup légal.");
          setSelected(null);
          setMoves([]);
          return;
        }
        setSelected(id);
        setMoves(ms);
        return;
      }
      setSelected(null);
      setMoves([]);
    },
    [game, selected, moves, showToast],
  );

  const winner = game.winner !== null ? game.players[game.winner] : null;

  return (
    <main className="flex-1 flex flex-col lg:flex-row gap-4 p-4 max-w-6xl mx-auto w-full">
      {/* plateau */}
      <section className="flex-1 flex flex-col items-center justify-center gap-3">
        <p className="text-sm text-slate-300" aria-live="polite">
          {game.phase === "over"
            ? "Partie terminée."
            : game.phase === "bonus"
              ? `${PLAYER_LABELS[game.current]} : la pierre qui a sauté rejoue — elle peut enchaîner les captures.`
              : `Au tour de ${PLAYER_LABELS[game.current]} de jouer.`}
        </p>
        <BoardSVG
          stones={game.stones}
          colors={PLAYER_COLORS}
          selected={selected}
          moves={moves}
          lastCapture={game.lastCapture}
          interactive={game.phase !== "over"}
          onNodeClick={handleNode}
        />
        {toast && (
          <div
            role="status"
            className="fixed bottom-6 left-1/2 -translate-x-1/2 px-4 py-2 rounded-lg bg-slate-800 border border-slate-600 shadow-lg text-sm"
          >
            {toast}
          </div>
        )}
      </section>

      {/* HUD */}
      <aside className="w-full lg:w-72 flex lg:flex-col gap-3">
        <h1 className="hidden lg:block text-xl font-bold tracking-tight">Fanorina 7</h1>
        <ul className="flex lg:flex-col gap-2 flex-1">
          {game.players.map((p) => {
            const stonesLeft = countStones(game, p.index);
            const isTurn = p.index === game.current && game.phase !== "over";
            return (
              <li
                key={p.index}
                className={`flex items-center gap-3 px-3 py-2 rounded-xl border flex-1 lg:flex-none transition-colors ${
                  p.eliminated
                    ? "opacity-40 border-slate-700"
                    : isTurn
                      ? "border-white bg-slate-800"
                      : "border-slate-700"
                }`}
              >
                <span
                  className="w-5 h-5 rounded-full shrink-0"
                  style={{ background: PLAYER_COLORS[p.index] }}
                />
                <span className="font-medium">
                  {PLAYER_LABELS[p.index]}
                  {isTurn && <span className="ml-1 text-xs text-slate-300">à toi</span>}
                </span>
                <span className="ml-auto tabular-nums" title="pierres restantes">
                  {p.eliminated ? "éliminé" : `${stonesLeft} 💎`}
                </span>
              </li>
            );
          })}
        </ul>
        <div className="flex lg:flex-col gap-2">
          <button
            onClick={() => setConfirm("restart")}
            className="flex-1 lg:flex-none px-3 py-2 rounded-xl border border-slate-600 hover:bg-slate-800 text-sm"
          >
            Recommencer
          </button>
          <button
            onClick={() => setConfirm("quit")}
            className="flex-1 lg:flex-none px-3 py-2 rounded-xl border border-slate-600 hover:bg-slate-800 text-sm"
          >
            Quitter la partie
          </button>
        </div>
      </aside>

      {/* confirmation */}
      {confirm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-20">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 max-w-sm w-full space-y-4">
            <p>
              {confirm === "restart"
                ? "Recommencer la partie ? Les progrès actuels seront perdus."
                : "Quitter la partie en cours ?"}
            </p>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setConfirm(null)}
                className="px-4 py-2 rounded-lg border border-slate-600 hover:bg-slate-800"
              >
                Annuler
              </button>
              {confirm === "restart" ? (
                <button
                  onClick={reset}
                  className="px-4 py-2 rounded-lg bg-sky-600 hover:bg-sky-500 font-medium"
                >
                  Recommencer
                </button>
              ) : (
                <button
                  onClick={() => router.push("/")}
                  className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 font-medium"
                >
                  Quitter
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* écran de victoire */}
      {winner && game.phase === "over" && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-30">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-8 max-w-md w-full text-center space-y-5">
            <h2 className="text-3xl font-extrabold">Victoire !</h2>
            <div className="flex items-center justify-center gap-3 text-xl">
              <span
                className="w-8 h-8 rounded-full inline-block"
                style={{ background: PLAYER_COLORS[winner.index] }}
              />
              <span className="font-bold">{PLAYER_LABELS[winner.index]}</span>
            </div>
            <p className="text-slate-300">
              {countStones(game, winner.index)} pierre
              {countStones(game, winner.index) > 1 ? "s" : ""} restante
              {countStones(game, winner.index) > 1 ? "s" : ""} sur 7.
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={reset}
                className="px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 font-semibold"
              >
                Rejouer
              </button>
              <Link
                href="/"
                className="px-5 py-2.5 rounded-xl border border-slate-600 hover:bg-slate-800 font-semibold"
              >
                Retour au menu
              </Link>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
