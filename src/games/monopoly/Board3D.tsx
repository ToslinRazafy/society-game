"use client";

// Plateau Monopoly 3D — projection pure de GameState (ADR-0008, extension d'ADR-0005).
// Assets 100 % procéduraux : primitives three.js + textures canvas locales, aucune dépendance.
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { SPACES, TOKEN_COLORS, cellWorldPos, SIDE_ROT_Y } from "./board-data";
import { cellBase, centerTexture, stockTexture } from "./textures";
import { BuildingRow } from "./pieces3d";
import Token3D from "./Token3D";
import Dice3D from "./Dice3D";
import type { GameState } from "./state";
import { animationsEnabled } from "@/lib/settings";

const PLANE = new THREE.PlaneGeometry(1, 1);

function Cells({ s }: { s: GameState }) {
  return (
    <group>
      {SPACES.map((space, i) => {
        const { x, z, side } = cellWorldPos(i);
        const prop = s.props[i]!;
        const tex = cellBase(i, prop.owner, prop.mortgaged);
        return (
          <group key={i} position={[x, 0.011, z]} rotation={[0, SIDE_ROT_Y[side], 0]}>
            <mesh rotation={[-Math.PI / 2, 0, 0]} geometry={PLANE} receiveShadow>
              <meshStandardMaterial map={tex} roughness={0.8} />
            </mesh>
            {prop.owner !== null && !space.group && (
              <mesh position={[0, 0.008, -0.3]}>
                <boxGeometry args={[0.5, 0.016, 0.12]} />
                <meshStandardMaterial color={TOKEN_COLORS[prop.owner % TOKEN_COLORS.length]} />
              </mesh>
            )}
            {space.group && prop.houses > 0 && (
              <BuildingRow x={0} z={-0.32} rotY={0} houses={prop.houses} group={space.group} />
            )}
          </group>
        );
      })}
    </group>
  );
}

function Hitboxes({ onCellClick }: { onCellClick: (i: number) => void }) {
  return (
    <group>
      {SPACES.map((_, i) => {
        const { x, z } = cellWorldPos(i);
        return (
          <mesh key={i} position={[x, 0.6, z]} rotation={[-Math.PI / 2, 0, 0]} onClick={(e) => { e.stopPropagation(); onCellClick(i); }}>
            <planeGeometry args={[1, 1]} />
            <meshBasicMaterial transparent opacity={0} depthWrite={false} />
          </mesh>
        );
      })}
    </group>
  );
}

function Stock({ label, count, x, z }: { label: string; count: number; x: number; z: number }) {
  const tex = stockTexture(count);
  return (
    <group position={[x, 0.02, z]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[1.5, 0.75]} />
        <meshStandardMaterial color="#0f2419" roughness={0.9} />
      </mesh>
      <mesh position={[-0.4, 0.002, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.8, 0.4]} />
        <meshBasicMaterial map={tex} transparent />
      </mesh>
      <group position={[0.45, 0, 0]} scale={0.7}>
        {label === "maisons" ? (
          <mesh castShadow position={[0, 0.1, 0]}>
            <boxGeometry args={[0.2, 0.16, 0.2]} />
            <meshStandardMaterial color="#1fb25a" roughness={0.6} />
          </mesh>
        ) : (
          <mesh castShadow position={[0, 0.12, 0]}>
            <boxGeometry args={[0.4, 0.2, 0.24]} />
            <meshStandardMaterial color="#c1121f" roughness={0.6} />
          </mesh>
        )}
      </group>
    </group>
  );
}

interface Props {
  s: GameState;
  onCellClick: (i: number) => void;
  /** Format du conteneur (le mode immersif passe une variante plein écran). */
  className?: string;
}

export default function Board3D({ s, onCellClick, className }: Props) {
  const animated = useMemo(() => animationsEnabled(), []);
  const dstr = s.dice ? `${s.dice[0]}-${s.dice[1]}-${s.turn}-${s.current}` : "";
  const [rollKey, setRollKey] = useState(0);
  const lastRoll = useRef("");
  useEffect(() => {
    if (dstr !== lastRoll.current) {
      lastRoll.current = dstr;
      setRollKey((k) => k + 1);
    }
  }, [dstr]);

  return (
    <div
      className={`overflow-hidden rounded-2xl border border-slate-700 ${
        className ?? "w-full max-w-[min(96vw,78vh)] aspect-square"
      }`}
      role="application"
      aria-label="Plateau Monopoly en 3D"
    >
      <Canvas shadows camera={{ position: [0, 11.5, 11.5], fov: 42 }}>
        <color attach="background" args={["#0b1220"]} />
        <hemisphereLight args={["#dbeafe", "#1e293b", 1.0]} />
        <directionalLight
          position={[7, 14, 8]}
          intensity={1.4}
          castShadow
          shadow-mapSize={[1024, 1024]}
          shadow-camera-left={-8}
          shadow-camera-right={8}
          shadow-camera-top={8}
          shadow-camera-bottom={-8}
        />
        {/* plateau : socle bois + cœur vert */}
        <mesh position={[0, -0.1, 0]} receiveShadow castShadow>
          <boxGeometry args={[11.4, 0.2, 11.4]} />
          <meshStandardMaterial color="#3d2817" roughness={0.7} />
        </mesh>
        <mesh position={[0, 0.005, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <planeGeometry args={[9, 9]} />
          <meshStandardMaterial map={centerTexture()} roughness={0.85} />
        </mesh>
        <Cells s={s} />
        <Stock label="maisons" count={s.bankHouses} x={-2.4} z={-3.4} />
        <Stock label="hôtels" count={s.bankHotels} x={-2.4} z={-2.3} />
        <Dice3D dice={s.dice} rollKey={rollKey} animated={animated} />
        {s.players.map((p, idx) =>
          p.bankrupt ? null : (
            <Token3D
              key={p.token}
              token={p.token}
              color={TOKEN_COLORS[idx % TOKEN_COLORS.length]}
              position={p.position}
              playerIndex={idx}
              isCurrent={idx === s.current && s.phase !== "over"}
              animated={animated}
            />
          )
        )}
        <Hitboxes onCellClick={onCellClick} />
        <OrbitControls enablePan={false} minDistance={7} maxDistance={20} maxPolarAngle={Math.PI / 2.3} />
      </Canvas>
    </div>
  );
}
