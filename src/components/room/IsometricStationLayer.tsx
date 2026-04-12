'use client';

import { stations } from '@/components/stations/StationRegistry';
import StationSlot from './StationSlot';
import { useStation } from '@/hooks/useStation';
import { usePlayer } from '@/hooks/usePlayer';
import PlayerCharacter from '@/components/player/PlayerCharacter';
import {
  SCENE_WIDTH,
  SCENE_HEIGHT,
  gridToScreen,
  getFootprintCenter,
  getDepthIndex,
} from '@/lib/isometric/constants';

type Renderable =
  | { type: 'station'; id: string; depth: number }
  | { type: 'player'; depth: number };

export default function IsometricStationLayer() {
  const { positions, dragState } = useStation();
  const { position: playerPos } = usePlayer();

  // Build a unified depth-sorted list of placed stations + player
  const items: Renderable[] = [];
  for (const s of stations) {
    const pos = positions[s.id];
    if (pos == null) continue; // stored in toolbox — skip
    items.push({ type: 'station', id: s.id, depth: getDepthIndex(pos.col, pos.row, s.gridSize.w, s.gridSize.h) });
  }

  // Player depth: 1x1 footprint
  const playerDepth = Math.floor(playerPos.col) + Math.floor(playerPos.row);
  items.push({ type: 'player', depth: playerDepth });

  items.sort((a, b) => a.depth - b.depth);

  const playerScreen = gridToScreen(playerPos.col, playerPos.row);

  return (
    <div
      className="absolute inset-0 pointer-events-none"
      style={{ width: SCENE_WIDTH, height: SCENE_HEIGHT }}
    >
      {items.map(item => {
        if (item.type === 'player') {
          return (
            <div
              key="player"
              className="absolute pointer-events-auto"
              style={{
                left: playerScreen.x,
                top: playerScreen.y,
                zIndex: item.depth * 10,
                transform: 'translate(-50%, -90%)',
              }}
            >
              <PlayerCharacter />
            </div>
          );
        }

        const station = stations.find(s => s.id === item.id)!;
        const pos = positions[station.id]!;
        const center = getFootprintCenter(pos.col, pos.row, station.gridSize.w, station.gridSize.h);
        const isDragging = dragState?.stationId === station.id;

        return (
          <div
            key={station.id}
            className="absolute pointer-events-auto"
            style={{
              left: center.x,
              top: center.y,
              zIndex: isDragging ? -1 : item.depth * 10,
              transform: 'translate(-50%, -75%)',
              transition: isDragging ? 'none' : 'left 0.3s ease, top 0.3s ease',
              opacity: isDragging ? 0 : 1,
              pointerEvents: isDragging ? 'auto' : undefined,
            }}
          >
            <StationSlot station={station} />
          </div>
        );
      })}
    </div>
  );
}
