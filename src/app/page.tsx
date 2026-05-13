'use client';

import { useState, useCallback, useEffect, useMemo } from 'react';
import { StationContext, type DragState } from '@/hooks/useStation';
import { PlayerContext, type PlayerProfile } from '@/hooks/usePlayer';
import { stations } from '@/components/stations/StationRegistry';
import type { GridPosition } from '@/lib/isometric/constants';
import Scene3D from '@/components/room3d/Scene3D';
import StationOverlay from '@/components/stations/StationOverlay';
import PlayerProfilePopup from '@/components/player/PlayerProfilePopup';
import Toolbox from '@/components/toolbox/Toolbox';
import DragOverlay from '@/components/toolbox/DragOverlay';
import ToolboxDropStrip from '@/components/toolbox/ToolboxDropStrip';

function getDefaultPositions(): Record<string, GridPosition | null> {
  const map: Record<string, GridPosition | null> = {};
  for (const s of stations) {
    map[s.id] = s.gridPosition ? { ...s.gridPosition } : null;
  }
  return map;
}

const PROFILE_STORAGE_KEY = 'player-profile';

export default function Home() {
  const [activeStationId, setActiveStationId] = useState<string | null>(null);
  const [positions, setPositions] = useState<Record<string, GridPosition | null>>(getDefaultPositions);
  const [dragState, setDragState] = useState<DragState | null>(null);
  const [toolboxOpen, setToolboxOpen] = useState(false);

  const openStation = useCallback((id: string) => setActiveStationId(id), []);
  const closeStation = useCallback(() => setActiveStationId(null), []);
  const moveStation = useCallback((id: string, pos: GridPosition) => {
    setPositions(prev => ({ ...prev, [id]: pos }));
  }, []);
  const storeStation = useCallback((id: string) => {
    setPositions(prev => ({ ...prev, [id]: null }));
  }, []);

  // Start with the server-safe default; hydrate from localStorage after mount
  // so SSR and first client render match (avoids hydration mismatch).
  const [profile, setProfileState] = useState<PlayerProfile>({ name: '' });
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(PROFILE_STORAGE_KEY);
      if (raw) setProfileState(JSON.parse(raw));
    } catch { /* ignore */ }
  }, []);

  const setProfile = useCallback((p: PlayerProfile) => {
    setProfileState(p);
    try { localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(p)); } catch { /* ignore */ }
  }, []);

  const openProfile = useCallback(() => setIsProfileOpen(true), []);
  const closeProfile = useCallback(() => setIsProfileOpen(false), []);

  const stationCtx = useMemo(() => ({
    activeStationId, openStation, closeStation, positions, moveStation, storeStation,
    dragState, setDragState, toolboxOpen, setToolboxOpen,
  }), [activeStationId, openStation, closeStation, positions, moveStation, storeStation, dragState, toolboxOpen]);

  const playerCtx = useMemo(() => ({
    profile, setProfile,
    isProfileOpen, openProfile, closeProfile,
  }), [profile, setProfile, isProfileOpen, openProfile, closeProfile]);

  return (
    <StationContext.Provider value={stationCtx}>
      <PlayerContext.Provider value={playerCtx}>
        <Scene3D />
        <StationOverlay />
        <PlayerProfilePopup />
        <Toolbox />
        <ToolboxDropStrip />
        <DragOverlay />
      </PlayerContext.Provider>
    </StationContext.Provider>
  );
}
