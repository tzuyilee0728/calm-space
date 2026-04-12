'use client';

import { useStation } from '@/hooks/useStation';
import { stations } from '@/components/stations/StationRegistry';

export default function DragOverlay() {
  const { dragState } = useStation();

  if (!dragState) return null;

  const station = stations.find(s => s.id === dragState.stationId);
  if (!station) return null;

  const RoomObject = station.RoomObject;

  return (
    <div
      className="fixed pointer-events-none z-[500]"
      style={{
        left: dragState.clientX,
        top: dragState.clientY,
        transform: dragState.overToolbox
          ? 'translate(-50%, -50%) scale(0.6)'
          : 'translate(-50%, -75%)',
        opacity: 0.85,
        filter: 'drop-shadow(0 8px 24px rgba(122, 110, 110, 0.25))',
        transition: 'transform 0.2s ease',
      }}
    >
      <RoomObject isActive={false} onActivate={() => {}} />
    </div>
  );
}
