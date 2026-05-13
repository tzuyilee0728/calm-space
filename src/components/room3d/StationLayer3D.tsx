'use client';

import { memo, useCallback, useEffect, useMemo, useRef, useState, type ComponentType } from 'react';
import { useThree, type ThreeEvent } from '@react-three/fiber';
import { gridToWorld, worldToGridSnapped, raycastGround } from '@/lib/isometric/world';
import { isInBounds, getOccupiedCells, type GridPosition } from '@/lib/isometric/constants';
import { useStation } from '@/hooks/useStation';
import { stations } from '@/components/stations/StationRegistry';

export type PreviewCells = { col: number; row: number; w: number; h: number } | null;

type Props = {
  setOrbitEnabled: (enabled: boolean) => void;
  setPreview: (p: PreviewCells) => void;
  setOccupied: (cells: Set<string>) => void;
  panMode: boolean;
};

const DRAG_THRESHOLD_PX = 8;
// Per-station visual scale overrides. Keyed by station id.
const STATION_SCALE: Record<string, number> = {
  'record-player': 1.85,
};

// Memoized child so unrelated parent re-renders (toolbox open, drag preview, profile, etc.)
// don't reconcile every placed station's <group> subtree.
type PlacedStationProps = {
  id: string;
  x: number;
  z: number;
  w: number;
  h: number;
  scale: number;
  isDragging: boolean;
  Component: ComponentType<{ isActive?: boolean }>;
  onPointerDown: (e: ThreeEvent<PointerEvent>, id: string, w: number, h: number) => void;
};

const PlacedStation = memo(function PlacedStation({
  id, x, z, w, h, scale, isDragging, Component, onPointerDown,
}: PlacedStationProps) {
  const position = useMemo<[number, number, number]>(
    () => [x, isDragging ? 0.2 : 0, z],
    [x, z, isDragging],
  );
  const handlePointerDown = useCallback(
    (e: ThreeEvent<PointerEvent>) => onPointerDown(e, id, w, h),
    [onPointerDown, id, w, h],
  );
  return (
    <group position={position} scale={scale} onPointerDown={handlePointerDown}>
      <Component />
    </group>
  );
});

export default function StationLayer3D({ setOrbitEnabled, setPreview, setOccupied, panMode }: Props) {
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const { camera, gl } = useThree();
  const { openStation, positions, moveStation, storeStation } = useStation();
  const panModeRef = useRef(panMode);
  useEffect(() => {
    panModeRef.current = panMode;
  }, [panMode]);

  // Build the list of currently placed stations from context.
  // Memoized so its identity is stable across unrelated re-renders — feeds the
  // occupied-cells effect and the <PlacedStation> children below.
  const placed = useMemo(
    () => stations
      .filter(s => positions[s.id] != null)
      .map(s => ({
        id: s.id,
        pos: positions[s.id] as GridPosition,
        w: s.gridSize.w,
        h: s.gridSize.h,
        Component: s.Room3DObject,
      })),
    [positions],
  );

  // Publish "occupied" cells (excluding the dragging station) so GroundPlane can dim/block them.
  useEffect(() => {
    const occ = new Set<string>();
    for (const p of placed) {
      if (p.id === draggingId) continue;
      for (const c of getOccupiedCells(p.pos.col, p.pos.row, p.w, p.h)) occ.add(c);
    }
    setOccupied(occ);
  }, [placed, draggingId, setOccupied]);

  const onStationPointerDown = useCallback((
    e: ThreeEvent<PointerEvent>,
    id: string,
    w: number,
    h: number,
  ) => {
    // Space held → let OrbitControls handle the pan gesture instead of starting a drag.
    if (panModeRef.current) return;
    e.stopPropagation();
    const startX = e.clientX;
    const startY = e.clientY;
    const canvas = gl.domElement;
    // Snapshot other stations' positions to compute collisions during drag.
    const snapshot = stations
      .filter(s => s.id !== id && positions[s.id] != null)
      .map(s => ({
        id: s.id,
        pos: positions[s.id] as GridPosition,
        w: s.gridSize.w,
        h: s.gridSize.h,
      }));

    let activated = false;
    let lastValid: { col: number; row: number } | null = null;
    let overToolbox = false;
    const toolboxEl = document.querySelector('[data-toolbox-dropzone]');
    const toolboxRect = toolboxEl ? toolboxEl.getBoundingClientRect() : null;

    const collides = (col: number, row: number) => {
      const cells = new Set(getOccupiedCells(col, row, w, h));
      for (const other of snapshot) {
        for (const c of getOccupiedCells(other.pos.col, other.pos.row, other.w, other.h)) {
          if (cells.has(c)) return true;
        }
      }
      return false;
    };

    const handleMove = (ev: PointerEvent) => {
      if (!activated) {
        const dx = ev.clientX - startX;
        const dy = ev.clientY - startY;
        if (dx * dx + dy * dy < DRAG_THRESHOLD_PX * DRAG_THRESHOLD_PX) return;
        activated = true;
        setOrbitEnabled(false);
        setDraggingId(id);
      }

      overToolbox = !!(
        (toolboxRect && ev.clientX >= toolboxRect.left && ev.clientX <= toolboxRect.right && ev.clientY >= toolboxRect.top && ev.clientY <= toolboxRect.bottom)
        || ev.clientX >= window.innerWidth - 80
      );

      if (overToolbox) {
        setPreview(null);
        lastValid = null;
        return;
      }

      const rect = canvas.getBoundingClientRect();
      const hit = raycastGround(ev.clientX, ev.clientY, rect, camera);
      if (!hit) return;
      const snapped = worldToGridSnapped(hit, w, h);
      const inBounds = isInBounds(snapped.col, snapped.row, w, h);
      const hasCollision = inBounds && collides(snapped.col, snapped.row);
      if (inBounds && !hasCollision) {
        lastValid = snapped;
        setPreview({ ...snapped, w, h });
      } else {
        setPreview(null);
      }
    };

    const handleUp = () => {
      window.removeEventListener('pointermove', handleMove);
      window.removeEventListener('pointerup', handleUp);
      window.removeEventListener('pointercancel', handleUp);

      if (!activated) {
        openStation(id);
        return;
      }

      setDraggingId(null);
      setPreview(null);
      setOrbitEnabled(true);
      if (overToolbox) {
        storeStation(id);
      } else if (lastValid) {
        moveStation(id, lastValid);
      }
    };

    window.addEventListener('pointermove', handleMove);
    window.addEventListener('pointerup', handleUp);
    window.addEventListener('pointercancel', handleUp);
  }, [camera, gl, openStation, positions, moveStation, storeStation, setOrbitEnabled, setPreview]);

  return (
    <group>
      {placed.map((p) => {
        const [x, , z] = gridToWorld(p.pos.col, p.pos.row, p.w, p.h);
        return (
          <PlacedStation
            key={p.id}
            id={p.id}
            x={x}
            z={z}
            w={p.w}
            h={p.h}
            scale={STATION_SCALE[p.id] ?? 1}
            isDragging={draggingId === p.id}
            Component={p.Component}
            onPointerDown={onStationPointerDown}
          />
        );
      })}
    </group>
  );
}
