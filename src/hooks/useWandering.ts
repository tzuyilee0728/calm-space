'use client';

import { useEffect, useRef } from 'react';
import { GRID_COLS, GRID_ROWS, getOccupiedCells } from '@/lib/isometric/constants';
import type { GridPosition } from '@/lib/isometric/constants';
import { stations } from '@/components/stations/StationRegistry';

const WALK_SPEED = 1.5; // tiles per second
const IDLE_MIN = 2000;  // ms
const IDLE_MAX = 5000;  // ms
const WANDER_RADIUS = 3;

function getOccupied(stationPositions: Record<string, GridPosition | null>): Set<string> {
  const cells = new Set<string>();
  for (const s of stations) {
    const pos = stationPositions[s.id];
    if (pos == null) continue; // stored in toolbox
    for (const cell of getOccupiedCells(pos.col, pos.row, s.gridSize.w, s.gridSize.h)) {
      cells.add(cell);
    }
  }
  return cells;
}

function pickTarget(currentCol: number, currentRow: number, occupied: Set<string>): { col: number; row: number } {
  for (let i = 0; i < 20; i++) {
    const dc = Math.floor(Math.random() * (WANDER_RADIUS * 2 + 1)) - WANDER_RADIUS;
    const dr = Math.floor(Math.random() * (WANDER_RADIUS * 2 + 1)) - WANDER_RADIUS;
    if (dc === 0 && dr === 0) continue;
    const nc = Math.round(currentCol) + dc;
    const nr = Math.round(currentRow) + dr;
    if (nc < 0 || nr < 0 || nc >= GRID_COLS || nr >= GRID_ROWS) continue;
    if (occupied.has(`${nc},${nr}`)) continue;
    return { col: nc, row: nr };
  }
  return { col: Math.round(currentCol), row: Math.round(currentRow) };
}

export function useWandering(
  initialPosition: { col: number; row: number },
  stationPositions: Record<string, GridPosition | null>,
  paused: boolean,
  onUpdate: (pos: { col: number; row: number }, facing: 'left' | 'right', walking: boolean) => void,
) {
  // Store latest values in refs so the rAF loop always reads fresh data
  const latestRef = useRef({ stationPositions, paused, onUpdate });

  useEffect(() => {
    latestRef.current = { stationPositions, paused, onUpdate };
  }, [stationPositions, paused, onUpdate]);

  useEffect(() => {
    let col = initialPosition.col;
    let row = initialPosition.row;
    let targetCol = col;
    let targetRow = row;
    let phase: 'idle' | 'walking' = 'idle';
    let idleUntil = performance.now() + 1500;
    let lastTime = 0;
    let rafId: number;

    const tick = (time: number) => {
      if (lastTime === 0) lastTime = time;
      const dt = Math.min((time - lastTime) / 1000, 0.1);
      lastTime = time;

      const { paused: isPaused, onUpdate: update, stationPositions: positions } = latestRef.current;

      if (isPaused) {
        update({ col, row }, 'right', false);
        rafId = requestAnimationFrame(tick);
        return;
      }

      if (phase === 'idle') {
        if (time >= idleUntil) {
          const occupied = getOccupied(positions);
          const target = pickTarget(col, row, occupied);
          targetCol = target.col;
          targetRow = target.row;
          phase = 'walking';
        }
        update({ col, row }, 'right', false);
      } else {
        const dx = targetCol - col;
        const dy = targetRow - row;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 0.05) {
          col = targetCol;
          row = targetRow;
          phase = 'idle';
          idleUntil = time + IDLE_MIN + Math.random() * (IDLE_MAX - IDLE_MIN);
          update({ col, row }, dx >= 0 ? 'right' : 'left', false);
        } else {
          const step = Math.min(WALK_SPEED * dt, dist);
          col += (dx / dist) * step;
          row += (dy / dist) * step;
          update({ col, row }, dx >= 0 ? 'right' : 'left', true);
        }
      }

      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  // Only run once on mount — latest values are read from ref
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
