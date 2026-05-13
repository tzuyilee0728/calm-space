'use client';

import { useCallback, useEffect, useRef } from 'react';
import { useStation, type DragState } from '@/hooks/useStation';

export function useDragStation(stationId: string, source: 'grid' | 'toolbox') {
  const {
    moveStation,
    storeStation,
    openStation,
    setDragState,
    dragState,
  } = useStation();

  const dragStartRef = useRef<{ x: number; y: number; moved: boolean } | null>(null);
  const toolboxRectRef = useRef<DOMRect | null>(null);
  // Mirror of the latest dragState for this station so onPointerUp can read
  // the previewPosition that DragHandler3D publishes asynchronously.
  const dragStateRef = useRef<DragState | null>(null);

  useEffect(() => {
    if (dragState?.stationId === stationId) {
      dragStateRef.current = dragState;
    }
  }, [dragState, stationId]);

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    e.preventDefault();
    dragStartRef.current = { x: e.clientX, y: e.clientY, moved: false };
    const toolboxEl = document.querySelector('[data-toolbox-dropzone]');
    toolboxRectRef.current = toolboxEl ? toolboxEl.getBoundingClientRect() : null;
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

    const tbRect = toolboxRectRef.current;
    // The right-edge fallback covers the desktop "auto-snap-to-closed-drawer"
    // UX. Skip it on mobile where the bottom sheet is always visible and the
    // rect query is reliable — otherwise right-edge touches falsely trigger
    // the drop zone.
    const isCoarse = typeof window !== 'undefined'
      && window.matchMedia('(pointer: coarse), (max-width: 768px)').matches;
    const overToolbox = source === 'grid' && (
      (tbRect && clientX >= tbRect.left && clientX <= tbRect.right && clientY >= tbRect.top && clientY <= tbRect.bottom)
      || (!isCoarse && clientX >= window.innerWidth - 80)
    );

    setDragState(prev => {
      // Preserve previewPosition from prior state (DragHandler3D publishes it);
      // clear it while hovering the toolbox.
      const previousPreview = prev?.stationId === stationId ? prev.previewPosition : null;
      return {
        stationId,
        clientX,
        clientY,
        previewPosition: overToolbox ? null : previousPreview,
        source,
        overToolbox: !!overToolbox,
      };
    });
  }, [stationId, source, setDragState]);

  const onPointerUp = useCallback(() => {
    const wasDragging = dragStartRef.current?.moved;
    const drag = dragStateRef.current;
    dragStartRef.current = null;
    dragStateRef.current = null;

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
    dragStateRef.current = null;
    setDragState(null);
  }, [setDragState]);

  return { onPointerDown, onPointerMove, onPointerUp, onPointerCancel };
}
