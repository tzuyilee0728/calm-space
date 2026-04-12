'use client';

import { useCallback, useRef } from 'react';
import { useStation, type DragState } from '@/hooks/useStation';
import {
  screenToGridSnapped,
  isInBounds,
  getOccupiedCells,
} from '@/lib/isometric/constants';
import { stations } from '@/components/stations/StationRegistry';

export function useDragStation(stationId: string, source: 'grid' | 'toolbox') {
  const {
    positions,
    moveStation,
    storeStation,
    openStation,
    setDragState,
  } = useStation();

  const dragStartRef = useRef<{ x: number; y: number; moved: boolean } | null>(null);
  const sceneRectRef = useRef<DOMRect | null>(null);
  const toolboxRectRef = useRef<DOMRect | null>(null);
  const latestDragRef = useRef<DragState | null>(null);

  const station = stations.find(s => s.id === stationId)!;
  const { w, h } = station.gridSize;

  const checkCollision = useCallback((col: number, row: number): boolean => {
    const newCells = new Set(getOccupiedCells(col, row, w, h));
    for (const s of stations) {
      if (s.id === stationId) continue;
      const pos = positions[s.id];
      if (pos == null) continue;
      const otherCells = getOccupiedCells(pos.col, pos.row, s.gridSize.w, s.gridSize.h);
      for (const cell of otherCells) {
        if (newCells.has(cell)) return true;
      }
    }
    return false;
  }, [positions, stationId, w, h]);

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    e.preventDefault();
    dragStartRef.current = { x: e.clientX, y: e.clientY, moved: false };
    const sceneEl = document.querySelector('[data-isometric-scene]');
    sceneRectRef.current = sceneEl ? sceneEl.getBoundingClientRect() : null;
    const toolboxEl = document.querySelector('[data-toolbox-dropzone]');
    toolboxRectRef.current = toolboxEl ? toolboxEl.getBoundingClientRect() : null;
    // Capture on currentTarget (the div with handlers) so events keep flowing
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  }, []);

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragStartRef.current) return;

    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < 8 && !dragStartRef.current.moved) return;
    dragStartRef.current.moved = true;

    const clientX = e.clientX;
    const clientY = e.clientY;

    // Check if over toolbox area (right edge of screen, ~80px strip)
    const tbRect = toolboxRectRef.current;
    const overToolbox = source === 'grid' && (
      (tbRect && clientX >= tbRect.left && clientX <= tbRect.right && clientY >= tbRect.top && clientY <= tbRect.bottom)
      || clientX >= window.innerWidth - 80
    );

    // Check if over scene for grid snapping
    let previewPosition = null;
    const sceneRect = sceneRectRef.current;
    if (sceneRect && !overToolbox) {
      const sceneX = clientX - sceneRect.left;
      const sceneY = clientY - sceneRect.top;
      const snapped = screenToGridSnapped(sceneX, sceneY);
      const inBounds = isInBounds(snapped.col, snapped.row, w, h);
      const hasCollision = inBounds && checkCollision(snapped.col, snapped.row);
      if (inBounds && !hasCollision) {
        previewPosition = snapped;
      }
    }

    const newState: DragState = {
      stationId,
      clientX,
      clientY,
      previewPosition,
      source,
      overToolbox: !!overToolbox,
    };
    latestDragRef.current = newState;
    setDragState(newState);
  }, [stationId, source, w, h, checkCollision, setDragState]);

  const onPointerUp = useCallback(() => {
    const wasDragging = dragStartRef.current?.moved;
    const drag = latestDragRef.current;
    dragStartRef.current = null;
    latestDragRef.current = null;

    if (wasDragging && drag?.overToolbox) {
      storeStation(stationId);
      setDragState(null);
    } else if (wasDragging && drag?.previewPosition) {
      moveStation(stationId, drag.previewPosition);
      setDragState(null);
    } else if (wasDragging) {
      setDragState(null);
    } else {
      setDragState(null);
      openStation(stationId);
    }
  }, [stationId, moveStation, storeStation, setDragState, openStation]);

  const onPointerCancel = useCallback(() => {
    dragStartRef.current = null;
    latestDragRef.current = null;
    setDragState(null);
  }, [setDragState]);

  return { onPointerDown, onPointerMove, onPointerUp, onPointerCancel };
}
