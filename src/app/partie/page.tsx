import { Suspense } from "react";
import GameScreen from "@/components/GameScreen";

export default function PartiePage() {
  return (
    <Suspense
      fallback={
        <p className="p-8 text-slate-300">Chargement de la partie…</p>
      }
    >
      <GameScreen />
    </Suspense>
  );
}
