'use client';

import { useStation } from '@/hooks/useStation';
import { stations } from '@/components/stations/StationRegistry';

export default function ToolboxToggle() {
  const { toolboxOpen, setToolboxOpen, positions } = useStation();

  const storedCount = stations.filter(s => positions[s.id] === null).length;

  return (
    <button
      onClick={() => setToolboxOpen(!toolboxOpen)}
      className="fixed z-[101] flex items-center justify-center cursor-pointer"
      style={{
        right: toolboxOpen ? 280 : 0,
        top: '50%',
        transform: 'translateY(-50%)',
        transition: 'right 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
      }}
      aria-label={toolboxOpen ? 'Close toolbox' : 'Open toolbox'}
    >
      <div
        className="relative bg-[var(--color-warm-white)] border-2 border-r-0 border-[var(--color-outline-soft)] shadow-[var(--shadow-float)] px-2 py-4 hover:bg-[var(--color-pink-light)] transition-colors"
        style={{
          borderRadius: 'var(--radius-lg) 0 0 var(--radius-lg)',
        }}
      >
        {/* Cute chest/backpack icon */}
        <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
          {/* Bag body */}
          <rect x="4" y="10" width="20" height="14" rx="4" fill="var(--color-peach)" stroke="var(--color-outline)" strokeWidth="1.5" />
          {/* Bag flap */}
          <path d="M6 14 Q6 8 14 8 Q22 8 22 14" fill="var(--color-peach-light)" stroke="var(--color-outline)" strokeWidth="1.5" />
          {/* Clasp */}
          <circle cx="14" cy="14" r="2.5" fill="var(--color-yellow)" stroke="var(--color-outline)" strokeWidth="1" />
          {/* Handle */}
          <path d="M10 8 Q10 4 14 4 Q18 4 18 8" fill="none" stroke="var(--color-outline)" strokeWidth="1.5" strokeLinecap="round" />
        </svg>

        {/* Count badge */}
        {storedCount > 0 && (
          <div
            className="absolute -top-1.5 -left-1.5 min-w-[18px] h-[18px] flex items-center justify-center text-[10px] font-extrabold text-white bg-[var(--color-pink)] border border-[var(--color-outline-soft)] animate-gentle-pulse"
            style={{ borderRadius: 'var(--radius-full)', padding: '0 4px' }}
          >
            {storedCount}
          </div>
        )}
      </div>
    </button>
  );
}
