'use client';

import { useMemo } from 'react';
import { CanvasTexture, RepeatWrapping } from 'three';

type PbrMaps = { map: CanvasTexture | null; normalMap: CanvasTexture | null };

// Sobel-ish height-to-normal conversion on a canvas context. Wraps at edges so
// the resulting normal map tiles cleanly.
function heightToNormalCanvas(
  heightCtx: CanvasRenderingContext2D,
  w: number,
  h: number,
  strength: number,
): HTMLCanvasElement {
  const src = heightCtx.getImageData(0, 0, w, h).data;
  const out = new ImageData(w, h);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const xl = (x - 1 + w) % w;
      const xr = (x + 1) % w;
      const yu = (y - 1 + h) % h;
      const yd = (y + 1) % h;
      const L = src[(y * w + xl) * 4] / 255;
      const R = src[(y * w + xr) * 4] / 255;
      const U = src[(yu * w + x) * 4] / 255;
      const D = src[(yd * w + x) * 4] / 255;
      const dx = (R - L) * strength;
      const dy = (D - U) * strength;
      const nx = -dx;
      const ny = -dy;
      const nz = 1.0;
      const len = Math.hypot(nx, ny, nz) || 1;
      const i = (y * w + x) * 4;
      out.data[i    ] = ((nx / len) * 0.5 + 0.5) * 255;
      out.data[i + 1] = ((ny / len) * 0.5 + 0.5) * 255;
      out.data[i + 2] = ((nz / len) * 0.5 + 0.5) * 255;
      out.data[i + 3] = 255;
    }
  }
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  canvas.getContext('2d')!.putImageData(out, 0, 0);
  return canvas;
}

// Build a companion height canvas from a diffuse canvas's luminance.
// Ensures the derived normals align with the dark spots/streaks the eye sees.
function luminanceHeightCanvas(diffuseCtx: CanvasRenderingContext2D, w: number, h: number): HTMLCanvasElement {
  const src = diffuseCtx.getImageData(0, 0, w, h);
  const out = new ImageData(w, h);
  for (let i = 0; i < w * h; i++) {
    const r = src.data[i * 4];
    const g = src.data[i * 4 + 1];
    const b = src.data[i * 4 + 2];
    const lum = 0.299 * r + 0.587 * g + 0.114 * b;
    out.data[i * 4    ] = lum;
    out.data[i * 4 + 1] = lum;
    out.data[i * 4 + 2] = lum;
    out.data[i * 4 + 3] = 255;
  }
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  canvas.getContext('2d')!.putImageData(out, 0, 0);
  return canvas;
}

function usePlasterTexture(): PbrMaps {
  return useMemo<PbrMaps>(() => {
    if (typeof document === 'undefined') return { map: null, normalMap: null };
    const size = 512;
    const base = document.createElement('canvas');
    base.width = base.height = size;
    const ctx = base.getContext('2d');
    if (!ctx) return { map: null, normalMap: null };

    ctx.fillStyle = '#f5e8d0';
    ctx.fillRect(0, 0, size, size);

    const drawOctave = (count: number, radius: number, alpha: number, dark: boolean) => {
      for (let i = 0; i < count; i++) {
        const x = Math.random() * size;
        const y = Math.random() * size;
        ctx.fillStyle = dark
          ? `rgba(130, 105, 80, ${alpha})`
          : `rgba(255, 246, 226, ${alpha})`;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
      }
    };
    drawOctave(3000, 1, 0.05, true);
    drawOctave(1400, 2.2, 0.04, true);
    drawOctave(600, 4, 0.05, false);
    drawOctave(220, 8, 0.03, true);

    const vignette = ctx.createRadialGradient(
      size / 2, size / 2, size * 0.22,
      size / 2, size / 2, size * 0.72,
    );
    vignette.addColorStop(0, 'rgba(0, 0, 0, 0)');
    vignette.addColorStop(1, 'rgba(110, 80, 55, 0.12)');
    ctx.fillStyle = vignette;
    ctx.fillRect(0, 0, size, size);

    const heightCanvas = luminanceHeightCanvas(ctx, size, size);
    const normalCanvas = heightToNormalCanvas(heightCanvas.getContext('2d')!, size, size, 0.3);

    const map = new CanvasTexture(base);
    map.anisotropy = 8;
    map.wrapS = map.wrapT = RepeatWrapping;
    map.needsUpdate = true;

    const normalMap = new CanvasTexture(normalCanvas);
    normalMap.anisotropy = 8;
    normalMap.wrapS = normalMap.wrapT = RepeatWrapping;
    normalMap.needsUpdate = true;

    return { map, normalMap };
  }, []);
}

function useWoodFloorTexture(): PbrMaps {
  return useMemo<PbrMaps>(() => {
    if (typeof document === 'undefined') return { map: null, normalMap: null };
    const width = 512;
    const height = 512;
    const base = document.createElement('canvas');
    base.width = width;
    base.height = height;
    const ctx = base.getContext('2d');
    if (!ctx) return { map: null, normalMap: null };

    ctx.fillStyle = '#c9a078';
    ctx.fillRect(0, 0, width, height);

    // 7 darker streaks running vertically with sinusoidal x-jitter
    const streaks = 7;
    for (let s = 0; s < streaks; s++) {
      const baseX = (s + 0.5) * (width / streaks) + (Math.random() - 0.5) * 12;
      const freq = 0.01 + Math.random() * 0.02;
      const amp = 3 + Math.random() * 5;
      const thickness = 1.2 + Math.random() * 2.0;
      const darkness = 0.18 + Math.random() * 0.22;
      ctx.strokeStyle = `rgba(110, 70, 42, ${darkness})`;
      ctx.lineWidth = thickness;
      ctx.beginPath();
      for (let y = 0; y <= height; y += 2) {
        const x = baseX + Math.sin(y * freq + s) * amp;
        if (y === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }

    // Soft noise overlay — tiny speckles to break up flatness
    for (let i = 0; i < 4500; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      const a = 0.04 + Math.random() * 0.06;
      ctx.fillStyle = Math.random() > 0.5
        ? `rgba(80, 50, 30, ${a})`
        : `rgba(240, 210, 170, ${a * 0.8})`;
      ctx.fillRect(x, y, 1, 1);
    }

    const heightCanvas = luminanceHeightCanvas(ctx, width, height);
    const normalCanvas = heightToNormalCanvas(heightCanvas.getContext('2d')!, width, height, 0.8);

    const map = new CanvasTexture(base);
    map.anisotropy = 8;
    map.wrapS = map.wrapT = RepeatWrapping;
    map.repeat.set(3, 1);
    map.needsUpdate = true;

    const normalMap = new CanvasTexture(normalCanvas);
    normalMap.anisotropy = 8;
    normalMap.wrapS = normalMap.wrapT = RepeatWrapping;
    normalMap.repeat.set(3, 1);
    normalMap.needsUpdate = true;

    return { map, normalMap };
  }, []);
}

// Room is larger than the grid so stations never sit flush against walls.
// Walls are placed so their outer face aligns with the floor's outer edge.
const ROOM_SIZE = 9.4;
const FLOOR_THICKNESS = 0.25;
// Walls match the floor side length so the space reads as an open cube.
const WALL_HEIGHT = ROOM_SIZE;
const WALL_THICKNESS = 0.15;
const WALL_CENTER = -(ROOM_SIZE / 2) + WALL_THICKNESS / 2; // = -6.625
const INNER_FACE = WALL_CENTER + WALL_THICKNESS / 2;       // = -6.55
const TRIM_OFFSET = INNER_FACE + 0.025;

export default function RoomShell() {
  const wood = useWoodFloorTexture();
  const plaster = usePlasterTexture();

  return (
    <group>
      {/* Floor slab — thick wooden base. Top face sits at y=0. */}
      <mesh position={[0, -FLOOR_THICKNESS / 2, 0]} receiveShadow>
        <boxGeometry args={[ROOM_SIZE, FLOOR_THICKNESS, ROOM_SIZE]} />
        <meshStandardMaterial
          color="#c9a078"
          map={wood.map ?? undefined}
          normalMap={wood.normalMap ?? undefined}
          roughness={0.85}
          metalness={0}
          envMapIntensity={0.4}
        />
      </mesh>

      {/* Back wall (-z) */}
      <mesh position={[0, WALL_HEIGHT / 2, WALL_CENTER]} receiveShadow>
        <boxGeometry args={[ROOM_SIZE, WALL_HEIGHT, WALL_THICKNESS]} />
        <meshStandardMaterial
          color="#f5e8d0"
          map={plaster.map ?? undefined}
          normalMap={plaster.normalMap ?? undefined}
          roughness={0.92}
          metalness={0}
        />
      </mesh>

      {/* Left wall (-x) */}
      <mesh position={[WALL_CENTER, WALL_HEIGHT / 2, 0]} receiveShadow>
        <boxGeometry args={[WALL_THICKNESS, WALL_HEIGHT, ROOM_SIZE]} />
        <meshStandardMaterial
          color="#f5e8d0"
          map={plaster.map ?? undefined}
          normalMap={plaster.normalMap ?? undefined}
          roughness={0.92}
          metalness={0}
        />
      </mesh>

      {/* Baseboard trim — horizontal (along back wall) */}
      <mesh position={[0, 0.06, TRIM_OFFSET]} receiveShadow castShadow>
        <boxGeometry args={[ROOM_SIZE, 0.12, 0.05]} />
        <meshStandardMaterial color="#e8d7b8" roughness={0.75} />
      </mesh>

      {/* Baseboard trim — vertical (along left wall) */}
      <mesh position={[TRIM_OFFSET, 0.06, 0]} receiveShadow castShadow>
        <boxGeometry args={[0.05, 0.12, ROOM_SIZE]} />
        <meshStandardMaterial color="#e8d7b8" roughness={0.75} />
      </mesh>
    </group>
  );
}
