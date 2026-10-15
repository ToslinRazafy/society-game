"use client";

// Dés 3D — animation procédurale déterministe (ADR-0008) : toupie + rebond ~1 s,
// puis atterrissage orienté pour afficher EXACTEMENT la valeur choisie par le moteur.
// Aucune physique : la valeur affichée est s.dice, l'animation ne fait que la révéler.
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";

const SIZE = 0.34;
const UP = new THREE.Vector3(0, 1, 0);

// Face d'origine par valeur : +y=1, −y=6, +x=2, −x=5, +z=3, −z=4.
const FACE_DIR: Record<number, THREE.Vector3> = {
  1: new THREE.Vector3(0, 1, 0),
  2: new THREE.Vector3(1, 0, 0),
  3: new THREE.Vector3(0, 0, 1),
  4: new THREE.Vector3(0, 0, -1),
  5: new THREE.Vector3(-1, 0, 0),
  6: new THREE.Vector3(0, -1, 0),
};

// Rotation finale amenant la valeur demandedessus (+y monde).
const TARGET_QUAT: Record<number, THREE.Quaternion> = Object.fromEntries(
  Object.entries(FACE_DIR).map(([v, dir]) => [
    v,
    new THREE.Quaternion().setFromUnitVectors(dir, UP),
  ])
);

// disposition des pips en coordonnées (u, v) de face, demi-pas 0.5
const PIPS: Record<number, [number, number][]> = {
  1: [[0, 0]],
  2: [[-0.5, -0.5], [0.5, 0.5]],
  3: [[-0.5, -0.5], [0, 0], [0.5, 0.5]],
  4: [[-0.5, -0.5], [-0.5, 0.5], [0.5, -0.5], [0.5, 0.5]],
  5: [[-0.5, -0.5], [-0.5, 0.5], [0, 0], [0.5, -0.5], [0.5, 0.5]],
  6: [[-0.5, -0.5], [-0.5, 0], [-0.5, 0.5], [0.5, -0.5], [0.5, 0], [0.5, 0.5]],
};

const FACE_AXES: Record<number, [THREE.Vector3, THREE.Vector3]> = {
  1: [new THREE.Vector3(1, 0, 0), new THREE.Vector3(0, 0, 1)],
  2: [new THREE.Vector3(0, 0, -1), new THREE.Vector3(0, 1, 0)],
  3: [new THREE.Vector3(1, 0, 0), new THREE.Vector3(0, 1, 0)],
  4: [new THREE.Vector3(1, 0, 0), new THREE.Vector3(0, 1, 0)],
  5: [new THREE.Vector3(0, 0, 1), new THREE.Vector3(0, 1, 0)],
  6: [new THREE.Vector3(1, 0, 0), new THREE.Vector3(0, 0, 1)],
};

const PIP = new THREE.SphereGeometry(0.028, 10, 8);
const PIP_MAT = new THREE.MeshStandardMaterial({ color: "#0f172a", roughness: 0.4 });

function FacePips({ value }: { value: number }) {
  const pos = useMemo(() => {
    const [u, v] = FACE_AXES[value]!;
    const n = FACE_DIR[value]!;
    return PIPS[value]!.map(
      ([pu, pv]) =>
        [
          (n.x + u.x * pu + v.x * pv) * (SIZE / 2 + 0.005),
          (n.y + u.y * pu + v.y * pv) * (SIZE / 2 + 0.005),
          (n.z + u.z * pu + v.z * pv) * (SIZE / 2 + 0.005),
        ] as [number, number, number]
    );
  }, [value]);
  return (
    <group>
      {pos.map((p, i) => (
        <mesh key={i} geometry={PIP} material={PIP_MAT} position={p} />
      ))}
    </group>
  );
}

const TUMBLE_MS = 950;
const AXIS_A = new THREE.Vector3(1, 0.3, 0.4).normalize();
const AXIS_B = new THREE.Vector3(0.3, 0, 1).normalize();

function Die({
  value,
  basePos,
  animated,
  seed,
}: {
  value: number;
  basePos: [number, number, number];
  animated: boolean;
  seed: number;
}) {
  const ref = useRef<THREE.Group>(null);
  const spin = useRef({ phase: "idle" as "idle" | "tumble" | "settle", t0: 0, vx: 0, vy: 0, vz: 0, lastValue: 0 });

  useEffect(() => {
    if (!animated || !ref.current) {
      if (ref.current) ref.current.quaternion.copy(TARGET_QUAT[value]!);
      return;
    }
    const st = spin.current;
    if (value === st.lastValue && st.phase === "idle") return;
    st.lastValue = value;
    if (st.phase === "idle") {
      st.phase = "tumble";
      st.t0 = performance.now();
      const r = (k: number) => Math.abs(Math.sin(seed * 12.9898 + k * 78.233)) * 2 - 1;
      st.vx = 9 + r(1) * 5;
      st.vy = 12 + r(2) * 6;
      st.vz = 8 + r(3) * 5;
    }
  }, [value, animated, seed]);

  useFrame((_, dt) => {
    const g = ref.current;
    if (!g) return;
    const st = spin.current;
    if (!animated) {
      g.position.set(basePos[0], basePos[1], basePos[2]);
      g.quaternion.copy(TARGET_QUAT[value]!);
      return;
    }
    if (st.phase === "tumble") {
      const k = (performance.now() - st.t0) / TUMBLE_MS;
      if (k >= 1) {
        st.phase = "settle";
      } else {
        const damp = 1 - k;
        g.rotateOnWorldAxis(AXIS_A, st.vx * dt * damp);
        g.rotateOnWorldAxis(UP, st.vy * dt * damp);
        g.rotateOnWorldAxis(AXIS_B, st.vz * dt * damp);
        g.position.set(basePos[0], basePos[1] + Math.abs(Math.sin(k * 11)) * 0.5 * damp, basePos[2]);
      }
    } else if (st.phase === "settle") {
      const target = TARGET_QUAT[value]!;
      const f = 1 - Math.exp(-14 * dt);
      g.quaternion.slerp(target, f);
      g.position.x = basePos[0];
      g.position.z = basePos[2];
      g.position.y += (basePos[1] - g.position.y) * f;
      if (g.quaternion.angleTo(target) < 0.02) {
        g.quaternion.copy(target);
        g.position.set(basePos[0], basePos[1], basePos[2]);
        st.phase = "idle";
      }
    }
  });

  return (
    <group ref={ref} position={basePos} quaternion={TARGET_QUAT[1]!}>
      <mesh castShadow>
        <boxGeometry args={[SIZE, SIZE, SIZE]} />
        <meshStandardMaterial color="#f8fafc" roughness={0.35} />
      </mesh>
      {([1, 2, 3, 4, 5, 6] as const).map((v) => (
        <FacePips key={v} value={v} />
      ))}
    </group>
  );
}

interface Props {
  dice: [number, number] | null;
  rollKey: number;
  animated: boolean;
}

/** Les deux dés posés au centre du plateau ; valeur = celle du moteur, jamais recalculée. */
export default function Dice3D({ dice, rollKey, animated }: Props) {
  const d1 = dice?.[0] ?? 1;
  const d2 = dice?.[1] ?? 1;
  return (
    <group>
      <Die key={`d1-${rollKey}`} value={d1} basePos={[-0.8, 0.03 + SIZE / 2, 1.4]} animated={animated} seed={rollKey * 2 + 1} />
      <Die key={`d2-${rollKey}`} value={d2} basePos={[-0.25, 0.03 + SIZE / 2, 1.7]} animated={animated} seed={rollKey * 2 + 2} />
    </group>
  );
}
