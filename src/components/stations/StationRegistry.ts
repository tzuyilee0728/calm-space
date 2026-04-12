import { lazy } from 'react';
import type { StationDefinition } from '@/lib/stations/types';
import RecordPlayerObject from './record-player/RecordPlayerObject';
import SingingBowlObject from './singing-bowl/SingingBowlObject';
import BubbleWrapObject from './bubble-wrap/BubbleWrapObject';
import BreathingGuideObject from './breathing-guide/BreathingGuideObject';
import LetItGoObject from './let-it-go/LetItGoObject';

export const stations: StationDefinition[] = [
  {
    id: 'record-player',
    name: 'Meditation Music',
    description: 'Ambient sounds for your mind',
    RoomObject: RecordPlayerObject,
    Overlay: lazy(() => import('./record-player/RecordPlayerOverlay')),
    gridPosition: { col: 0, row: 0 },
    gridSize: { w: 2, h: 2 },
    accentColor: 'var(--color-peach)',
  },
  {
    id: 'singing-bowl',
    name: 'Singing Bowls',
    description: 'Tap the bowls to hear them sing',
    RoomObject: SingingBowlObject,
    Overlay: lazy(() => import('./singing-bowl/SingingBowlOverlay')),
    gridPosition: { col: 3, row: 1 },
    gridSize: { w: 2, h: 2 },
    accentColor: 'var(--color-lavender)',
  },
  {
    id: 'bubble-wrap',
    name: 'Bubble Wrap',
    description: 'Pop away your stress',
    RoomObject: BubbleWrapObject,
    Overlay: lazy(() => import('./bubble-wrap/BubbleWrapOverlay')),
    gridPosition: { col: 1, row: 3 },
    gridSize: { w: 2, h: 2 },
    accentColor: 'var(--color-mint)',
  },
  {
    id: 'breathing-guide',
    name: 'Breathing Guide',
    description: 'Follow the rhythm and just breathe',
    RoomObject: BreathingGuideObject,
    Overlay: lazy(() => import('./breathing-guide/BreathingGuideOverlay')),
    gridPosition: { col: 5, row: 0 },
    gridSize: { w: 2, h: 2 },
    accentColor: 'var(--color-blue)',
  },
  {
    id: 'let-it-go',
    name: 'Let It Go',
    description: 'Name your fears and release them',
    RoomObject: LetItGoObject,
    Overlay: lazy(() => import('./let-it-go/LetItGoOverlay')),
    gridPosition: { col: 3, row: 5 },
    gridSize: { w: 2, h: 2 },
    accentColor: 'var(--color-peach)',
  },
];
