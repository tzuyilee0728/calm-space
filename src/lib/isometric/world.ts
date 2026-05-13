import { Raycaster, Vector2, Vector3, Plane, type Camera } from 'three';
import {
  GRID_COLS,
  GRID_ROWS,
  type GridPosition,
} from './constants';

// Each grid tile is TILE_SIZE world units. Grid is centered at the world origin.
// Ground plane is at y = 0.
// x spans [-GRID_COLS * TILE_SIZE / 2, GRID_COLS * TILE_SIZE / 2]; z similarly.

export const TILE_SIZE = 0.8;

/** Grid (col, row) -> world position at the CENTER of the cell footprint (w x h). */
export function gridToWorld(col: number, row: number, w = 1, h = 1): [number, number, number] {
  const cx = (col + w / 2 - GRID_COLS / 2) * TILE_SIZE;
  const cz = (row + h / 2 - GRID_ROWS / 2) * TILE_SIZE;
  return [cx, 0, cz];
}

/** World point on the ground plane -> snapped grid (col, row) for a footprint of size w x h. */
export function worldToGridSnapped(point: Vector3, w = 1, h = 1): GridPosition {
  const col = Math.round(point.x / TILE_SIZE + GRID_COLS / 2 - w / 2);
  const row = Math.round(point.z / TILE_SIZE + GRID_ROWS / 2 - h / 2);
  return { col, row };
}

const GROUND_PLANE = new Plane(new Vector3(0, 1, 0), 0);
const _raycaster = new Raycaster();
const _ndc = new Vector2();
const _hit = new Vector3();

/**
 * Raycast a viewport pointer (clientX, clientY) onto the ground plane.
 * Returns the world intersection point, or null if the camera is parallel to the ground.
 */
export function raycastGround(
  clientX: number,
  clientY: number,
  canvasRect: DOMRect,
  camera: Camera,
): Vector3 | null {
  _ndc.x = ((clientX - canvasRect.left) / canvasRect.width) * 2 - 1;
  _ndc.y = -((clientY - canvasRect.top) / canvasRect.height) * 2 + 1;
  _raycaster.setFromCamera(_ndc, camera);
  const hit = _raycaster.ray.intersectPlane(GROUND_PLANE, _hit);
  return hit ? hit.clone() : null;
}
