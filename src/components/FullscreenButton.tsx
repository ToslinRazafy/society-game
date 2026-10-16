"use client";

// Bouton de bascule vers le plein écran natif du navigateur. Se masque
// automatiquement si l'API n'est pas disponible.
import { useFullscreen } from "@/lib/use-fullscreen";

export default function FullscreenButton({ className = "" }: { className?: string }) {
  const { isFullscreen, supported, toggle } = useFullscreen();
  if (!supported) return null;

  const label = isFullscreen ? "Quitter le plein écran" : "Passer en plein écran";
  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={isFullscreen}
      aria-label={label}
      title={`${label} (Échap pour quitter)`}
      className={`inline-flex items-center gap-2 rounded-xl border border-slate-600 bg-slate-900/70 px-3 py-2 text-sm font-semibold text-slate-200 transition-colors hover:border-slate-500 hover:bg-slate-800 ${className}`}
    >
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.9"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        {isFullscreen ? (
          <path d="M4 14h6v6M20 10h-6V4M14 10l7-7M3 21l7-7" />
        ) : (
          <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
        )}
      </svg>
      <span className="hidden sm:inline">{isFullscreen ? "Réduire" : "Plein écran"}</span>
    </button>
  );
}
