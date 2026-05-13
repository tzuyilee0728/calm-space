import type { StationDefinition } from '@/lib/stations/types';
import RecordPlayer3D from '@/components/room3d/stations/RecordPlayer3D';
import SingingBowl3D from '@/components/room3d/stations/SingingBowl3D';
import BubbleWrap3D from '@/components/room3d/stations/BubbleWrap3D';
import BreathingGuide3D from '@/components/room3d/stations/BreathingGuide3D';
import LetItGo3D from '@/components/room3d/stations/LetItGo3D';
import RecordPlayerOverlay from './record-player/RecordPlayerOverlay';
import SingingBowlOverlay from './singing-bowl/SingingBowlOverlay';
import BubbleWrapOverlay from './bubble-wrap/BubbleWrapOverlay';
import BreathingGuideOverlay from './breathing-guide/BreathingGuideOverlay';
import LetItGoOverlay from './let-it-go/LetItGoOverlay';

export const stations: StationDefinition[] = [
  {
    id: 'record-player',
    name: 'Meditation Music',
    description: 'Ambient sounds for your mind',
    Room3DObject: RecordPlayer3D,
    Overlay: RecordPlayerOverlay,
    gridPosition: { col: 3, row: 3 },
    gridSize: { w: 4, h: 4 },
    accentColor: 'var(--color-peach)',
  },
  {
    id: 'singing-bowl',
    name: 'Singing Bowls',
    description: 'Tap the bowls to hear them sing',
    Room3DObject: SingingBowl3D,
    Overlay: SingingBowlOverlay,
    gridPosition: null,
    gridSize: { w: 2, h: 2 },
    accentColor: 'var(--color-lavender)',
  },
  {
    id: 'bubble-wrap',
    name: 'Bubble Wrap',
    description: 'Pop away your stress',
    Room3DObject: BubbleWrap3D,
    Overlay: BubbleWrapOverlay,
    gridPosition: null,
    gridSize: { w: 2, h: 2 },
    accentColor: 'var(--color-mint)',
  },
  {
    id: 'breathing-guide',
    name: 'Breathing Guide',
    description: 'Follow the rhythm and just breathe',
    Room3DObject: BreathingGuide3D,
    Overlay: BreathingGuideOverlay,
    gridPosition: null,
    gridSize: { w: 2, h: 2 },
    accentColor: 'var(--color-blue)',
  },
  {
    id: 'let-it-go',
    name: 'Let It Go',
    description: 'Name your fears and release them',
    Room3DObject: LetItGo3D,
    Overlay: LetItGoOverlay,
    gridPosition: null,
    gridSize: { w: 2, h: 2 },
    accentColor: 'var(--color-peach)',
  },
];
