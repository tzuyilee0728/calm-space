'use client';

import { createContext, useContext } from 'react';

export interface PlayerProfile {
  name: string;
}

export interface PlayerContextValue {
  profile: PlayerProfile;
  setProfile: (p: PlayerProfile) => void;
  isProfileOpen: boolean;
  openProfile: () => void;
  closeProfile: () => void;
}

export const PlayerContext = createContext<PlayerContextValue>({
  profile: { name: '' },
  setProfile: () => {},
  isProfileOpen: false,
  openProfile: () => {},
  closeProfile: () => {},
});

export function usePlayer() {
  return useContext(PlayerContext);
}
