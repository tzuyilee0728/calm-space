'use client';

import { createContext, useContext } from 'react';

export interface PlayerProfile {
  name: string;
}

export interface PlayerContextValue {
  /** Fractional grid position for smooth movement */
  position: { col: number; row: number };
  setPosition: (pos: { col: number; row: number }) => void;
  facing: 'left' | 'right';
  setFacing: (f: 'left' | 'right') => void;
  isWalking: boolean;
  setIsWalking: (w: boolean) => void;
  profile: PlayerProfile;
  setProfile: (p: PlayerProfile) => void;
  isProfileOpen: boolean;
  openProfile: () => void;
  closeProfile: () => void;
}

export const PlayerContext = createContext<PlayerContextValue>({
  position: { col: 5, row: 5 },
  setPosition: () => {},
  facing: 'right',
  setFacing: () => {},
  isWalking: false,
  setIsWalking: () => {},
  profile: { name: '' },
  setProfile: () => {},
  isProfileOpen: false,
  openProfile: () => {},
  closeProfile: () => {},
});

export function usePlayer() {
  return useContext(PlayerContext);
}
