'use client';

import { useState, useCallback, useMemo } from 'react';
import { StationContext, type DragState } from '@/hooks/useStation';
import { PlayerContext, type PlayerProfile } from '@/hooks/usePlayer';
import { useWandering } from '@/hooks/useWandering';
import { stations } from '@/components/stations/StationRegistry';
import type { GridPosition } from '@/lib/isometric/constants';
import IsometricRoom from '@/components/room/IsometricRoom';
import StationOverlay from '@/components/stations/StationOverlay';
import PlayerProfilePopup from '@/components/player/PlayerProfilePopup';
import Toolbox from '@/components/toolbox/Toolbox';
import DragOverlay from '@/components/toolbox/DragOverlay';
import ToolboxDropStrip from '@/components/toolbox/ToolboxDropStrip';

// Build default positions from registry
function getDefaultPositions(): Record<string, GridPosition | null> {
  const map: Record<string, GridPosition | null> = {};
  for (const s of stations) {
    map[s.id] = { ...s.gridPosition };
  }
  return map;
}

const PLAYER_START = { col: 5, row: 5 };

function loadProfile(): PlayerProfile {
  if (typeof window === 'undefined') return { name: '' };
  try {
    const raw = localStorage.getItem('player-profile');
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return { name: '' };
}

export default function Home() {
  // Station state
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

  // Player state
  const [playerPos, setPlayerPos] = useState(PLAYER_START);
  const [facing, setFacing] = useState<'left' | 'right'>('right');
  const [isWalking, setIsWalking] = useState(false);
  const [profile, setProfileState] = useState<PlayerProfile>(loadProfile);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const setProfile = useCallback((p: PlayerProfile) => {
    setProfileState(p);
    try { localStorage.setItem('player-profile', JSON.stringify(p)); } catch { /* ignore */ }
  }, []);

  const openProfile = useCallback(() => setIsProfileOpen(true), []);
  const closeProfile = useCallback(() => setIsProfileOpen(false), []);

  // Wandering AI
  const onWanderUpdate = useCallback((pos: { col: number; row: number }, f: 'left' | 'right', w: boolean) => {
    setPlayerPos(pos);
    setFacing(f);
    setIsWalking(w);
  }, []);

  useWandering(PLAYER_START, positions, isProfileOpen || !!activeStationId, onWanderUpdate);

  const stationCtx = useMemo(() => ({
    activeStationId, openStation, closeStation, positions, moveStation, storeStation,
    dragState, setDragState, toolboxOpen, setToolboxOpen,
  }), [activeStationId, openStation, closeStation, positions, moveStation, storeStation, dragState, toolboxOpen]);

  const playerCtx = useMemo(() => ({
    position: playerPos, setPosition: setPlayerPos,
    facing, setFacing,
    isWalking, setIsWalking,
    profile, setProfile,
    isProfileOpen, openProfile, closeProfile,
  }), [playerPos, facing, isWalking, profile, setProfile, isProfileOpen, openProfile, closeProfile]);

  return (
    <StationContext.Provider value={stationCtx}>
      <PlayerContext.Provider value={playerCtx}>
        <div className="w-screen min-h-screen overflow-auto">
          <IsometricRoom />
          <StationOverlay />
          <PlayerProfilePopup />
          <Toolbox />
          <ToolboxDropStrip />
          <DragOverlay />
        </div>
      </PlayerContext.Provider>
    </StationContext.Provider>
  );
}
