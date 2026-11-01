// Générateurs contrôlables : aléatoire semé (mélange des paquets) et dés.
// Implémentation générique déplacée dans src/lib/rng.ts (ADR-0009) ;
// shim de ré-export pour préserver les imports existants du Monopoly.

export { makeRng, shuffle, rollDice, type Rng } from "@/lib/rng";
