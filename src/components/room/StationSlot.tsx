'use client';

import { useStation } from '@/hooks/useStation';
import { useDragStation } from '@/hooks/useDragStation';
import type { StationDefinition } from '@/lib/stations/types';

export default function StationSlot({ station }: { station: StationDefinition }) {
  const { activeStationId, dragState } = useStation();
  const isActive = activeStationId === station.id;
  const isDragging = dragState?.stationId === station.id;
  const RoomObject = station.RoomObject;

  const { onPointerDown, onPointerMove, onPointerUp, onPointerCancel } = useDragStation(station.id, 'grid');

  return (
    <div
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerCancel}
      style={{
        cursor: isDragging ? 'grabbing' : 'grab',
        touchAction: 'none',
      }}
    >
      <RoomObject isActive={isActive} onActivate={() => {}} />
    </div>
  );
}
