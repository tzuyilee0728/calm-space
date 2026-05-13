import { ComponentType } from 'react';
import type { GridPosition, GridSize } from '@/lib/isometric/constants';

export interface StationDefinition {
  id: string;
  name: string;
  description: string;
  Room3DObject: ComponentType<{ isActive?: boolean }>;
  Overlay: ComponentType;
  /** Starting grid cell when first placed. `null` = starts in toolbox. */
  gridPosition: GridPosition | null;
  gridSize: GridSize;
  accentColor: string;
}
