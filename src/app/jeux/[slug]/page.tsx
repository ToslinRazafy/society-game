import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import GameCard from "@/components/GameCard";
import FanorinaSetup from "@/games/fanorina-7/FanorinaSetup";
import MonopolySetup from "@/games/monopoly/MonopolySetup";
import { GAMES, getGame } from "@/games/registry";

export function generateStaticParams() {
  return GAMES.map((g) => ({ slug: g.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const game = getGame(slug);
  if (!game) return { title: "Jeu introuvable" };
  return { title: `${game.name} — PlayBoard`, description: game.description };
}

export default async function JeuPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const game = getGame(slug);
  if (!game) notFound();

  const others = GAMES.filter((g) => g.slug !== game.slug);

  return (
    <div className="flex-1 flex flex-col">
      <SiteHeader />

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6 sm:py-12">
        <div className="grid gap-10 lg:grid-cols-2">
          {/* Présentation */}
          <section className="space-y-6">
            <div className="relative aspect-[16/10] overflow-hidden rounded-3xl border border-slate-700 bg-slate-900">
              {game.illustration ? (
                <Image
                  src={game.illustration}
                  alt={`Illustration de ${game.name}`}
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-contain"
                  priority
                />
              ) : (
                <div className="flex h-full items-center justify-center bg-gradient-to-br from-slate-800 to-slate-950">
                  <span className="text-8xl font-black text-slate-700/70 select-none" aria-hidden="true">
                    {game.name.slice(0, 1)}
                  </span>
                </div>
              )}
            </div>

            <div className="flex flex-wrap gap-3 text-sm">
              <span className="rounded-full border border-slate-600 bg-slate-900 px-3 py-1 font-semibold text-slate-200">
                👥 {game.players.min === game.players.max ? `${game.players.min} joueurs` : `${game.players.min} à ${game.players.max} joueurs`}
              </span>
              <span className="rounded-full border border-slate-600 bg-slate-900 px-3 py-1 font-semibold text-slate-200">
                ⏱ {game.duration}
              </span>
              <span className="rounded-full border border-slate-600 bg-slate-900 px-3 py-1 font-semibold text-slate-200">
                {game.category}
              </span>
              <span className="rounded-full border border-slate-600 bg-slate-900 px-3 py-1 font-semibold text-slate-200">
                📱 Multijoueur local
              </span>
            </div>

            <div className="space-y-3">
              <h1 className="text-3xl font-black tracking-tight sm:text-4xl">{game.name}</h1>
              <p className="text-lg font-semibold text-amber-300">{game.tagline}</p>
              <p className="leading-relaxed text-slate-300">{game.description}</p>
            </div>

            {game.rulesPath && (
              <Link
                href={game.rulesPath}
                className="inline-block rounded-xl border border-slate-600 px-5 py-2.5 font-semibold text-slate-200 transition-colors hover:bg-slate-800"
              >
                Lire les règles essentielles
              </Link>
            )}
          </section>

          {/* Configuration ou annonce */}
          <section>
            {game.status === "live" ? (
              <div className="rounded-3xl border border-slate-700 bg-slate-900/60 p-6 sm:p-8">
                <h2 className="text-xl font-extrabold tracking-tight">
                  Configurer la partie
                </h2>
                <p className="mt-1 mb-6 text-sm text-slate-400">
                  Réglez la table, puis lancez la partie sur cet appareil.
                </p>
                {game.slug === "fanorina-7" ? (
                  <FanorinaSetup />
                ) : game.slug === "monopoly" ? (
                  <MonopolySetup />
                ) : (
                  <p className="text-slate-300">Configuration indisponible pour ce jeu.</p>
                )}
              </div>
            ) : (
              <div className="rounded-3xl border border-dashed border-slate-600 bg-slate-900/40 p-8 text-center">
                <p className="text-5xl" aria-hidden="true">
                  🚧
                </p>
                <h2 className="mt-4 text-2xl font-extrabold">Bientôt disponible</h2>
                <p className="mx-auto mt-2 max-w-sm leading-relaxed text-slate-400">
                  {game.name} est en cours de développement pour PlayBoard. En attendant,
                  découvrez les jeux déjà jouables sur la plateforme.
                </p>
                <Link
                  href="/jeux"
                  className="mt-6 inline-block rounded-xl bg-amber-500 px-6 py-3 font-bold text-slate-950 transition-colors hover:bg-amber-400"
                >
                  Voir les jeux disponibles
                </Link>
              </div>
            )}
          </section>
        </div>

        {/* Autres jeux */}
        <section className="mt-16">
          <h2 className="mb-6 text-xl font-extrabold tracking-tight sm:text-2xl">
            Autres jeux sur PlayBoard
          </h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {others.map((g) => (
              <GameCard key={g.slug} game={g} />
            ))}
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
