'use client';

import { useMemo } from 'react';
import { DoubleSide } from 'three';
import {
  GRID_COLS,
  GRID_ROWS,
  RUG_COLS,
  RUG_ROWS,
  RUG_OFFSET_ROW,
  getOccupiedCells,
  isRugCell,
} from '@/lib/isometric/constants';
import { gridToWorld, TILE_SIZE } from '@/lib/isometric/world';
import type { PreviewCells } from './StationLayer3D';

// Colorful Memphis-style striped rug — alternating bold bands with cream gaps
// Each rug-row index maps to a band color; cream rows separate the brights.
const RUG_BANDS: string[] = [
  '#ff6f59', // coral
  '#fff2dc', // cream
  '#3a86ff', // cobalt
  '#fff2dc', // cream
  '#ffd23f', // sunshine
  '#fff2dc', // cream
  '#8ac926', // apple
  '#fff2dc', // cream
  '#ff8ab8', // bubblegum
  '#fff2dc', // cream
];

type Props = {
  preview?: PreviewCells;
  occupied?: Set<string>;
  dragging?: boolean;
};

export default function GroundPlane({ preview = null, occupied, dragging = false }: Props) {
  const previewSet = useMemo(() => {
    if (!preview) return new Set<string>();
    return new Set(getOccupiedCells(preview.col, preview.row, preview.w, preview.h));
  }, [preview]);

  const tiles = useMemo(() => {
    const list: { col: number; row: number; key: string; rug: boolean; color: string }[] = [];
    for (let row = 0; row < GRID_ROWS; row++) {
      for (let col = 0; col < GRID_COLS; col++) {
        const rug = isRugCell(col, row);
        const color = rug
          ? RUG_BANDS[(row - RUG_OFFSET_ROW) % RUG_BANDS.length]
          : '#000000';
        list.push({ col, row, key: `${col},${row}`, rug, color });
      }
    }
    return list;
  }, []);

  // Rug border is centered on the rug region (which is centered on the grid).
  const rugBorderSize: [number, number] = [
    RUG_COLS * TILE_SIZE + 0.28,
    RUG_ROWS * TILE_SIZE + 0.28,
  ];

  return (
    <group>
      {/* Darker rug border line — frames the rug against the wooden floor */}
      <mesh position={[0, 0.002, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={rugBorderSize} />
        <meshStandardMaterial color="#2a2420" roughness={0.9} />
      </mesh>

      {tiles.map((t) => {
        const [x, , z] = gridToWorld(t.col, t.row, 1, 1);
        const isOccupied = occupied?.has(t.key) ?? false;
        const isPreview = previewSet.has(t.key);

        // Wooden-floor tiles only render when they need to show interaction
        // state — otherwise we skip the mesh so the wood texture reads through.
        if (!t.rug && !isPreview && !(dragging && isOccupied)) return null;

        let color = t.color;
        let emissive = '#000000';
        let emissiveIntensity = 0;

        if (isPreview) {
          color = '#ffe5a0';
          emissive = '#e6a93a';
          emissiveIntensity = 0.45;
        } else if (dragging && isOccupied) {
          color = '#c48a85';
        }

        return (
          <mesh
            key={t.key}
            position={[x, 0.005, z]}
            rotation={[-Math.PI / 2, 0, 0]}
            receiveShadow
          >
            <planeGeometry args={[TILE_SIZE, TILE_SIZE]} />
            <meshStandardMaterial
              color={color}
              emissive={emissive}
              emissiveIntensity={emissiveIntensity}
              roughness={0.88}
              side={DoubleSide}
              transparent={!t.rug}
              opacity={!t.rug && isPreview ? 0.65 : !t.rug && dragging && isOccupied ? 0.5 : 1}
            />
          </mesh>
        );
      })}
    </group>
  );
}
