'use client';

import {
  GRID_COLS,
  GRID_ROWS,
  TILE_WIDTH,
  TILE_HEIGHT,
  SCENE_WIDTH,
  SCENE_HEIGHT,
  getTileDiamondPoints,
  gridToScreen,
  getOccupiedCells,
} from '@/lib/isometric/constants';
import { useStation } from '@/hooks/useStation';
import { stations } from '@/components/stations/StationRegistry';

// Grass greens — soft Morandi-ish palette
const GRASS_A = ['#b8d4a3', '#a9cb94']; // lighter pair
const GRASS_B = ['#a3c98e', '#99c085']; // slightly darker pair

// Deterministic "random" for flower placement based on tile coords
function seededRand(col: number, row: number, salt: number): number {
  const x = Math.sin(col * 127.1 + row * 311.7 + salt * 53.3) * 43758.5453;
  return x - Math.floor(x);
}

export default function IsometricFloor() {
  const { dragState, positions } = useStation();

  const tiles: { col: number; row: number; points: string }[] = [];
  for (let row = 0; row < GRID_ROWS; row++) {
    for (let col = 0; col < GRID_COLS; col++) {
      tiles.push({ col, row, points: getTileDiamondPoints(col, row) });
    }
  }

  // Occupied cells (excluding dragged station)
  const occupiedCells = new Set<string>();
  for (const s of stations) {
    if (dragState && s.id === dragState.stationId) continue;
    const pos = positions[s.id];
    if (pos == null) continue; // stored in toolbox
    for (const cell of getOccupiedCells(pos.col, pos.row, s.gridSize.w, s.gridSize.h)) {
      occupiedCells.add(cell);
    }
  }

  // Preview cells for drag highlight
  const previewCells = new Set<string>();
  let previewValid = false;
  if (dragState?.previewPosition) {
    const draggedStation = stations.find(s => s.id === dragState.stationId);
    if (draggedStation) {
      previewValid = true;
      for (const cell of getOccupiedCells(
        dragState.previewPosition.col,
        dragState.previewPosition.row,
        draggedStation.gridSize.w,
        draggedStation.gridSize.h,
      )) {
        previewCells.add(cell);
      }
    }
  }

  // Floor outline
  const floorTop = gridToScreen(0, 0);
  const floorRight = gridToScreen(GRID_COLS, 0);
  const floorBottom = gridToScreen(GRID_COLS, GRID_ROWS);
  const floorLeft = gridToScreen(0, GRID_ROWS);

  // Generate flower positions — a few per tile, deterministic
  const flowers: { x: number; y: number; size: number; delay: number }[] = [];
  for (let row = 0; row < GRID_ROWS; row++) {
    for (let col = 0; col < GRID_COLS; col++) {
      // ~30% of tiles get a flower
      if (seededRand(col, row, 0) > 0.3) continue;

      const tileTop = gridToScreen(col, row);
      const tileRight = gridToScreen(col + 1, row);
      const tileBottom = gridToScreen(col + 1, row + 1);
      const tileLeft = gridToScreen(col, row + 1);
      // Center of tile
      const cx = (tileTop.x + tileRight.x + tileBottom.x + tileLeft.x) / 4;
      const cy = (tileTop.y + tileRight.y + tileBottom.y + tileLeft.y) / 4;
      // Offset within tile
      const ox = (seededRand(col, row, 1) - 0.5) * TILE_WIDTH * 0.4;
      const oy = (seededRand(col, row, 2) - 0.5) * TILE_HEIGHT * 0.4;
      const size = 3 + seededRand(col, row, 3) * 3;
      const delay = seededRand(col, row, 4) * 4;

      const r2 = (n: number) => Math.round(n * 100) / 100;
      flowers.push({ x: r2(cx + ox), y: r2(cy + oy), size: r2(size), delay: r2(delay) });

      // Some tiles get a second flower
      if (seededRand(col, row, 5) < 0.3) {
        const ox2 = (seededRand(col, row, 6) - 0.5) * TILE_WIDTH * 0.35;
        const oy2 = (seededRand(col, row, 7) - 0.5) * TILE_HEIGHT * 0.35;
        flowers.push({
          x: r2(cx + ox2),
          y: r2(cy + oy2),
          size: r2(2 + seededRand(col, row, 8) * 2),
          delay: r2(seededRand(col, row, 9) * 4 + 1),
        });
      }
    }
  }

  return (
    <svg
      width={SCENE_WIDTH}
      height={SCENE_HEIGHT}
      viewBox={`0 0 ${SCENE_WIDTH} ${SCENE_HEIGHT}`}
      className="absolute inset-0"
    >

      {/* Floor shadow */}
      <polygon
        points={`${floorTop.x},${floorTop.y + 8} ${floorRight.x + 6},${floorRight.y + 10} ${floorBottom.x},${floorBottom.y + 12} ${floorLeft.x - 6},${floorLeft.y + 10}`}
        fill="rgba(80, 100, 60, 0.08)"
      />

      {/* Floor base — darker green border */}
      <polygon
        points={`${floorTop.x},${floorTop.y} ${floorRight.x},${floorRight.y} ${floorBottom.x},${floorBottom.y} ${floorLeft.x},${floorLeft.y}`}
        fill="#8ab578"
        stroke="#6a9a5a"
        strokeWidth="2"
        strokeOpacity="0.4"
      />

      {/* Grass tiles */}
      {tiles.map(({ col, row, points }) => {
        const key = `${col},${row}`;
        const isOccupied = occupiedCells.has(key);
        const isPreview = previewCells.has(key);
        const checker = (col + row) % 2;
        const rowBand = row % 2;
        const colors = rowBand === 0 ? GRASS_A : GRASS_B;

        let fill = colors[checker];
        let strokeColor = '#7aaa68';
        let strokeOpacity = 0.2;
        let strokeWidth = 0.8;

        if (isPreview && previewValid) {
          fill = 'rgba(200, 230, 180, 0.7)'; // bright green highlight
          strokeColor = '#5a9a40';
          strokeOpacity = 0.6;
          strokeWidth = 1.5;
        } else if (dragState && isOccupied) {
          fill = 'rgba(200, 160, 160, 0.35)'; // reddish tint — blocked
        } else if (dragState && !isOccupied) {
          strokeOpacity = 0.3;
        }

        return (
          <polygon
            key={`${col}-${row}`}
            points={points}
            fill={fill}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            strokeOpacity={strokeOpacity}
          />
        );
      })}

      {/* Small white flowers sparkling */}
      {flowers.map((f, i) => (
        <g key={i} className="animate-sparkle" style={{ animationDelay: `${f.delay}s`, animationDuration: '3s' }}>
          {/* Flower petals — tiny daisy shape */}
          <circle cx={f.x} cy={f.y - f.size * 0.5} r={f.size * 0.4} fill="white" opacity="0.85" />
          <circle cx={f.x + f.size * 0.45} cy={f.y} r={f.size * 0.4} fill="white" opacity="0.8" />
          <circle cx={f.x - f.size * 0.45} cy={f.y} r={f.size * 0.4} fill="white" opacity="0.8" />
          <circle cx={f.x} cy={f.y + f.size * 0.5} r={f.size * 0.4} fill="white" opacity="0.75" />
          {/* Center dot */}
          <circle cx={f.x} cy={f.y} r={f.size * 0.25} fill="#f0e0a0" opacity="0.9" />
        </g>
      ))}
    </svg>
  );
}
