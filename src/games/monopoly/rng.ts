// Générateurs contrôlables : aléatoire semé (mélange des paquets) et dés.
// Séparé du moteur pour rester testable et déterministe.

export type Rng = () => number; // [0,1)

/** mulberry32 : PRNG semé, reproductible en tests. */
export function makeRng(seed: number): Rng {
  let a = seed >>> 0;
  return () => {
    a += 0x6d2b79f5;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function shuffle<T>(arr: T[], rng: Rng): T[] {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [out[i], out[j]] = [out[j]!, out[i]!];
  }
  return out;
}

export function rollDice(rng: Rng): [number, number] {
  const d = () => 1 + Math.floor(rng() * 6);
  return [d(), d()];
}
