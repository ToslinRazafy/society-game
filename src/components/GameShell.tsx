"use client";

// Enveloppe des écrans de partie : mode immersif plein viewport (chrome du site
// masqué, plateau maximal) + barre d'outils homogène (retour, statut, plein
// écran natif, sortie). Purement présentationnel : la logique de jeu reste dans
// chaque écran.
import Link from "next/link";
import type { ReactNode } from "react";
import FullscreenButton from "@/components/FullscreenButton";

interface Props {
  title: string;
  /** Classe Tailwind de couleur du titre (cohérence par jeu). */
  accent?: string;
  /** Message d'état du tour, annoncé aux lecteurs d'écran. */
  status?: ReactNode;
  onRestart?: () => void;
  onQuit: () => void;
  children: ReactNode;
}

export default function GameShell({
  title,
  accent = "text-amber-300",
  status,
  onRestart,
  onQuit,
  children,
}: Props) {
  return (
    <div className="flex min-h-[100dvh] flex-col bg-slate-950 lg:h-[100dvh] lg:overflow-hidden">
      <header className="flex shrink-0 items-center gap-2 border-b border-slate-800 bg-slate-950/90 px-2 py-2 backdrop-blur sm:gap-3 sm:px-4">
        <Link
          href="/jeux"
          aria-label="Retour au catalogue"
          title="Retour au catalogue"
          className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-slate-700 text-slate-300 transition-colors hover:bg-slate-800 hover:text-white"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
        </Link>

        <h1 className={`shrink-0 text-base font-black tracking-tight sm:text-lg ${accent}`}>
          {title}
        </h1>

        <div className="ml-auto flex items-center gap-2">
          {onRestart && (
            <button
              type="button"
              onClick={onRestart}
              aria-label="Recommencer la partie"
              title="Recommencer la partie"
              className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-700 text-slate-300 transition-colors hover:bg-slate-800 hover:text-white sm:h-auto sm:w-auto sm:gap-2 sm:border-slate-600 sm:px-3 sm:py-2 sm:text-sm sm:font-semibold sm:text-slate-200"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M3 3v5h5M3.05 13A9 9 0 1 0 6 5.3L3 8" />
              </svg>
              <span className="hidden sm:inline">Recommencer</span>
            </button>
          )}
          <FullscreenButton />
          <button
            type="button"
            onClick={onQuit}
            className="rounded-xl border border-slate-600 px-3 py-2 text-sm font-semibold text-slate-200 transition-colors hover:border-rose-500/60 hover:bg-rose-950/40 hover:text-rose-100"
          >
            Quitter
          </button>
        </div>
      </header>

      {status && (
        <p
          className="shrink-0 border-b border-slate-800/70 bg-slate-900/40 px-3 py-2 text-sm text-slate-200 sm:px-4"
          aria-live="polite"
        >
          {status}
        </p>
      )}

      <div className="flex min-h-0 flex-1 flex-col gap-3 p-2 sm:p-3 lg:flex-row">
        {children}
      </div>
    </div>
  );
}
