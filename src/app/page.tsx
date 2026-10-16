import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import GameCard from "@/components/GameCard";
import { GAMES } from "@/games/registry";

const STEPS = [
  {
    n: "1",
    title: "Choisissez un jeu",
    text: "Parcourez le catalogue et sélectionnez le jeu qui vous tente, en un clic.",
  },
  {
    n: "2",
    title: "Configurez la partie",
    text: "Nombre de joueurs, prénoms, premier joueur : chacun personnalise sa table.",
  },
  {
    n: "3",
    title: "Passez l'appareil",
    text: "Un seul écran, plusieurs joueurs : l'interface indique toujours à qui de jouer.",
  },
  {
    n: "4",
    title: "Jouez jusqu'au bout",
    text: "Le moteur applique les règles ; la plateforme annonce le vainqueur.",
  },
];

const ADVANTAGES = [
  {
    icon: "🎯",
    title: "Simple",
    text: "Aucune installation, aucun compte. Ouvrez la page et lancez une partie en trente secondes.",
  },
  {
    icon: "🤝",
    title: "Convivial",
    text: "Conçu pour le jeu en groupe : le même appareil circule entre les joueurs, chacun son tour.",
  },
  {
    icon: "📱",
    title: "Accessible",
    text: "Responsive sur téléphone, tablette et ordinateur. Les règles s'apprennent en un écran.",
  },
  {
    icon: "🧩",
    title: "Divers",
    text: "Stratégie pure, jeux classiques, parties courtes ou longues : le catalogue s'agrandit.",
  },
];

export default function LandingPage() {
  const featured = GAMES.filter((g) => g.featured);

  return (
    <div className="flex-1 flex flex-col">
      <SiteHeader />

      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_50%_at_50%_0%,rgba(245,158,11,0.14),transparent_70%)]"
          />
          <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-16 sm:px-6 md:grid-cols-2 md:py-24">
            <div className="space-y-6">
              <p className="inline-block rounded-full border border-amber-500/40 bg-amber-500/10 px-3 py-1 text-xs font-bold tracking-wide text-amber-300">
                MULTIJOUEUR LOCAL · SUR UN MÊME APPAREIL
              </p>
              <h1 className="text-balance text-4xl font-black leading-tight tracking-tight sm:text-5xl lg:text-6xl">
                Le salon des jeux de société,{" "}
                <span className="text-amber-400">sur votre écran.</span>
              </h1>
              <p className="max-w-lg text-pretty text-lg leading-relaxed text-slate-300">
                PlayBoard réunit plusieurs jeux de société jouables immédiatement, à plusieurs,
                sur le même téléphone ou le même ordinateur. Chacun son tour — et bonne partie.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link
                  href="/jeux"
                  className="rounded-2xl bg-amber-500 px-6 py-3.5 text-lg font-bold text-slate-950 shadow-lg shadow-amber-900/40 transition-all hover:-translate-y-0.5 hover:bg-amber-400"
                >
                  Découvrir les jeux
                </Link>
                <Link
                  href="/jeux/fanorina-7"
                  className="rounded-2xl border border-slate-600 px-6 py-3.5 text-lg font-semibold text-slate-200 transition-colors hover:bg-slate-800"
                >
                  Jouer à Fanorina 7
                </Link>
              </div>
            </div>

            <div className="relative hidden md:block" aria-hidden="true">
              <div className="grid grid-cols-2 gap-4">
                <div className="mt-8 rotate-[-4deg] rounded-3xl border border-slate-700 bg-slate-900 p-5 shadow-2xl">
                  <p className="text-4xl">🎲</p>
                  <p className="mt-3 font-bold">Fanorina 7</p>
                  <p className="text-sm text-slate-400">2 à 4 joueurs · stratégie</p>
                </div>
                <div className="rotate-[3deg] rounded-3xl border border-slate-700 bg-slate-900 p-5 shadow-2xl">
                  <p className="text-4xl">🏝️</p>
                  <p className="mt-3 font-bold">Fanorona</p>
                  <p className="text-sm text-slate-400">2 joueurs · classique malgache</p>
                </div>
                <div className="rotate-[2deg] rounded-3xl border border-slate-700 bg-slate-900 p-5 shadow-2xl">
                  <p className="text-4xl">🏦</p>
                  <p className="mt-3 font-bold">Monopoly Premium</p>
                  <p className="text-sm text-slate-400">2 à 8 joueurs · gestion</p>
                </div>
                <div className="-mt-4 rotate-[-3deg] rounded-3xl border border-dashed border-slate-600 bg-slate-900/50 p-5 shadow-2xl">
                  <p className="text-4xl">✨</p>
                  <p className="mt-3 font-bold text-slate-300">Et bientôt…</p>
                  <p className="text-sm text-slate-500">De nouveaux jeux arrivent.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Concept */}
        <section className="border-y border-slate-800 bg-slate-900/50">
          <div className="mx-auto max-w-3xl px-4 py-14 text-center sm:px-6">
            <h2 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
              Un appareil, plusieurs joueurs, zéro friction
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-slate-300">
              PlayBoard est une plateforme de jeux <strong>multijoueurs en local</strong> : tout le
              monde est autour du même écran et joue à tour de rôle. Pas de compte à créer, pas de
              connexion compliquée — on se passe l&apos;appareil, et la plateforme gère les tours,
              les règles et le score.
            </p>
          </div>
        </section>

        {/* Jeux mis en avant */}
        <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <div className="mb-8 flex items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl font-extrabold tracking-tight sm:text-3xl">Jeux à la une</h2>
              <p className="mt-2 text-slate-400">
                Sélectionnés pour démarrer une partie rapidement.
              </p>
            </div>
            <Link
              href="/jeux"
              className="hidden shrink-0 rounded-xl border border-slate-600 px-4 py-2 text-sm font-semibold hover:bg-slate-800 sm:block"
            >
              Tout le catalogue →
            </Link>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((g) => (
              <GameCard key={g.slug} game={g} />
            ))}
          </div>
        </section>

        {/* Comment jouer */}
        <section className="border-y border-slate-800 bg-slate-900/50">
          <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
            <h2 className="text-center text-2xl font-extrabold tracking-tight sm:text-3xl">
              Comment ça marche ?
            </h2>
            <p className="mx-auto mt-2 max-w-xl text-center text-slate-400">
              Quatre étapes, du choix du jeu à la victoire.
            </p>
            <ol className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {STEPS.map((s) => (
                <li
                  key={s.n}
                  className="relative rounded-2xl border border-slate-700/80 bg-slate-900 p-5"
                >
                  <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-amber-500 text-lg font-black text-slate-950">
                    {s.n}
                  </span>
                  <h3 className="mt-3 font-bold">{s.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-slate-400">{s.text}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* Avantages */}
        <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <h2 className="text-center text-2xl font-extrabold tracking-tight sm:text-3xl">
            Pourquoi PlayBoard ?
          </h2>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {ADVANTAGES.map((a) => (
              <div
                key={a.title}
                className="rounded-2xl border border-slate-700/80 bg-slate-900 p-5 text-center"
              >
                <span className="text-3xl" aria-hidden="true">
                  {a.icon}
                </span>
                <h3 className="mt-3 font-bold">{a.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-slate-400">{a.text}</p>
              </div>
            ))}
          </div>
          <div className="mt-12 text-center">
            <Link
              href="/jeux"
              className="inline-block rounded-2xl bg-amber-500 px-8 py-4 text-lg font-bold text-slate-950 shadow-lg shadow-amber-900/40 transition-all hover:-translate-y-0.5 hover:bg-amber-400"
            >
              Choisir un jeu
            </Link>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
