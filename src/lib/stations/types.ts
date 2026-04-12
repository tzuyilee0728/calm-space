import { LazyExoticComponent, ComponentType } from 'react';
import type { GridPosition, GridSize } from '@/lib/isometric/constants';

export interface StationDefinition {
  id: string;
  name: string;
  description: string;
  RoomObject: ComponentType<{ isActive: boolean; onActivate: () => void }>;
  Overlay: LazyExoticComponent<ComponentType>;
  gridPosition: GridPosition;  // { col, row } — top-left cell on the isometric grid
  gridSize: GridSize;          // { w, h } — how many cells this station occupies
  accentColor: string;
}
