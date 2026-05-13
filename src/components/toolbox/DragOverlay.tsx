'use client';

import { useStation } from '@/hooks/useStation';
import { stations } from '@/components/stations/StationRegistry';

export default function DragOverlay() {
  const { dragState } = useStation();

  if (!dragState) return null;

  const station = stations.find(s => s.id === dragState.stationId);
  if (!station) return null;

  return (
    <div
      className="fixed pointer-events-none z-[500]"
      style={{
        left: dragState.clientX,
        top: dragState.clientY,
        transform: dragState.overToolbox
          ? 'translate(-50%, -50%) scale(0.9)'
          : 'translate(-50%, -50%)',
        opacity: 0.95,
        transition: 'transform 0.15s ease',
      }}
    >
      <div
        style={{
          background: station.accentColor,
          border: '2px solid #2a2420',
          borderRadius: 999,
          padding: '8px 16px',
          fontSize: 13,
          fontWeight: 700,
          color: '#2a2420',
          whiteSpace: 'nowrap',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.18)',
          userSelect: 'none',
        }}
      >
        {station.name}
      </div>
    </div>
  );
}
