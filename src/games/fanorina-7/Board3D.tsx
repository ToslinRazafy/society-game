"use client";

import { useMemo, useRef } from "react";
import * as THREE from "three";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { EDGES, NODES, nodePoint, NodeId } from "@/games/fanorina-7/board";
import { Move, Stone } from "@/games/fanorina-7/engine";
import { animationsEnabled } from "@/lib/settings";

const Y_TOP = 0.1; // surface du plateau
const STONE_Y = Y_TOP + 0.19;

// grille → monde : centre du plateau en (0,0), 1 unité = 1 case
function world(id: NodeId): [number, number, number] {
  const p = nodePoint(id);
  return [p.x - 3, 0, p.y - 3];
}

// Les 5 carrés du plateau (origines en coordonnées de grille), [2,2] = central
const SQUARES: Array<[number, number, boolean]> = [
  [2, 0, false],
  [4, 2, false],
  [2, 4, false],
  [0, 2, false],
  [2, 2, true],
];

function Plates() {
  return (
    <group>
      {SQUARES.map(([x, y, center]) => (
        <mesh
          key={`${x}-${y}`}
          position={[x + 1 - 3, Y_TOP / 2, y + 1 - 3]}
          receiveShadow
        >
          <boxGeometry args={[2.5, Y_TOP, 2.5]} />
          <meshStandardMaterial color={center ? "#0f1a2e" : "#1e293b"} roughness={0.8} />
        </mesh>
      ))}
    </group>
  );
}

const UP = new THREE.Vector3(0, 1, 0);

function Edge({ a, b }: { a: NodeId; b: NodeId }) {
  const va = world(a);
  const vb = world(b);
  const start = new THREE.Vector3(va[0], Y_TOP + 0.012, va[2]);
  const end = new THREE.Vector3(vb[0], Y_TOP + 0.012, vb[2]);
  const dir = end.clone().sub(start);
  const len = dir.length();
  const mid = start.clone().add(end).multiplyScalar(0.5);
  const quat = new THREE.Quaternion().setFromUnitVectors(UP, dir.normalize());
  return (
    <mesh position={mid} quaternion={quat}>
      <cylinderGeometry args={[0.022, 0.022, len, 8]} />
      <meshStandardMaterial color="#7d8ea8" roughness={0.5} />
    </mesh>
  );
}

function Marker({
  id,
  kind,
  animated,
}: {
  id: NodeId;
  kind: "node" | "normal" | "capture";
  animated: boolean;
}) {
  const ref = useRef<THREE.Mesh>(null);
  const [x, , z] = world(id);
  const y = Y_TOP + (kind === "node" ? 0.02 : 0.045);
  useFrame(({ clock }) => {
    if (kind !== "capture" || !animated || !ref.current) return;
    const s = 1 + 0.12 * Math.sin(clock.elapsedTime * 6);
    ref.current.scale.setScalar(s);
  });
  if (kind === "capture")
    return (
      <mesh ref={ref} position={[x, y, z]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.44, 0.055, 12, 40]} />
        <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={0.7} />
      </mesh>
    );
  return (
    <mesh position={[x, y, z]} rotation={[Math.PI / 2, 0, 0]}>
      {kind === "node" ? (
        <circleGeometry args={[0.075, 20]} />
      ) : (
        <circleGeometry args={[0.24, 24]} />
      )}
      <meshStandardMaterial
        color={kind === "node" ? "#cbd5e1" : "#4ade80"}
        emissive={kind === "normal" ? "#4ade80" : "#000000"}
        emissiveIntensity={0.5}
      />
    </mesh>
  );
}

function Stone3D({
  node,
  color,
  selected,
  animated,
  onClick,
}: {
  node: NodeId;
  color: string;
  selected: boolean;
  animated: boolean;
  onClick: (e: { stopPropagation(): void }) => void;
}) {
  const ref = useRef<THREE.Group>(null);
  const placed = useRef(false);
  const [tx, , tz] = world(node);
  useFrame((_, dt) => {
    const g = ref.current;
    if (!g) return;
    if (!animated) {
      g.position.x = tx;
      g.position.z = tz;
      return;
    }
    const f = 1 - Math.exp(-10 * dt);
    g.position.x += (tx - g.position.x) * f;
    g.position.z += (tz - g.position.z) * f;
  });
  return (
    <group
      ref={(g) => {
        ref.current = g;
        if (g && !placed.current) {
          g.position.set(tx, STONE_Y, tz);
          placed.current = true;
        }
      }}
    >
      <mesh castShadow onClick={(e) => { e.stopPropagation(); onClick(e); }}>
        <cylinderGeometry args={[0.36, 0.42, 0.34, 32]} />
        <meshStandardMaterial
          color={color}
          roughness={0.35}
          metalness={0.1}
          emissive={color}
          emissiveIntensity={selected ? 0.45 : 0.08}
        />
      </mesh>
      {selected && (
        <mesh position={[0, -0.14, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.5, 0.045, 12, 40]} />
          <meshStandardMaterial color="#f8fafc" emissive="#f8fafc" emissiveIntensity={0.8} />
        </mesh>
      )}
    </group>
  );
}

// pierre capturée : fantôme rouge qui s'enfonce et disparaît
function CaptureGhost({ id }: { id: NodeId }) {
  const ref = useRef<THREE.Mesh>(null);
  const mat = useRef<THREE.MeshStandardMaterial>(null);
  const [x, , z] = world(id);
  useFrame((_, dt) => {
    if (ref.current) ref.current.position.y = Math.max(Y_TOP, ref.current.position.y - dt * 0.6);
    if (mat.current) mat.current.opacity = Math.max(0, mat.current.opacity - dt * 1.8);
  });
  return (
    <mesh ref={ref} position={[x, STONE_Y, z]}>
      <cylinderGeometry args={[0.36, 0.42, 0.34, 24]} />
      <meshStandardMaterial ref={mat} color="#ef4444" transparent opacity={0.85} />
    </mesh>
  );
}

interface Props {
  stones: Partial<Record<NodeId, Stone>>;
  colors: string[];
  selected: NodeId | null;
  moves: Move[];
  lastCapture: NodeId | null;
  interactive: boolean;
  onNodeClick: (id: NodeId) => void;
  /** Hauteur/format du conteneur (le mode immersif passe une variante plein écran). */
  className?: string;
}

export default function Board3D({
  stones,
  colors,
  selected,
  moves,
  lastCapture,
  interactive,
  onNodeClick,
  className,
}: Props) {
  const animated = useMemo(() => animationsEnabled(), []);
  return (
    <div
      className={`w-full overflow-hidden rounded-2xl border border-slate-700 ${
        className ?? "h-[62vh] lg:h-[78vh]"
      }`}
      role="application"
      aria-label="Plateau Fanorina 7 en 3D"
    >
      <Canvas shadows camera={{ position: [0, 8.2, 7.4], fov: 45 }}>
        <color attach="background" args={["#0b1220"]} />
        <hemisphereLight args={["#dbeafe", "#1e293b", 1.0]} />
        <directionalLight
          position={[6, 12, 7]}
          intensity={1.4}
          castShadow
          shadow-mapSize={[1024, 1024]}
          shadow-camera-left={-6}
          shadow-camera-right={6}
          shadow-camera-top={6}
          shadow-camera-bottom={-6}
        />
        <Plates />
        {EDGES.map(([a, b]) => (
          <Edge key={`${a}-${b}`} a={a} b={b} />
        ))}
        {NODES.map((id) => (
          <Marker key={`n-${id}`} id={id} kind="node" animated={animated} />
        ))}
        {moves.map((m) => (
          <Marker key={`mv-${m.to}`} id={m.to} kind={m.type} animated={animated} />
        ))}
        {moves
          .filter((m) => m.type === "capture")
          .map((m) => (
            <Marker key={`cap-${m.captured}`} id={m.captured!} kind="capture" animated={animated} />
          ))}
        {lastCapture !== null && !stones[lastCapture] && (
          <CaptureGhost key={`${lastCapture}-${Object.keys(stones).length}`} id={lastCapture} />
        )}
        {NODES.filter((n) => stones[n]).map((id) => {
          const stone = stones[id]!;
          return (
            <Stone3D
              key={stone.id}
              node={id}
              color={colors[stone.player]}
              selected={selected === id}
              animated={animated}
              onClick={() => onNodeClick(id)}
            />
          );
        })}
        {interactive &&
          NODES.map((id) => {
            const [x, , z] = world(id);
            return (
              <mesh
                key={`hit-${id}`}
                position={[x, Y_TOP + 0.3, z]}
                onClick={() => onNodeClick(id)}
              >
                <cylinderGeometry args={[0.46, 0.46, 0.6, 16]} />
                <meshBasicMaterial transparent opacity={0} depthWrite={false} />
              </mesh>
            );
          })}
        <OrbitControls
          enablePan={false}
          minDistance={6}
          maxDistance={15}
          maxPolarAngle={Math.PI / 2.35}
        />
      </Canvas>
    </div>
  );
}
