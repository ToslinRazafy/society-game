// Registre central des jeux de la plateforme : source de vérité du catalogue,
// des pages /jeux/[jeu] et des filtres. Un nouveau jeu = une entrée ici +
// son dossier dans src/games/<slug>/ (moteur, rendu, configuration).

export type GameStatus = "live" | "soon";

export interface GameMeta {
  slug: string;
  name: string;
  tagline: string;
  description: string;
  illustration: string | null;
  players: { min: number; max: number };
  duration: string;
  category: string;
  status: GameStatus;
  featured: boolean;
  rulesPath?: string;
}

export const GAMES: readonly GameMeta[] = [
  {
    slug: "fanorina-7",
    name: "Fanorina 7",
    tagline: "7 pierres par joueur. Dernier en jeu gagné.",
    description:
      "Jeu de stratégie inspiré des plateaux à déplacements de pierres : glissez, sautez par-dessus un adversaire pour l'éliminer, et enchaînez les captures avec la même pierre. 2 à 4 joueurs sur le même appareil.",
    illustration: "/assets/fanorina-7-plateau-reference.png",
    players: { min: 2, max: 4 },
    duration: "10–20 min",
    category: "Stratégie",
    status: "live",
    featured: true,
    rulesPath: "/regles",
  },
  {
    slug: "fanorona",
    name: "Fanorona",
    tagline: "Le jeu national malgache, version 9×5.",
    description:
      "45 intersections, 22 pions chacun, et deux façons de capturer : par approche et par retrait. Un classique absolu de stratégie abstraite, en préparation sur la plateforme.",
    illustration: null,
    players: { min: 2, max: 2 },
    duration: "20–45 min",
    category: "Stratégie",
    status: "soon",
    featured: true,
  },
  {
    slug: "monopoly",
    name: "Monopoly Premium",
    tagline: "Achetez, construisez, négociez — et faites faillir vos adversaires.",
    description:
      "Le plateau 40 cases complet : propriétés, gares, enchères, maisons, hôtels, cartes Chance et Caisse de communauté. De 2 à 8 joueurs, en local sur le même appareil.",
    illustration: "/assets/monopoly-plateau.svg",
    players: { min: 2, max: 8 },
    duration: "60–120 min",
    category: "Gestion",
    status: "live",
    featured: true,
    rulesPath: "/regles/monopoly",
  },
];

export function getGame(slug: string): GameMeta | undefined {
  return GAMES.find((g) => g.slug === slug);
}

export function categories(): string[] {
  return [...new Set(GAMES.map((g) => g.category))];
}
