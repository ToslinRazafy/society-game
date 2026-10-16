"use client";

// Aide de cadrage 3D partagée par les plateaux (Fanorina 7, Monopoly). Recadre
// une caméra perspective pour qu'un plateau plat, assimilé à un carré centré
// de demi-taille `halfSize`, remplisse au maximum le conteneur — sans rognage —
// quelles que soient la forme de la fenêtre (portrait, paysage, plein écran) et
// l'orientation de vue.
//
// La distance requise est calculée analytiquement : pour chaque coin du carré,
// sa position dans le repère de la caméra (droite/haut/profondeur) donne la
// distance minimale pour qu'il reste dans le champ. Aucune dépendance ajoutée.
import { useEffect } from "react";
import * as THREE from "three";
import { useThree } from "@react-three/fiber";

const WORLD_UP = new THREE.Vector3(0, 1, 0);

export interface FitCameraProps {
  /** Demi-largeur (unités monde) du carré englobant le plateau. */
  halfSize: number;
  /** Direction d'observation par défaut, si la caméra n'a pas encore de position. */
  fallbackDirection: [number, number, number];
  /** Marge relative ajoutée autour du plateau (1 = bords collés). Défaut : 1.05. */
  margin?: number;
}

export default function FitCamera({
  halfSize,
  fallbackDirection,
  margin = 1.05,
}: FitCameraProps) {
  const camera = useThree((state) => state.camera);
  const width = useThree((state) => state.size.width);
  const height = useThree((state) => state.size.height);

  useEffect(() => {
    if (!(camera instanceof THREE.PerspectiveCamera)) return;

    // Direction d'observation courante (préserve la rotation de l'utilisateur).
    const direction = camera.position.clone();
    if (direction.lengthSq() < 1e-6) direction.set(...fallbackDirection);
    direction.normalize();

    const right = new THREE.Vector3().crossVectors(direction, WORLD_UP);
    if (right.lengthSq() < 1e-6) right.set(1, 0, 0);
    right.normalize();
    const up = new THREE.Vector3().crossVectors(right, direction).normalize();

    const aspect = width / Math.max(1, height);
    const tanHalfFov = Math.tan((camera.fov * Math.PI) / 360);
    const s = halfSize;

    let distance = 0;
    for (const cx of [s, -s]) {
      for (const cz of [s, -s]) {
        const corner = new THREE.Vector3(cx, 0, cz);
        const along = corner.dot(direction);
        const offX = Math.abs(corner.dot(right));
        const offY = Math.abs(corner.dot(up));
        distance = Math.max(
          distance,
          along + offX / (tanHalfFov * aspect),
          along + offY / tanHalfFov,
        );
      }
    }

    camera.position.copy(direction).multiplyScalar(distance * margin);
    camera.lookAt(0, 0, 0);
    camera.updateProjectionMatrix();
  }, [camera, width, height, halfSize, margin, fallbackDirection]);

  return null;
}
