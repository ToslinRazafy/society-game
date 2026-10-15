// Préférences persistées en localStorage. Les animations sont lues par le
// plateau 3D (Board3D) au montage — plus de classes DOM depuis la 2D SVG.

const ANIMATIONS_KEY = "f7-animations";

export function animationsEnabled(): boolean {
  return typeof window === "undefined" || localStorage.getItem(ANIMATIONS_KEY) !== "off";
}

export function setAnimationsEnabled(enabled: boolean): void {
  localStorage.setItem(ANIMATIONS_KEY, enabled ? "on" : "off");
}
