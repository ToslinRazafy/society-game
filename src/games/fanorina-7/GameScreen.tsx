"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useRouter, useSearchParams } from "next/navigation";
import GameShell from "@/components/GameShell";
import { NodeId } from "@/games/fanorina-7/board";
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
} from "@/games/fanorina-7/engine";

const Board3D = dynamic(() => import("./Board3D"), {
  ssr: false,
  loading: () => (
    <div className="h-[58vh] w-full animate-pulse rounded-2xl border border-slate-700 bg-slate-900 lg:h-full" />
  ),
});

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

function parseNames(params: URLSearchParams): string[] {
  return params.get("noms")?.split("|") ?? [];
}

export default function GameScreen() {
  const params = useSearchParams();
  const router = useRouter();
  const config = useMemo(() => parseConfig(new URLSearchParams(params.toString())), [params]);
  const names = useMemo(() => parseNames(params), [params]);
  const label = useCallback(
    (playerIndex: number) => names[playerIndex]?.trim() || PLAYER_LABELS[playerIndex],
    [names],
  );

  const [game, setGame] = useState<GameState>(() => createGame(config));
  const [selected, setSelected] = useState<NodeId | null>(null);
  const [moves, setMoves] = useState<Move[]>([]);
  const [toast, setToast] = useState<string | null>(null);
  const [confirm, setConfirm] = useState<"restart" | "quit" | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

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
  const status =
    game.phase === "over"
      ? "Partie terminée."
      : game.phase === "bonus"
        ? `${label(game.current)} : la pierre qui a sauté rejoue — elle peut enchaîner les captures.`
        : `Au tour de ${label(game.current)} de jouer.`;

  return (
    <GameShell
      title="Fanorina 7"
      accent="text-sky-200"
      status={
        game.phase === "bonus" ? (
          <span className="text-amber-200">{status}</span>
        ) : (
          status
        )
      }
      onRestart={() => setConfirm("restart")}
      onQuit={() => setConfirm("quit")}
    >
      {/* plateau : le cadre occupe tout l'espace disponible */}
      <section className="relative flex min-h-0 w-full flex-1 items-center justify-center">
        <Board3D
          stones={game.stones}
          colors={PLAYER_COLORS}
          selected={selected}
          moves={moves}
          lastCapture={game.lastCapture}
          interactive={game.phase !== "over"}
          onNodeClick={handleNode}
          className="h-[52dvh] sm:h-[58dvh] lg:h-full"
        />
        {toast && (
          <div
            role="status"
            className="pointer-events-none absolute bottom-6 left-1/2 -translate-x-1/2 rounded-xl border border-slate-600 bg-slate-800/95 px-4 py-2 text-sm shadow-lg backdrop-blur"
          >
            {toast}
          </div>
        )}
      </section>

      {/* HUD joueurs : bandeau défilant sur mobile, colonne sur grand écran */}
      <aside className="flex w-full shrink-0 flex-col gap-2 lg:w-72 lg:overflow-y-auto">
        <ul className="flex gap-2 overflow-x-auto pb-1 lg:flex-col lg:gap-2 lg:overflow-visible lg:pb-0">
          {game.players.map((p) => {
            const stonesLeft = countStones(game, p.index);
            const isTurn = p.index === game.current && game.phase !== "over";
            return (
              <li
                key={p.index}
                aria-current={isTurn ? "true" : undefined}
                className={`flex min-w-40 flex-1 items-center gap-3 rounded-xl border px-3 py-2 transition-colors lg:min-w-0 lg:flex-none ${
                  p.eliminated
                    ? "border-slate-800 opacity-40"
                    : isTurn
                      ? "border-sky-400 bg-slate-800/80 shadow-lg shadow-sky-950/40"
                      : "border-slate-700 bg-slate-900/60"
                }`}
              >
                <span
                  className="h-5 w-5 shrink-0 rounded-full ring-1 ring-white/20"
                  style={{ background: PLAYER_COLORS[p.index] }}
                  aria-hidden="true"
                />
                <span className="flex min-w-0 flex-col">
                  <span className="truncate font-medium">{label(p.index)}</span>
                  {isTurn && (
                    <span className="text-xs font-semibold uppercase tracking-wide text-sky-300">
                      à toi de jouer
                    </span>
                  )}
                </span>
                <span
                  className="ml-auto shrink-0 tabular-nums text-slate-200"
                  title="pierres restantes"
                >
                  {p.eliminated ? (
                    <span className="text-xs uppercase text-slate-500">éliminé</span>
                  ) : (
                    <>
                      <span className="font-bold">{stonesLeft}</span>
                      <span className="ml-1 text-xs text-slate-400">pierres</span>
                    </>
                  )}
                </span>
              </li>
            );
          })}
        </ul>
      </aside>

      {/* confirmation */}
      {confirm && (
        <div className="fixed inset-0 z-20 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm space-y-4 rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-2xl">
            <p>
              {confirm === "restart"
                ? "Recommencer la partie ? Les progrès actuels seront perdus."
                : "Quitter la partie en cours ?"}
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setConfirm(null)}
                className="rounded-lg border border-slate-600 px-4 py-2 transition-colors hover:bg-slate-800"
              >
                Annuler
              </button>
              {confirm === "restart" ? (
                <button
                  onClick={reset}
                  className="rounded-lg bg-sky-600 px-4 py-2 font-medium transition-colors hover:bg-sky-500"
                >
                  Recommencer
                </button>
              ) : (
                <button
                  onClick={() => router.push("/jeux")}
                  className="rounded-lg bg-rose-600 px-4 py-2 font-medium transition-colors hover:bg-rose-500"
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
        <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md space-y-5 rounded-2xl border border-slate-700 bg-slate-900 p-8 text-center shadow-2xl">
            <p className="text-sm font-bold uppercase tracking-widest text-amber-300">
              Partie terminée
            </p>
            <h2 className="text-3xl font-extrabold">Victoire !</h2>
            <div className="flex items-center justify-center gap-3 text-xl">
              <span
                className="inline-block h-8 w-8 rounded-full ring-1 ring-white/20"
                style={{ background: PLAYER_COLORS[winner.index] }}
                aria-hidden="true"
              />
              <span className="font-bold">{label(winner.index)}</span>
            </div>
            <p className="text-slate-300">
              {countStones(game, winner.index)} pierre
              {countStones(game, winner.index) > 1 ? "s" : ""} restante
              {countStones(game, winner.index) > 1 ? "s" : ""} sur 7.
            </p>
            <div className="flex justify-center gap-3">
              <button
                onClick={reset}
                className="rounded-xl bg-sky-600 px-5 py-2.5 font-semibold transition-colors hover:bg-sky-500"
              >
                Rejouer
              </button>
              <Link
                href="/jeux"
                className="rounded-xl border border-slate-600 px-5 py-2.5 font-semibold transition-colors hover:bg-slate-800"
              >
                Retour aux jeux
              </Link>
            </div>
          </div>
        </div>
      )}
    </GameShell>
  );
}
