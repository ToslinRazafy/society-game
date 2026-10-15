"use client";

// Textures canvas du plateau 3D — dessin 100 % local (aucune police fetchée, cf. ADR-0008).
// Convention : le HAUT de la texture regarde le CENTRE du plateau (bande de groupe en haut).
import * as THREE from "three";
import { GROUP_COLORS, SPACES, TOKEN_COLORS } from "./board-data";

const cache = new Map<string, THREE.CanvasTexture>();

function make(off: number, w: number, h: number): [HTMLCanvasElement, CanvasRenderingContext2D] {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  void off;
  const g = c.getContext("2d")!;
  return [c, g];
}

function toTexture(c: HTMLCanvasElement): THREE.CanvasTexture {
  const t = new THREE.CanvasTexture(c);
  t.anisotropy = 4;
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

function wrap(g: CanvasRenderingContext2D, text: string, maxW: number): string[] {
  const words = text.split(" ");
  const lines: string[] = [];
  let cur = "";
  for (const w of words) {
    const trial = cur ? `${cur} ${w}` : w;
    if (g.measureText(trial).width > maxW && cur) {
      lines.push(cur);
      cur = w;
    } else cur = trial;
  }
  if (cur) lines.push(cur);
  return lines;
}

const INK = "#123d24";

function cellBase(index: number, owner: number | null, mortgaged: boolean): THREE.CanvasTexture {
  const key = `c-${index}-${owner}-${mortgaged}`;
  const hit = cache.get(key);
  if (hit) return hit;
  const space = SPACES[index]!;
  const corner = index % 10 === 0;
  const [c, g] = make(0, corner ? 160 : 128, corner ? 160 : 128);
  const W = c.width;

  g.fillStyle = "#f7f3e3";
  g.fillRect(0, 0, W, W);
  g.strokeStyle = "rgba(0,0,0,0.35)";
  g.lineWidth = 3;
  g.strokeRect(1, 1, W - 2, W - 2);

  if (space.group) {
    g.fillStyle = GROUP_COLORS[space.group];
    g.fillRect(4, 4, W - 8, W * 0.26);
    g.strokeStyle = "rgba(0,0,0,0.3)";
    g.strokeRect(4, 4, W - 8, W * 0.26);
  } else if (space.type === "railroad") {
    g.fillStyle = "#6b7280";
    g.fillRect(4, 4, W - 8, W * 0.2);
    g.fillStyle = "#f7f3e3";
    g.font = "bold 26px sans-serif";
    g.textAlign = "center";
    g.fillText("🚂", W / 2, 4 + W * 0.17);
  } else if (space.type === "utility") {
    g.fillStyle = space.type === "utility" && index === 12 ? "#eab308" : "#38bdf8";
    g.fillRect(4, 4, W - 8, W * 0.2);
  }

  if (corner) {
    if (index === 0) {
      g.fillStyle = INK;
      g.font = "bold 34px sans-serif";
      g.textAlign = "center";
      g.fillText("DÉPART", W / 2, W * 0.55);
      g.font = "20px sans-serif";
      g.fillText("← 200 F", W / 2, W * 0.72);
    } else if (index === 10) {
      g.fillStyle = "#d97706";
      g.fillRect(W * 0.15, W * 0.15, W * 0.7, W * 0.7);
      g.fillStyle = "#7c2d12";
      for (let i = 0; i < 4; i++) g.fillRect(W * 0.22 + i * W * 0.18, W * 0.15, W * 0.05, W * 0.7);
      g.strokeStyle = "#7c2d12";
      g.lineWidth = 6;
      g.strokeRect(W * 0.15, W * 0.15, W * 0.7, W * 0.7);
    } else if (index === 20) {
      g.fillStyle = INK;
      g.font = "bold 26px sans-serif";
      g.textAlign = "center";
      g.fillText("PARC", W / 2, W * 0.45);
      g.fillText("GRATUIT", W / 2, W * 0.68);
    } else {
      g.fillStyle = "#b91c1c";
      g.font = "bold 24px sans-serif";
      g.textAlign = "center";
      g.fillText("ALLEZ EN", W / 2, W * 0.45);
      g.fillText("PRISON", W / 2, W * 0.68);
    }
  } else {
    g.fillStyle = INK;
    g.font = "bold 19px sans-serif";
    g.textAlign = "center";
    const nameY = space.group ? W * 0.46 : W * 0.4;
    const lines = wrap(g, space.name, W - 14);
    lines.slice(0, 3).forEach((ln, i) => g.fillText(ln, W / 2, nameY + i * 22));
    if (space.price !== undefined) {
      g.font = "18px sans-serif";
      g.fillText(`${space.price} F`, W / 2, W - 14);
    }
    if (space.type === "chance") {
      g.fillStyle = "#dc2626";
      g.font = "bold 60px sans-serif";
      g.fillText("?", W * 0.78, W * 0.42);
    }
    if (space.type === "community") {
      g.fillStyle = "#2563eb";
      g.font = "bold 34px sans-serif";
      g.fillText("€", W * 0.8, W * 0.38);
    }
    if (space.type === "tax-income" || space.type === "tax-luxury") {
      g.fillStyle = INK;
      g.font = "34px sans-serif";
      g.fillText("🎩", W * 0.75, W * 0.4);
    }
  }

  if (owner !== null) {
    g.fillStyle = TOKEN_COLORS[owner % TOKEN_COLORS.length];
    g.fillRect(4, W - 16, W - 8, 12);
  }
  if (mortgaged) {
    g.fillStyle = "rgba(15,23,42,0.45)";
    g.fillRect(0, 0, W, W);
    g.fillStyle = "#fecdd3";
    g.font = "bold 44px sans-serif";
    g.textAlign = "center";
    g.fillText("H", W / 2, W * 0.62);
  }

  const tex = toTexture(c);
  cache.set(key, tex);
  return tex;
}

function centerTexture(): THREE.CanvasTexture {
  const key = "center";
  const hit = cache.get(key);
  if (hit) return hit;
  const [c, g] = make(0, 512, 512);
  g.fillStyle = "#0b2e1a";
  g.fillRect(0, 0, 512, 512);
  g.save();
  g.translate(256, 256);
  g.rotate((-9 * Math.PI) / 180);
  g.fillStyle = "#c1121f";
  g.font = "900 64px sans-serif";
  g.textAlign = "center";
  g.fillText("MONOPOLY", 0, -6);
  g.fillStyle = "#f5e6b8";
  g.font = "bold 30px sans-serif";
  g.fillText("édition française", 0, 44);
  g.restore();
  const tex = toTexture(c);
  cache.set(key, tex);
  return tex;
}

function stockTexture(count: number): THREE.CanvasTexture {
  const key = `stock-${count}`;
  const hit = cache.get(key);
  if (hit) return hit;
  const [c, g] = make(0, 128, 64);
  g.clearRect(0, 0, 128, 64);
  g.fillStyle = "#f5e6b8";
  g.font = "bold 40px sans-serif";
  g.textAlign = "center";
  g.fillText(String(count), 64, 46);
  const tex = toTexture(c);
  cache.set(key, tex);
  return tex;
}

export { cellBase, centerTexture, stockTexture };
