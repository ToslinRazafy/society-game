import Link from "next/link";
import Image from "next/image";
import { GameMeta } from "@/games/registry";

export default function GameCard({ game }: { game: GameMeta }) {
  const live = game.status === "live";
  const href = `/jeux/${game.slug}`;

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-slate-700/80 bg-slate-900 shadow-lg shadow-black/20 transition-all hover:-translate-y-1 hover:border-slate-500">
      <div className="relative h-40 overflow-hidden bg-gradient-to-br from-slate-800 to-slate-900">
        {game.illustration ? (
          <Image
            src={game.illustration}
            alt={`Illustration de ${game.name}`}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <span className="text-6xl font-black text-slate-700/80 select-none" aria-hidden="true">
              {game.name.slice(0, 1)}
            </span>
          </div>
        )}
        <span
          className={`absolute top-3 right-3 rounded-full px-2.5 py-1 text-xs font-bold ${
            live ? "bg-emerald-500/90 text-emerald-950" : "bg-slate-700/90 text-slate-200"
          }`}
        >
          {live ? "Disponible" : "Bientôt"}
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-lg font-bold tracking-tight">{game.name}</h3>
          <span className="rounded-md bg-slate-800 px-2 py-0.5 text-xs text-slate-300">
            {game.category}
          </span>
        </div>
        <p className="line-clamp-2 flex-1 text-sm leading-relaxed text-slate-400">{game.tagline}</p>
        <div className="flex items-center gap-4 text-xs text-slate-400">
          <span title="Nombre de joueurs">
            👥 {game.players.min === game.players.max ? game.players.min : `${game.players.min}–${game.players.max}`}
          </span>
          <span title="Durée moyenne">⏱ {game.duration}</span>
          <span className="hidden sm:inline">📱 Local</span>
        </div>
        <Link
          href={href}
          aria-label={live ? `Jouer à ${game.name}` : `Voir la fiche de ${game.name}`}
          className={`mt-2 rounded-xl py-2.5 text-center font-bold transition-colors ${
            live
              ? "bg-amber-500 text-slate-950 hover:bg-amber-400"
              : "border border-slate-600 text-slate-300 hover:bg-slate-800"
          }`}
        >
          {live ? "Jouer" : "Découvrir"}
        </Link>
      </div>
    </article>
  );
}
