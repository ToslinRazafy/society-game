"use client";

// Pion animé — déplacement CASE PAR CASE (ADR-0008).
// L'état d'animation (file de cases, position courante) vit dans des refs locales :
// GameState reste la projection pure du moteur, jamais l'inverse.
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { cellWorldPos } from "./board-data";
import TokenPiece from "./pieces3d";

const Y = 0.012;
const SPEED = 5.5; // unités monde / seconde

function cellPoint(index: number): [number, number] {
  const { x, z } = cellWorldPos(index);
  return [x, z];
}

interface Props {
  token: string;
  color: string;
  position: number;
  playerIndex: number;
  isCurrent: boolean;
  animated: boolean;
}

export default function Token3D({ token, color, position, playerIndex, isCurrent, animated }: Props) {
  const ref = useRef<THREE.Group>(null);
  const ring = useRef<THREE.Mesh>(null);
  const state = useRef({ from: position, queue: [] as number[], pos: new THREE.Vector3() });

  // décalage fixe par joueur dans la case (8 places en couronne)
  const offset = useMemo<[number, number]>(() => {
    const a = (playerIndex / 8) * Math.PI * 2;
    return [Math.cos(a) * 0.3, Math.sin(a) * 0.3];
  }, [playerIndex]);

  useEffect(() => {
    const st = state.current;
    if (st.from === position) return;
    const steps = (position - st.from + 40) % 40;
    const back = steps > 20;
    const count = back ? 40 - steps : steps;
    if (!animated || count === 0 || count > 13) {
      st.queue = []; // téléport (carte, prison…) ou animations coupées
    } else {
      const q: number[] = [];
      for (let i = 1; i <= count; i++) q.push((st.from + (back ? -i : i) + 40) % 40);
      st.queue = q;
    }
    st.from = position;
  }, [position, animated]);

  // position initiale au montage (avant premier frame)
  const placed = useRef(false);
  useEffect(() => {
    if (placed.current || !ref.current) return;
    const [x, z] = cellPoint(position);
    ref.current.position.set(x + offset[0], Y, z + offset[1]);
    state.current.pos.copy(ref.current.position);
    placed.current = true;
  }, [position, offset]);

  useFrame((_, dt) => {
    const g = ref.current;
    if (!g) return;
    const st = state.current;
    if (st.queue.length > 0) {
      const cell = st.queue[0];
      const [cx, cz] = cellPoint(cell);
      const tx = cx + (cell === position ? offset[0] : 0);
      const tz = cz + (cell === position ? offset[1] : 0);
      const dx = tx - st.pos.x;
      const dz = tz - st.pos.z;
      const d = Math.hypot(dx, dz);
      const step = SPEED * dt;
      if (d <= step || d < 1e-4) {
        st.pos.set(tx, Y, tz);
        st.queue.shift();
      } else {
        st.pos.x += (dx / d) * step;
        st.pos.z += (dz / d) * step;
        st.pos.y = Y + Math.sin(Math.min(d, 1) * Math.PI) * 0.03; // petit rebond
      }
      g.position.copy(st.pos);
    } else {
      const [cx, cz] = cellPoint(position);
      const tx = cx + offset[0];
      const tz = cz + offset[1];
      if (Math.abs(st.pos.x - tx) > 1e-4 || Math.abs(st.pos.z - tz) > 1e-4) {
        const f = animated ? 1 - Math.exp(-10 * dt) : 1;
        st.pos.x += (tx - st.pos.x) * f;
        st.pos.z += (tz - st.pos.z) * f;
        st.pos.y = Y;
        g.position.copy(st.pos);
      }
    }
    if (ring.current) ring.current.rotation.z += dt * 1.2;
  });

  return (
    <group ref={ref}>
      <TokenPiece token={token} color={color} />
      {isCurrent && (
        <mesh ref={ring} position={[0, 0.015, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.26, 0.31, 28, 1, 0, Math.PI * 1.6]} />
          <meshBasicMaterial color="#fbbf24" side={THREE.DoubleSide} transparent opacity={0.9} />
        </mesh>
      )}
    </group>
  );
}
