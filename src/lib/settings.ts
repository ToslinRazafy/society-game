// Préférences persistées en localStorage, appliquées via classes DOM pour
// éviter tout setState dans un effet de rendu (règle react-hooks).

const ANIMATIONS_KEY = "f7-animations";

export function animationsEnabled(): boolean {
  return typeof window === "undefined" || localStorage.getItem(ANIMATIONS_KEY) !== "off";
}

export function applyAnimations(enabled: boolean): void {
  document.documentElement.classList.toggle("f7-no-anim", !enabled);
}

export function setAnimationsEnabled(enabled: boolean): void {
  localStorage.setItem(ANIMATIONS_KEY, enabled ? "on" : "off");
  applyAnimations(enabled);
}
