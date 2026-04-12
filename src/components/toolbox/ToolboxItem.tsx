'use client';

import { useDragStation } from '@/hooks/useDragStation';
import { useStation } from '@/hooks/useStation';
import type { StationDefinition } from '@/lib/stations/types';

export default function ToolboxItem({ station }: { station: StationDefinition }) {
  const { dragState } = useStation();
  const isDragging = dragState?.stationId === station.id;
  const RoomObject = station.RoomObject;

  const { onPointerDown, onPointerMove, onPointerUp, onPointerCancel } = useDragStation(station.id, 'toolbox');

  return (
    <div
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerCancel}
      className="relative bg-[var(--color-cream)] border-2 border-[var(--color-outline-soft)] hover:border-[var(--color-pink)] transition-all duration-200 cursor-grab active:cursor-grabbing group"
      style={{
        borderRadius: 'var(--radius-lg)',
        padding: '12px',
        opacity: isDragging ? 0.4 : 1,
        touchAction: 'none',
      }}
    >
      {/* Station preview */}
      <div className="flex justify-center overflow-hidden" style={{ height: 70 }}>
        <div style={{ transform: 'scale(0.55)', transformOrigin: 'top center' }}>
          <RoomObject isActive={false} onActivate={() => {}} />
        </div>
      </div>

      {/* Station name */}
      <p className="text-xs font-bold text-[var(--color-text)] text-center mt-1.5 truncate">
        {station.name}
      </p>

      {/* Accent color dot */}
      <div
        className="absolute top-2 right-2 w-2.5 h-2.5 rounded-full border border-[var(--color-outline-soft)]"
        style={{ backgroundColor: station.accentColor }}
      />
    </div>
  );
}
