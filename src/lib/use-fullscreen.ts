"use client";

// Accès à la Fullscreen API du navigateur (plein écran natif). Le module est
// purement présentationnel : il ne touche ni au moteur ni à l'état des parties.
// Les variantes préfixées `webkit` sont conservées pour les navigateurs qui
// n'exposent encore que celles-ci.

import { useCallback, useSyncExternalStore } from "react";

interface FullscreenDocument {
  fullscreenElement?: Element | null;
  fullscreenEnabled?: boolean;
  exitFullscreen?: () => Promise<void> | void;
  webkitFullscreenElement?: Element | null;
  webkitFullscreenEnabled?: boolean;
  webkitExitFullscreen?: () => Promise<void> | void;
}

interface FullscreenElement {
  requestFullscreen?: () => Promise<void> | void;
  webkitRequestFullscreen?: () => Promise<void> | void;
}

function fsDocument(): FullscreenDocument {
  return document as unknown as FullscreenDocument;
}

function currentElement(doc: FullscreenDocument): Element | null {
  return doc.fullscreenElement ?? doc.webkitFullscreenElement ?? null;
}

function isSupported(doc: FullscreenDocument): boolean {
  return Boolean(doc.fullscreenEnabled ?? doc.webkitFullscreenEnabled);
}

/**
 * Demande le plein écran natif (best-effort). À appeler depuis un geste
 * utilisateur, par ex. au lancement d'une partie — le plein écran persiste
 * pendant la navigation côté client vers l'écran de jeu.
 */
export function requestFullscreen(): void {
  if (typeof document === "undefined") return;
  const doc = fsDocument();
  if (currentElement(doc)) return;
  const el = document.documentElement as unknown as FullscreenElement;
  const enter = el.requestFullscreen ?? el.webkitRequestFullscreen;
  try {
    void enter?.call(el);
  } catch {
    // Certains navigateurs refusent la requête : on ignore silencieusement.
  }
}

// Snapshot sérialisé ("plein écran:compatible") : référentiellement stable tant
// que l'état externe ne change pas, ce qui évite les boucles de rendu.
function snapshot(): string {
  if (typeof document === "undefined") return "0:0";
  const doc = fsDocument();
  return `${currentElement(doc) ? "1" : "0"}:${isSupported(doc) ? "1" : "0"}`;
}

function serverSnapshot(): string {
  return "0:0";
}

function subscribe(onStoreChange: () => void): () => void {
  document.addEventListener("fullscreenchange", onStoreChange);
  document.addEventListener("webkitfullscreenchange", onStoreChange);
  return () => {
    document.removeEventListener("fullscreenchange", onStoreChange);
    document.removeEventListener("webkitfullscreenchange", onStoreChange);
  };
}

export interface UseFullscreen {
  /** Vrai lorsque la page est affichée en plein écran natif. */
  isFullscreen: boolean;
  /** Faux si le navigateur ne prend pas en charge l'API (le bouton se masque). */
  supported: boolean;
  /** Bascule plein écran ↔ fenêtre. */
  toggle: () => void;
}

export function useFullscreen(): UseFullscreen {
  const state = useSyncExternalStore(subscribe, snapshot, serverSnapshot);
  const [fullscreenFlag, supportedFlag] = state.split(":");

  const toggle = useCallback(() => {
    const doc = fsDocument();
    const el = document.documentElement as unknown as FullscreenElement;
    try {
      if (currentElement(doc)) {
        const exit = doc.exitFullscreen ?? doc.webkitExitFullscreen;
        void exit?.call(doc);
      } else {
        const enter = el.requestFullscreen ?? el.webkitRequestFullscreen;
        void enter?.call(el);
      }
    } catch {
      // Certains navigateurs refusent la requête (geste utilisateur manquant,
      // contexte non autorisé) : on ignore silencieusement.
    }
  }, []);

  return {
    isFullscreen: fullscreenFlag === "1",
    supported: supportedFlag === "1",
    toggle,
  };
}
