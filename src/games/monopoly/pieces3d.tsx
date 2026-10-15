"use client";

// Pièces 3D procédurales — Monopoly (ADR-0008) : primitives three.js uniquement.
// Buildings de rue, et 8 pions low-poly reconnaissables, teintés TOKEN_COLORS.
import type { JSX } from "react";
import { GROUP_COLORS } from "./board-data";
import type { ColorGroup } from "./types";

const GREEN = "#1fb25a";
const ROOF = "#c1121f";

export function House3D({ position, color = GREEN }: { position: [number, number, number]; color?: string }) {
  return (
    <group position={position}>
      <mesh castShadow position={[0, 0.09, 0]}>
        <boxGeometry args={[0.2, 0.18, 0.2]} />
        <meshStandardMaterial color={color} roughness={0.6} />
      </mesh>
      <mesh castShadow position={[0, 0.23, 0]} rotation={[0, Math.PI / 4, 0]}>
        <coneGeometry args={[0.17, 0.12, 4]} />
        <meshStandardMaterial color={ROOF} roughness={0.6} />
      </mesh>
    </group>
  );
}

export function Hotel3D({ position, color = ROOF }: { position: [number, number, number]; color?: string }) {
  return (
    <group position={position}>
      <mesh castShadow position={[0, 0.11, 0]}>
        <boxGeometry args={[0.42, 0.22, 0.24]} />
        <meshStandardMaterial color={color} roughness={0.6} />
      </mesh>
      <mesh castShadow position={[0, 0.27, 0]}>
        <boxGeometry args={[0.46, 0.1, 0.28]} />
        <meshStandardMaterial color="#f7f3e3" roughness={0.7} />
      </mesh>
    </group>
  );
}

// Une rangée de constructions sur la bande colorée d'une case.
export function BuildingRow({
  x,
  z,
  rotY,
  houses,
  group,
}: {
  x: number;
  z: number;
  rotY: number;
  houses: number;
  group: ColorGroup;
}) {
  const color = GROUP_COLORS[group];
  if (houses === 5) {
    return (
      <group position={[x, 0.1, z]} rotation={[0, rotY, 0]}>
        <Hotel3D position={[0, 0, 0]} color={color} />
      </group>
    );
  }
  const n = houses; // 1..4
  return (
    <group position={[x, 0.1, z]} rotation={[0, rotY, 0]}>
      {Array.from({ length: n }, (_, i) => (
        <House3D key={i} position={[(i - (n - 1) / 2) * 0.26, 0, 0]} color={color} />
      ))}
    </group>
  );
}

// Pions — assemblages low-poly, base disque teintée couleur du joueur.
function Base({ color }: { color: string }) {
  return (
    <mesh castShadow position={[0, 0.02, 0]}>
      <cylinderGeometry args={[0.2, 0.22, 0.04, 20]} />
      <meshStandardMaterial color={color} roughness={0.35} metalness={0.25} />
    </mesh>
  );
}

const METAL = { roughness: 0.3, metalness: 0.4 };

function Dog({ color }: { color: string }) {
  return (
    <group>
      <mesh castShadow position={[0, 0.14, 0]}>
        <boxGeometry args={[0.14, 0.1, 0.26]} />
        <meshStandardMaterial color={color} {...METAL} />
      </mesh>
      <mesh castShadow position={[0, 0.22, 0.15]}>
        <boxGeometry args={[0.11, 0.11, 0.11]} />
        <meshStandardMaterial color={color} {...METAL} />
      </mesh>
      <mesh position={[0, 0.3, 0.15]} rotation={[0.4, 0, 0]}>
        <coneGeometry args={[0.05, 0.08, 4]} />
        <meshStandardMaterial color={color} {...METAL} />
      </mesh>
      {[[-0.05, -0.09], [0.05, -0.09], [-0.05, 0.09], [0.05, 0.09]].map(([px, pz], i) => (
        <mesh key={i} position={[px, 0.06, pz]}>
          <cylinderGeometry args={[0.025, 0.025, 0.09, 8]} />
          <meshStandardMaterial color={color} {...METAL} />
        </mesh>
      ))}
      <mesh position={[0, 0.18, -0.16]} rotation={[-0.7, 0, 0]}>
        <cylinderGeometry args={[0.018, 0.018, 0.12, 8]} />
        <meshStandardMaterial color={color} {...METAL} />
      </mesh>
    </group>
  );
}

function Cat({ color }: { color: string }) {
  return (
    <group>
      <mesh castShadow position={[0, 0.15, 0]}>
        <capsuleGeometry args={[0.07, 0.12, 4, 12]} />
        <meshStandardMaterial color={color} {...METAL} />
      </mesh>
      <mesh castShadow position={[0, 0.3, 0.02]}>
        <sphereGeometry args={[0.075, 14, 12]} />
        <meshStandardMaterial color={color} {...METAL} />
      </mesh>
      {[-0.045, 0.045].map((px, i) => (
        <mesh key={i} position={[px, 0.38, 0.02]}>
          <coneGeometry args={[0.028, 0.06, 4]} />
          <meshStandardMaterial color={color} {...METAL} />
        </mesh>
      ))}
      <mesh position={[0, 0.12, -0.14]} rotation={[-0.9, 0, 0]}>
        <cylinderGeometry args={[0.015, 0.015, 0.16, 8]} />
        <meshStandardMaterial color={color} {...METAL} />
      </mesh>
    </group>
  );
}

function MoneyBag({ color }: { color: string }) {
  return (
    <group>
      <mesh castShadow position={[0, 0.14, 0]}>
        <sphereGeometry args={[0.13, 16, 14]} />
        <meshStandardMaterial color={color} roughness={0.6} metalness={0.1} />
      </mesh>
      <mesh position={[0, 0.26, 0]}>
        <cylinderGeometry args={[0.045, 0.07, 0.06, 12]} />
        <meshStandardMaterial color={color} roughness={0.6} metalness={0.1} />
      </mesh>
      <mesh position={[0, 0.31, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.045, 0.014, 8, 20]} />
        <meshStandardMaterial color="#a8862a" roughness={0.4} metalness={0.5} />
      </mesh>
    </group>
  );
}

function TopHat({ color }: { color: string }) {
  return (
    <group>
      <mesh castShadow position={[0, 0.06, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.16, 0.035, 10, 24]} />
        <meshStandardMaterial color={color} {...METAL} />
      </mesh>
      <mesh castShadow position={[0, 0.18, 0]}>
        <cylinderGeometry args={[0.11, 0.12, 0.22, 20]} />
        <meshStandardMaterial color={color} {...METAL} />
      </mesh>
      <mesh position={[0, 0.12, 0]}>
        <cylinderGeometry args={[0.125, 0.125, 0.04, 20]} />
        <meshStandardMaterial color="#f7f3e3" roughness={0.5} />
      </mesh>
    </group>
  );
}

function Thimble({ color }: { color: string }) {
  return (
    <group>
      <mesh castShadow position={[0, 0.12, 0]}>
        <cylinderGeometry args={[0.09, 0.12, 0.16, 18]} />
        <meshStandardMaterial color={color} {...METAL} />
      </mesh>
      <mesh castShadow position={[0, 0.24, 0]}>
        <sphereGeometry args={[0.09, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color={color} {...METAL} />
      </mesh>
      <mesh position={[0, 0.05, 0]}>
        <cylinderGeometry args={[0.125, 0.125, 0.03, 18]} />
        <meshStandardMaterial color={color} {...METAL} />
      </mesh>
    </group>
  );
}

function Duck({ color }: { color: string }) {
  return (
    <group>
      <mesh castShadow position={[0, 0.13, -0.01]}>
        <sphereGeometry args={[0.12, 16, 14]} />
        <meshStandardMaterial color={color} roughness={0.4} metalness={0.1} />
      </mesh>
      <mesh castShadow position={[0, 0.28, 0.09]}>
        <sphereGeometry args={[0.07, 14, 12]} />
        <meshStandardMaterial color={color} roughness={0.4} metalness={0.1} />
      </mesh>
      <mesh position={[0, 0.28, 0.17]} rotation={[Math.PI / 2, 0, 0]}>
        <coneGeometry args={[0.035, 0.07, 8]} />
        <meshStandardMaterial color="#ff8200" roughness={0.5} />
      </mesh>
      <mesh position={[0, 0.12, -0.14]} rotation={[0.5, 0, 0]}>
        <coneGeometry args={[0.03, 0.09, 6]} />
        <meshStandardMaterial color={color} roughness={0.4} metalness={0.1} />
      </mesh>
    </group>
  );
}

function Car({ color }: { color: string }) {
  return (
    <group>
      <mesh castShadow position={[0, 0.1, 0]}>
        <boxGeometry args={[0.16, 0.07, 0.34]} />
        <meshStandardMaterial color={color} {...METAL} />
      </mesh>
      <mesh castShadow position={[0, 0.17, -0.02]}>
        <boxGeometry args={[0.13, 0.08, 0.16]} />
        <meshStandardMaterial color={color} {...METAL} />
      </mesh>
      {[[-0.09, 0.11], [0.09, 0.11], [-0.09, -0.11], [0.09, -0.11]].map(([px, pz], i) => (
        <mesh key={i} position={[px, 0.055, pz]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.045, 0.045, 0.03, 14]} />
          <meshStandardMaterial color="#1e293b" roughness={0.7} />
        </mesh>
      ))}
      {[[-0.05, 0.18], [0.05, 0.18]].map(([px, pz], i) => (
        <mesh key={i} position={[px, 0.1, pz]}>
          <sphereGeometry args={[0.022, 10, 8]} />
          <meshStandardMaterial color="#f5e6b8" emissive="#f5e6b8" emissiveIntensity={0.4} />
        </mesh>
      ))}
    </group>
  );
}

function Penguin({ color }: { color: string }) {
  return (
    <group>
      <mesh castShadow position={[0, 0.17, 0]}>
        <capsuleGeometry args={[0.09, 0.14, 4, 14]} />
        <meshStandardMaterial color="#111827" roughness={0.5} />
      </mesh>
      <mesh position={[0, 0.16, 0.075]}>
        <capsuleGeometry args={[0.055, 0.12, 4, 12]} />
        <meshStandardMaterial color="#f7f3e3" roughness={0.5} />
      </mesh>
      <mesh castShadow position={[0, 0.34, 0]}>
        <sphereGeometry args={[0.07, 14, 12]} />
        <meshStandardMaterial color="#111827" roughness={0.5} />
      </mesh>
      <mesh position={[0, 0.33, 0.075]} rotation={[Math.PI / 2, 0, 0]}>
        <coneGeometry args={[0.028, 0.06, 8]} />
        <meshStandardMaterial color={color} roughness={0.4} metalness={0.2} />
      </mesh>
      {[-0.08, 0.08].map((px, i) => (
        <mesh key={i} position={[px, 0.18, -0.02]} rotation={[0, 0, px > 0 ? -0.5 : 0.5]}>
          <boxGeometry args={[0.03, 0.14, 0.06]} />
          <meshStandardMaterial color="#111827" roughness={0.5} />
        </mesh>
      ))}
    </group>
  );
}

const PIECES: Record<string, (p: { color: string }) => JSX.Element> = {
  chien: Dog,
  chat: Cat,
  sac: MoneyBag,
  chapeau: TopHat,
  desacoudre: Thimble,
  canard: Duck,
  voiture: Car,
  pingouin: Penguin,
};

/** Pion procedural du joueur : base teintée + silhouette reconnaissable par id. */
export default function TokenPiece({ token, color }: { token: string; color: string }) {
  const Piece = PIECES[token] ?? Thimble;
  return (
    <group>
      <Base color={color} />
      <Piece color={color} />
    </group>
  );
}
