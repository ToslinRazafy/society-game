"use client";

import { useState } from "react";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import GameCard from "@/components/GameCard";
import { GAMES, categories } from "@/games/registry";

export default function JeuxPage() {
  const [category, setCategory] = useState<string>("Tous");
  const [onlyLive, setOnlyLive] = useState(false);

  const chips = ["Tous", ...categories()];
  const filtered = GAMES.filter(
    (g) => (category === "Tous" || g.category === category) && (!onlyLive || g.status === "live"),
  );
  const featured = GAMES.filter((g) => g.featured && g.status === "live");
  const recent = [...GAMES].reverse().slice(0, 2);

  return (
    <div className="flex-1 flex flex-col">
      <SiteHeader />

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 sm:px-6">
        {/* Bienvenue */}
        <section className="py-10 sm:py-14">
          <h1 className="text-3xl font-black tracking-tight sm:text-4xl">
            Bienvenue sur <span className="text-amber-400">PlayBoard</span>
          </h1>
          <p className="mt-3 max-w-2xl text-lg leading-relaxed text-slate-300">
            Choisissez un jeu, configurez votre table et lancez une partie multijoueur sur cet
            appareil. Chacun son tour — les règles sont gérées, il ne reste qu&apos;à jouer.
          </p>
        </section>

        {/* À découvrir */}
        {featured.length > 0 && (
          <section className="pb-10">
            <div className="mb-5 flex items-center justify-between gap-4">
              <h2 className="text-xl font-extrabold tracking-tight sm:text-2xl">À découvrir</h2>
              <span className="text-sm text-slate-400">jeux prêts à jouer maintenant</span>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {featured.map((g) => (
                <GameCard key={g.slug} game={g} />
              ))}
            </div>
          </section>
        )}

        {/* Récents */}
        <section className="pb-10">
          <h2 className="mb-5 text-xl font-extrabold tracking-tight sm:text-2xl">
            Ajoutés récemment
          </h2>
          <div className="flex flex-wrap gap-3">
            {recent.map((g) => (
              <a
                key={g.slug}
                href={`/jeux/${g.slug}`}
                className="rounded-full border border-slate-600 bg-slate-900 px-4 py-2 text-sm font-semibold text-slate-200 transition-colors hover:border-amber-400 hover:text-amber-300"
              >
                {g.name}
                {g.status === "soon" && <span className="ml-2 text-xs text-slate-500">bientôt</span>}
              </a>
            ))}
          </div>
        </section>

        {/* Catalogue complet */}
        <section className="pb-16">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
            <h2 className="text-xl font-extrabold tracking-tight sm:text-2xl">Tous les jeux</h2>
            <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-300">
              <input
                type="checkbox"
                checked={onlyLive}
                onChange={(e) => setOnlyLive(e.target.checked)}
                className="h-4 w-4 accent-amber-500"
              />
              Disponibles uniquement
            </label>
          </div>

          <div className="mb-8 flex flex-wrap gap-2" role="group" aria-label="Filtrer par catégorie">
            {chips.map((c) => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                aria-pressed={category === c}
                className={`rounded-full px-4 py-1.5 text-sm font-semibold transition-colors ${
                  category === c
                    ? "bg-amber-500 text-slate-950"
                    : "border border-slate-600 text-slate-300 hover:bg-slate-800"
                }`}
              >
                {c}
              </button>
            ))}
          </div>

          {filtered.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-slate-600 p-10 text-center text-slate-400">
              Aucun jeu ne correspond à ce filtre pour l&apos;instant.
            </p>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((g) => (
                <GameCard key={g.slug} game={g} />
              ))}
            </div>
          )}
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
