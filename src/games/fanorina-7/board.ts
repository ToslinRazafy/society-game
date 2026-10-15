// Graphe du plateau Fanorina 7 — extrait fidèlement du dessin de référence
// (public/assets/fanorina-7-plateau-reference.png, validé via ADR-0002).
// Croix de 5 carrés (bras top/right/bottom/left + carré central vide),
// chaque carré = 3×3 nœuds. Le point central (3,3) n'a aucune connexion.

export const GRID = 7;

export type NodeId = number; // index = y * GRID + x
export type Zone = "top" | "right" | "bottom" | "left";

export interface Point {
  x: number;
  y: number;
}

export const nodeId = (x: number, y: number): NodeId => y * GRID + x;
export const nodePoint = (id: NodeId): Point => ({
  x: id % GRID,
  y: Math.floor(id / GRID),
});

const ARM_ORIGINS: Record<Zone, Point> = {
  top: { x: 2, y: 0 },
  right: { x: 4, y: 2 },
  bottom: { x: 2, y: 4 },
  left: { x: 0, y: 2 },
};

export const ZONES = Object.keys(ARM_ORIGINS) as Zone[];

function inSquare(p: Point, origin: Point): boolean {
  return (
    p.x >= origin.x && p.x <= origin.x + 2 && p.y >= origin.y && p.y <= origin.y + 2
  );
}

// Le carré central (origine 2,2) contient des nœuds, mais AUCUNE de ses lignes
// intérieures n'existe : seul le point (3,3) est exclu du plateau jouable,
// les autres nœuds du périmètre central appartiennent aux bras.
export function isPlayable(x: number, y: number): boolean {
  if (x === 3 && y === 3) return false;
  const p = { x, y };
  return (
    inSquare(p, ARM_ORIGINS.top) ||
    inSquare(p, ARM_ORIGINS.right) ||
    inSquare(p, ARM_ORIGINS.bottom) ||
    inSquare(p, ARM_ORIGINS.left)
  );
}

export const NODES: NodeId[] = (() => {
  const ids: NodeId[] = [];
  for (let y = 0; y < GRID; y++)
    for (let x = 0; x < GRID; x++) if (isPlayable(x, y)) ids.push(nodeId(x, y));
  return ids;
})();

// Arêtes dédupliquées (paire triée) — construites uniquement depuis les 4 bras.
function buildEdges(): Array<[NodeId, NodeId]> {
  const seen = new Set<string>();
  const edges: Array<[NodeId, NodeId]> = [];
  const add = (a: NodeId, b: NodeId) => {
    const key = a < b ? `${a}-${b}` : `${b}-${a}`;
    if (!seen.has(key)) {
      seen.add(key);
      edges.push([Math.min(a, b), Math.max(a, b)]);
    }
  };
  for (const origin of Object.values(ARM_ORIGINS)) {
    const { x: ox, y: oy } = origin;
    // lignes horizontales (3 par bras) et verticales (3 par bras)
    for (let y = oy; y <= oy + 2; y++)
      for (let x = ox; x <= ox + 1; x++) add(nodeId(x, y), nodeId(x + 1, y));
    for (let x = ox; x <= ox + 2; x++)
      for (let y = oy; y <= oy + 1; y++) add(nodeId(x, y), nodeId(x, y + 1));
    // les 2 diagonales principales, via le centre du bras
    const c = nodeId(ox + 1, oy + 1);
    for (const cx of [ox, ox + 2])
      for (const cy of [oy, oy + 2]) add(nodeId(cx, cy), c);
  }
  return edges;
}

export const EDGES: Array<[NodeId, NodeId]> = buildEdges();

export const ADJACENCY: ReadonlyMap<NodeId, readonly NodeId[]> = (() => {
  const m = new Map<NodeId, NodeId[]>();
  for (const id of NODES) m.set(id, []);
  for (const [a, b] of EDGES) {
    m.get(a)!.push(b);
    m.get(b)!.push(a);
  }
  return m;
})();

export function areAdjacent(a: NodeId, b: NodeId): boolean {
  return ADJACENCY.get(a)?.includes(b) ?? false;
}

export function neighbors(id: NodeId): readonly NodeId[] {
  return ADJACENCY.get(id) ?? [];
}

// Les 4 coins du carré central ne sont le départ d'aucun joueur :
// chaque bras occupe ses 9 nœuds SAUF ceux qui sont coins du carré central.
const CENTER_CORNERS = new Set([nodeId(2, 2), nodeId(4, 2), nodeId(2, 4), nodeId(4, 4)]);

export const START_NODES: Record<Zone, NodeId[]> = Object.fromEntries(
  ZONES.map((zone) => {
    const o = ARM_ORIGINS[zone];
    const nodes: NodeId[] = [];
    for (let y = o.y; y <= o.y + 2; y++)
      for (let x = o.x; x <= o.x + 2; x++) {
        const id = nodeId(x, y);
        if (!CENTER_CORNERS.has(id)) nodes.push(id);
      }
    return [zone, nodes];
  }),
) as Record<Zone, NodeId[]>;

export function zoneOf(id: NodeId): Zone | "center" {
  const p = nodePoint(id);
  for (const [zone, o] of Object.entries(ARM_ORIGINS) as Array<[Zone, Point]>) {
    if (inSquare(p, o) && !(p.x === 3 && p.y === 3)) {
      // un nœud de périmètre partagé appartient au premier bras trouvé ;
      // utile seulement pour le rendu, jamais pour les règles
      return zone;
    }
  }
  return "center";
}
