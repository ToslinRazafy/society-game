"use client";

import { EDGES, NODES, nodePoint, NodeId } from "@/game/board";
import { Move, Stone } from "@/game/engine";

const CELL = 100;
const R_STONE = 34;
const R_NODE = 7;
const VIEW = "-70 -70 740 740";

// Les 5 carrés du plateau (origines en coordonnées de grille)
const SQUARES: Array<[number, number]> = [
  [2, 0],
  [4, 2],
  [2, 4],
  [0, 2],
  [2, 2],
];

interface Props {
  stones: Partial<Record<NodeId, Stone>>;
  colors: string[];
  selected: NodeId | null;
  moves: Move[];
  lastCapture: NodeId | null;
  interactive: boolean;
  onNodeClick: (id: NodeId) => void;
}

export default function BoardSVG({
  stones,
  colors,
  selected,
  moves,
  lastCapture,
  interactive,
  onNodeClick,
}: Props) {
  const pos = (id: NodeId) => {
    const p = nodePoint(id);
    return { cx: p.x * CELL, cy: p.y * CELL };
  };
  return (
    <svg
      viewBox={VIEW}
      className="w-full h-auto max-h-[78vh] select-none touch-manipulation"
      role="img"
      aria-label="Plateau Fanorina 7"
    >
      {/* fond : croix de 5 carrés */}
      {SQUARES.map(([x, y]) => (
        <rect
          key={`${x}-${y}`}
          x={x * CELL}
          y={y * CELL}
          width={2 * CELL}
          height={2 * CELL}
          fill="#1e293b"
          stroke="#475569"
          strokeWidth={4}
        />
      ))}
      {/* lignes de déplacement */}
      {EDGES.map(([a, b]) => {
        const pa = pos(a);
        const pb = pos(b);
        return (
          <line
            key={`${a}-${b}`}
            x1={pa.cx}
            y1={pa.cy}
            x2={pb.cx}
            y2={pb.cy}
            stroke="#94a3b8"
            strokeWidth={3}
          />
        );
      })}
      {/* nœuds (positions) */}
      {NODES.map((id) => {
        const { cx, cy } = pos(id);
        return <circle key={id} cx={cx} cy={cy} r={R_NODE} fill="#cbd5e1" />;
      })}
      {/* fantôme de la dernière pierre capturée */}
      {lastCapture !== null && !stones[lastCapture] && (
        <circle
          {...pos(lastCapture)}
          r={R_STONE}
          fill="#ef4444"
          className="f7-capture-ghost"
          pointerEvents="none"
        />
      )}
      {/* destinations : normal = pastille verte, capture = anneau rouge */}
      {moves.map((m) => {
        const { cx, cy } = pos(m.to);
        return m.type === "normal" ? (
          <circle key={`mv-${m.to}`} cx={cx} cy={cy} r={14} fill="#4ade80" opacity={0.85} />
        ) : (
          <circle
            key={`mv-${m.to}`}
            cx={cx}
            cy={cy}
            r={R_STONE + 8}
            fill="none"
            stroke="#ef4444"
            strokeWidth={5}
            strokeDasharray="10 8"
            className="f7-pulse"
          />
        );
      })}
      {/* pierres capturables signalées */}
      {moves
        .filter((m) => m.type === "capture")
        .map((m) => {
          const { cx, cy } = pos(m.captured!);
          return (
            <circle
              key={`cap-${cx}-${cy}`}
              cx={cx}
              cy={cy}
              r={R_STONE + 6}
              fill="none"
              stroke="#f87171"
              strokeWidth={4}
              pointerEvents="none"
            />
          );
        })}
      {/* pierres (clé = identité stable → transition CSS au déplacement) */}
      {NODES.filter((n) => stones[n]).map((id) => {
        const stone = stones[id]!;
        const { cx, cy } = pos(id);
        return (
          <g
            key={stone.id}
            className="f7-stone"
            style={{ transform: `translate(${cx}px, ${cy}px)` }}
          >
            <circle r={R_STONE} fill={colors[stone.player]} stroke="#0f172a" strokeWidth={3} />
            <circle r={R_STONE - 10} fill="rgba(255,255,255,0.18)" cy={-6} />
            {selected === id && (
              <circle r={R_STONE + 7} fill="none" stroke="#f8fafc" strokeWidth={5} />
            )}
          </g>
        );
      })}
      {/* zones cliquables */}
      {interactive &&
        NODES.map((id) => {
          const { cx, cy } = pos(id);
          return (
            <circle
              key={`hit-${id}`}
              cx={cx}
              cy={cy}
              r={46}
              fill="transparent"
              className="cursor-pointer"
              onClick={() => onNodeClick(id)}
            />
          );
        })}
    </svg>
  );
}
