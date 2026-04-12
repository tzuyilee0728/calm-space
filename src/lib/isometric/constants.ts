// Isometric grid constants and math utilities

export const TILE_WIDTH = 100;
export const TILE_HEIGHT = 50;
export const GRID_COLS = 10;
export const GRID_ROWS = 10;

// Bounding box of the full isometric floor
export const FLOOR_WIDTH = (GRID_COLS + GRID_ROWS) * (TILE_WIDTH / 2);   // 550
export const FLOOR_HEIGHT = (GRID_COLS + GRID_ROWS) * (TILE_HEIGHT / 2); // 275

// Origin offset so grid(0,0) starts at the top of the diamond
export const ORIGIN_X = GRID_ROWS * (TILE_WIDTH / 2);  // 250
export const ORIGIN_Y = 0;

// Extra vertical headroom for tall objects above the floor
export const SCENE_HEADROOM = 150;
export const SCENE_WIDTH = FLOOR_WIDTH;
export const SCENE_HEIGHT = FLOOR_HEIGHT + SCENE_HEADROOM;

export type GridPosition = { col: number; row: number };
export type GridSize = { w: number; h: number };

/** Convert grid coordinates to screen pixel position (top corner of the diamond tile) */
export function gridToScreen(col: number, row: number): { x: number; y: number } {
  return {
    x: (col - row) * (TILE_WIDTH / 2) + ORIGIN_X,
    y: (col + row) * (TILE_HEIGHT / 2) + ORIGIN_Y + SCENE_HEADROOM,
  };
}

/** Get the 4 diamond corner points for a floor tile at (col, row) */
export function getTileDiamondPoints(col: number, row: number): string {
  const top = gridToScreen(col, row);
  const right = gridToScreen(col + 1, row);
  const bottom = gridToScreen(col + 1, row + 1);
  const left = gridToScreen(col, row + 1);
  return `${top.x},${top.y} ${right.x},${right.y} ${bottom.x},${bottom.y} ${left.x},${left.y}`;
}

/**
 * Get the screen position for anchoring a station on its grid footprint.
 * Returns the center of the footprint diamond (visually where the object "sits").
 */
export function getFootprintCenter(col: number, row: number, w: number, h: number): { x: number; y: number } {
  // Center of the footprint = average of all 4 diamond corners
  const top = gridToScreen(col, row);
  const right = gridToScreen(col + w, row);
  const bottom = gridToScreen(col + w, row + h);
  const left = gridToScreen(col, row + h);
  return {
    x: (top.x + right.x + bottom.x + left.x) / 4,
    y: (top.y + right.y + bottom.y + left.y) / 4,
  };
}

/**
 * Get the front (bottom-most) corner of the footprint diamond.
 * Station SVGs anchor their bottom-center here.
 */
export function getFootprintAnchor(col: number, row: number, w: number, h: number): { x: number; y: number } {
  return gridToScreen(col + w, row + h);
}

/** Convert screen pixel position back to grid coordinates (fractional) */
export function screenToGrid(screenX: number, screenY: number): { col: number; row: number } {
  const adjustedY = screenY - ORIGIN_Y - SCENE_HEADROOM;
  const u = (screenX - ORIGIN_X) / (TILE_WIDTH / 2);
  const v = adjustedY / (TILE_HEIGHT / 2);
  return {
    col: (u + v) / 2,
    row: (v - u) / 2,
  };
}

/** Snap screen coords to nearest grid cell (rounded) */
export function screenToGridSnapped(screenX: number, screenY: number): GridPosition {
  const { col, row } = screenToGrid(screenX, screenY);
  return {
    col: Math.round(col),
    row: Math.round(row),
  };
}

/** Check if a footprint fits within grid bounds */
export function isInBounds(col: number, row: number, w: number, h: number): boolean {
  return col >= 0 && row >= 0 && col + w <= GRID_COLS && row + h <= GRID_ROWS;
}

/** Get all cells occupied by a footprint */
export function getOccupiedCells(col: number, row: number, w: number, h: number): string[] {
  const cells: string[] = [];
  for (let r = row; r < row + h; r++) {
    for (let c = col; c < col + w; c++) {
      cells.push(`${c},${r}`);
    }
  }
  return cells;
}

/** Depth index for sorting — higher values render on top (closer to camera) */
export function getDepthIndex(col: number, row: number, w: number, h: number): number {
  return (col + w - 1) + (row + h - 1);
}
