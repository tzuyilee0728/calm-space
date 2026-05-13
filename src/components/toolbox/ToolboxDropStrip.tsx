'use client';

import { useStation } from '@/hooks/useStation';
import { useIsMobile } from '@/hooks/useIsMobile';

export default function ToolboxDropStrip() {
  const isMobile = useIsMobile();
  const { dragState, toolboxOpen } = useStation();

  // Only show during grid-source drags
  if (!dragState || dragState.source !== 'grid') return null;

  if (isMobile) {
    // Horizontal strip just above the bottom toolbox sheet — sits higher when
    // the sheet is expanded so it doesn't overlap the items row.
    return (
      <div
        data-toolbox-strip
        className="fixed left-0 right-0 z-[99] flex items-center justify-center pointer-events-none transition-all duration-300"
        style={{
          bottom: toolboxOpen
            ? 'calc(140px + env(safe-area-inset-bottom))'
            : 'calc(36px + env(safe-area-inset-bottom))',
          height: 56,
          background: dragState.overToolbox
            ? 'linear-gradient(0deg, rgba(195, 177, 216, 0.4) 0%, rgba(195, 177, 216, 0) 100%)'
            : 'linear-gradient(0deg, rgba(195, 177, 216, 0.15) 0%, rgba(195, 177, 216, 0) 100%)',
          borderBottom: dragState.overToolbox
            ? '2px dashed var(--color-lavender)'
            : '2px dashed var(--color-outline-soft)',
        }}
      >
        <div
          className="flex items-center gap-2 transition-all duration-200"
          style={{
            opacity: dragState.overToolbox ? 1 : 0.5,
            transform: dragState.overToolbox ? 'scale(1.05)' : 'scale(1)',
          }}
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M4 8 L10 14 L16 8" stroke="var(--color-lavender)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="text-[11px] font-bold text-[var(--color-text-muted)] whitespace-nowrap">
            Drop to store
          </span>
        </div>
      </div>
    );
  }

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
