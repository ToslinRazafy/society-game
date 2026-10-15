import { Suspense, type ReactElement } from "react";
import { notFound } from "next/navigation";
import GameScreen from "@/games/fanorina-7/GameScreen";
import { getGame } from "@/games/registry";

// Chaque jeu live fournit son propre écran de partie ; on le relie ici au
// registre (un seul jeu jouable à ce jour).
const PLAY_SCREENS: Record<string, () => ReactElement> = {
  "fanorina-7": () => <GameScreen />,
};

async function Partie({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const game = getGame(slug);
  const screen = game?.status === "live" ? PLAY_SCREENS[slug] : undefined;
  if (!screen) notFound();
  return screen();
}

export default function PartiePage({ params }: { params: Promise<{ slug: string }> }) {
  return (
    <Suspense fallback={<p className="p-8 text-slate-300">Chargement de la partie…</p>}>
      <Partie params={params} />
    </Suspense>
  );
}
