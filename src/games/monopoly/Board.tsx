"use client";

// Rendu du plateau 40 cases — CSS grid 11×11, aucune logique de jeu ici.
import { GROUP_COLORS, SPACES } from "./board-data";
import type { GameState } from "./state";

// Position dans la grille (1-based) pour chaque index de case, sens horaire
// à partir de Départ en bas à droite.
function gridPos(index: number): { row: number; col: number; side: "bottom" | "left" | "top" | "right" } {
  if (index <= 10) return { row: 11, col: 11 - index, side: "bottom" };
  if (index <= 20) return { row: 11 - (index - 10), col: 1, side: "left" };
  if (index <= 30) return { row: 1, col: index - 20 + 1, side: "top" };
  return { row: index - 30 + 1, col: 11, side: "right" };
}

function Cell({ s, index, onClick }: { s: GameState; index: number; onClick?: (i: number) => void }) {
  const space = SPACES[index]!;
  const prop = s.props[index]!;
  const { row, col, side } = gridPos(index);
  const isCorner = index % 10 === 0;
  const occupants = s.players.filter((p) => !p.bankrupt && p.position === index);
  const currentHere = occupants.some((p) => p.id === s.players[s.current]!.id);

  const groupColor = space.group ? GROUP_COLORS[space.group] : undefined;
  const band = groupColor ? (
    <div
      className={`absolute ${side === "bottom" || side === "top" ? "inset-x-0 top-0 h-[18%]" : "inset-y-0 left-0 w-[18%]"}`}
      style={{ background: groupColor }}
    />
  ) : null;

  return (
    <button
      type="button"
      onClick={() => onClick?.(index)}
      className={`relative overflow-hidden border border-black/25 bg-[#cfe8d2] text-left ${
        currentHere ? "ring-2 ring-amber-500" : ""
      } ${onClick ? "cursor-pointer hover:brightness-105" : "cursor-default"}`}
      style={{ gridRow: row, gridColumn: col }}
      aria-label={space.fullName}
    >
      {band}
      <div
        className={`flex h-full flex-col ${
          side === "bottom" || side === "top" ? `px-1 pt-[20%] ${side === "bottom" ? "pb-1" : "pb-1"}` : "p-1 pl-[20%]"
        }`}
      >
        <p className={`leading-tight text-[#123d24] ${isCorner ? "text-[9px] sm:text-[11px] font-bold" : "text-[7px] sm:text-[9px] font-semibold"}`}>
          {space.name}
        </p>
        {space.price !== undefined && (
          <p className="text-[6px] sm:text-[8px] text-[#123d24]/70">{space.price} F</p>
        )}
        {prop.owner !== null && (
          <div className="absolute bottom-0.5 left-0.5 flex items-center gap-0.5">
            <span className="block h-1.5 w-1.5 rounded-full" style={{ background: TOKEN_COLORS[prop.owner % TOKEN_COLORS.length] }} />
            {prop.mortgaged && <span className="text-[6px] sm:text-[8px] text-rose-700 font-bold">H</span>}
          </div>
        )}
        {prop.houses > 0 && (
          <span
            className={`absolute ${side === "left" || side === "right" ? "right-0.5 top-1/2 -translate-y-1/2" : "bottom-0.5 right-0.5"} text-[7px] sm:text-[9px] font-bold text-emerald-800`}
          >
            {prop.houses === 5 ? "▲" : "■".repeat(prop.houses)}
          </span>
        )}
        {occupants.length > 0 && (
          <div className="absolute inset-x-0.5 top-0.5 flex flex-wrap gap-0.5 sm:top-1">
            {occupants.map((p) => (
              <span key={p.id} className="h-1.5 w-1.5 rounded-full ring-1 ring-black/30 sm:h-2 sm:w-2" style={{ background: TOKEN_COLORS[s.players.indexOf(p) % TOKEN_COLORS.length] }} />
            ))}
          </div>
        )}
      </div>
    </button>
  );
}

// 8 couleurs de pions, distinctes des couleurs de groupes de rues.
export const TOKEN_COLORS = [
  "#E4002B",
  "#00A651",
  "#009CDE",
  "#F6EB61",
  "#FF8200",
  "#6C3FA0",
  "#0072BB",
  "#EC008C",
];

export default function Board({ s, onCellClick }: { s: GameState; onCellClick?: (i: number) => void }) {
  return (
    <div
      className="aspect-square w-full max-w-[min(96vw,70vh)] rounded-lg border-4 border-[#0b2e1a] bg-[#a8d5b3] p-0.5 shadow-xl"
      style={{ display: "grid", gridTemplateColumns: "repeat(11,1fr)", gridTemplateRows: "repeat(11,1fr)" }}
    >
      {SPACES.map((_, i) => (
        <Cell key={i} s={s} index={i} onClick={onCellClick} />
      ))}
      {/* zone centrale */}
      <div
        className="flex items-center justify-center bg-[#0b2e1a]/90 text-[#f5e6b8]"
        style={{ gridRow: "2 / 11", gridColumn: "2 / 11" }}
      >
        <div className="rotate-[10deg] px-2 text-center">
          <p className="text-lg font-black tracking-[0.2em] sm:text-3xl">MONOPOLY</p>
          <p className="text-[10px] uppercase tracking-widest sm:text-xs">édition française</p>
        </div>
      </div>
    </div>
  );
}
