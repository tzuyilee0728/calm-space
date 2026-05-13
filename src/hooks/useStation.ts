'use client';

import { createContext, useContext, type Dispatch, type SetStateAction } from 'react';
import type { GridPosition } from '@/lib/isometric/constants';

export interface DragState {
  stationId: string;
  clientX: number;
  clientY: number;
  previewPosition: GridPosition | null;
  source: 'grid' | 'toolbox';
  overToolbox: boolean;
}

interface StationState {
  activeStationId: string | null;
  openStation: (id: string) => void;
  closeStation: () => void;
  positions: Record<string, GridPosition | null>;
  moveStation: (id: string, pos: GridPosition) => void;
  storeStation: (id: string) => void;
  dragState: DragState | null;
  setDragState: Dispatch<SetStateAction<DragState | null>>;
  toolboxOpen: boolean;
  setToolboxOpen: (open: boolean) => void;
}

export const StationContext = createContext<StationState>({
  activeStationId: null,
  openStation: () => {},
  closeStation: () => {},
  positions: {},
  moveStation: () => {},
  storeStation: () => {},
  dragState: null,
  setDragState: () => {},
  toolboxOpen: false,
  setToolboxOpen: () => {},
});

export function useStation() {
  return useContext(StationContext);
}
