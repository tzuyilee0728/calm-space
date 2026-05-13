// Grid constants and math utilities (grid-space only; world-space lives in world.ts)

export const GRID_COLS = 10;
export const GRID_ROWS = 10;

// The visual rug covers the inner region of the grid; the ring of cells around
// it sits on the wooden floor but is still placeable.
export const RUG_COLS = 8;
export const RUG_ROWS = 8;
export const RUG_OFFSET_COL = Math.floor((GRID_COLS - RUG_COLS) / 2); // 1
export const RUG_OFFSET_ROW = Math.floor((GRID_ROWS - RUG_ROWS) / 2); // 1

/** True if the (col, row) cell falls inside the visual rug region. */
export function isRugCell(col: number, row: number): boolean {
  return (
    col >= RUG_OFFSET_COL &&
    col < RUG_OFFSET_COL + RUG_COLS &&
    row >= RUG_OFFSET_ROW &&
    row < RUG_OFFSET_ROW + RUG_ROWS
  );
}

export type GridPosition = { col: number; row: number };
export type GridSize = { w: number; h: number };

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
