'use client';

import { useEffect } from 'react';
import { useThree } from '@react-three/fiber';
import { useStation } from '@/hooks/useStation';
import { raycastGround, worldToGridSnapped } from '@/lib/isometric/world';
import { isInBounds, getOccupiedCells } from '@/lib/isometric/constants';
import { stations } from '@/components/stations/StationRegistry';

// Lives inside the <Canvas> so it can use R3F hooks. When a drag is active,
// listens to window pointermove, raycasts onto the ground plane, and publishes
// previewPosition back to the shared drag state.
export default function DragHandler3D() {
  const { camera, gl } = useThree();
  const { dragState, setDragState, positions } = useStation();

  const activeStationId = dragState?.stationId ?? null;
  const overToolbox = dragState?.overToolbox ?? false;

  useEffect(() => {
    if (!activeStationId || overToolbox) return;

    const station = stations.find(s => s.id === activeStationId);
    if (!station) return;
    const { w, h } = station.gridSize;

    const handleMove = (ev: PointerEvent) => {
      const rect = gl.domElement.getBoundingClientRect();
      const hit = raycastGround(ev.clientX, ev.clientY, rect, camera);
      if (!hit) return;
      const snapped = worldToGridSnapped(hit, w, h);
      const inBounds = isInBounds(snapped.col, snapped.row, w, h);

      let hasCollision = false;
      if (inBounds) {
        const cells = new Set(getOccupiedCells(snapped.col, snapped.row, w, h));
        for (const s of stations) {
          if (s.id === activeStationId) continue;
          const pos = positions[s.id];
          if (!pos) continue;
          const other = getOccupiedCells(pos.col, pos.row, s.gridSize.w, s.gridSize.h);
          for (const c of other) {
            if (cells.has(c)) { hasCollision = true; break; }
          }
          if (hasCollision) break;
        }
      }

      const preview = inBounds && !hasCollision ? snapped : null;

      setDragState(prev => {
        if (!prev || prev.stationId !== activeStationId) return prev;
        if (prev.overToolbox) return prev;
        const same =
          (prev.previewPosition === null && preview === null) ||
          (prev.previewPosition?.col === preview?.col && prev.previewPosition?.row === preview?.row);
        if (same) return prev;
        return { ...prev, previewPosition: preview };
      });
    };

    window.addEventListener('pointermove', handleMove);
    return () => window.removeEventListener('pointermove', handleMove);
  }, [activeStationId, overToolbox, camera, gl, setDragState, positions]);

  return null;
}
