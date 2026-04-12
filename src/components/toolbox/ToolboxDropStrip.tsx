'use client';

import { useStation } from '@/hooks/useStation';

export default function ToolboxDropStrip() {
  const { dragState } = useStation();

  // Only show during grid-source drags
  if (!dragState || dragState.source !== 'grid') return null;

  return (
    <div
      data-toolbox-strip
      className="fixed right-0 top-0 bottom-0 w-20 z-[99] flex items-center justify-center pointer-events-none transition-all duration-300"
      style={{
        background: dragState.overToolbox
          ? 'linear-gradient(270deg, rgba(195, 177, 216, 0.4) 0%, rgba(195, 177, 216, 0) 100%)'
          : 'linear-gradient(270deg, rgba(195, 177, 216, 0.15) 0%, rgba(195, 177, 216, 0) 100%)',
        borderLeft: dragState.overToolbox
          ? '2px dashed var(--color-lavender)'
          : '2px dashed var(--color-outline-soft)',
      }}
    >
      <div
        className="flex flex-col items-center gap-1 transition-all duration-200"
        style={{
          opacity: dragState.overToolbox ? 1 : 0.5,
          transform: dragState.overToolbox ? 'scale(1.1)' : 'scale(1)',
        }}
      >
        {/* Arrow icon */}
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path d="M8 4 L14 10 L8 16" stroke="var(--color-lavender)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <span className="text-[10px] font-bold text-[var(--color-text-muted)] whitespace-nowrap -rotate-90 mt-2">
          Store
        </span>
      </div>
    </div>
  );
}
