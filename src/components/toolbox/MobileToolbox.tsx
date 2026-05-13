'use client';

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useStation } from '@/hooks/useStation';
import { usePlayer } from '@/hooks/usePlayer';
import { stations } from '@/components/stations/StationRegistry';
import PlayerCharacter from '@/components/player/PlayerCharacter';
import ToolboxItem from './ToolboxItem';

// Bottom-sheet variant of the toolbox for phones / coarse-pointer devices.
// Two states (driven by `toolboxOpen` from context, same flag desktop uses):
//   - open:   handle + horizontal-scroll row of items visible (~140px tall).
//   - closed: only the handle peeks (~36px tall) so the canvas reclaims space.
// Carries `data-toolbox-dropzone` so useDragStation finds it for drag-to-store.
// When a grid-source drag starts, auto-expands so the drop zone is reachable.
const CONTENT_HEIGHT = 104; // height of header + scroll row, animated away when closed

export default function MobileToolbox() {
  const { positions, dragState, toolboxOpen, setToolboxOpen } = useStation();
  const { profile } = usePlayer();

  const storedStations = stations.filter(s => positions[s.id] === null);

  // If the user picks up a placed station while the sheet is collapsed, open
  // it so they can see the drop target. They keep the expanded state after
  // the drop — discoverable on first use.
  useEffect(() => {
    if (dragState?.source === 'grid' && !toolboxOpen) {
      setToolboxOpen(true);
    }
  }, [dragState?.source, toolboxOpen, setToolboxOpen]);

  return (
    <motion.div
      data-toolbox-dropzone
      className="fixed left-0 right-0 bottom-0 z-[100] bg-[var(--color-warm-white)] border-t-2 border-[var(--color-outline-soft)] shadow-[var(--shadow-float)]"
      initial={false}
      animate={{ y: toolboxOpen ? 0 : CONTENT_HEIGHT }}
      transition={{ type: 'spring', damping: 28, stiffness: 280 }}
      style={{
        paddingBottom: 'env(safe-area-inset-bottom)',
        paddingLeft: 'env(safe-area-inset-left)',
        paddingRight: 'env(safe-area-inset-right)',
      }}
    >
      {/* Handle — tap target to toggle. Always visible (acts as the "peek"
          when the sheet is closed). */}
      <button
        type="button"
        onClick={() => setToolboxOpen(!toolboxOpen)}
        className="w-full flex items-center justify-between gap-3 px-4"
        style={{ height: 36, touchAction: 'manipulation' }}
        aria-label={toolboxOpen ? 'Collapse toolbox' : 'Expand toolbox'}
        aria-expanded={toolboxOpen}
      >
        <span className="text-[10px] font-bold text-[var(--color-text-muted)]">
          {toolboxOpen ? 'Drag onto the scene' : 'Tap to open toolbox'}
        </span>
        <div className="flex items-center gap-2">
          <span
            className="text-[10px] font-bold text-[var(--color-text-muted)] bg-[var(--color-cream)] px-2 py-0.5 border border-[var(--color-outline-soft)]"
            style={{ borderRadius: 'var(--radius-full)' }}
          >
            {storedStations.length} / {stations.length}
          </span>
          <motion.svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            animate={{ rotate: toolboxOpen ? 0 : 180 }}
            transition={{ type: 'spring', damping: 22, stiffness: 280 }}
          >
            <path d="M4 10 L8 6 L12 10" stroke="var(--color-outline)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </motion.svg>
        </div>
      </button>

      {/* Content — animated away by the parent's translateY when collapsed. */}
      <div
        className="flex gap-2 overflow-x-auto overflow-y-hidden px-3 pb-3"
        style={{
          height: CONTENT_HEIGHT,
          scrollbarWidth: 'none',
          WebkitOverflowScrolling: 'touch',
          msOverflowStyle: 'none',
        }}
      >
        {/* Player tile — PlayerCharacter is itself a button that opens the
            profile, so the surrounding tile is just a styled <div>. */}
        <div
          className="relative bg-[var(--color-cream)] border-2 border-[var(--color-outline-soft)] flex-shrink-0"
          style={{
            borderRadius: 'var(--radius-lg)',
            padding: '6px 10px',
            width: 72,
            height: 76,
            touchAction: 'manipulation',
          }}
        >
          <div className="flex justify-center items-center" style={{ height: 40 }}>
            <div style={{ transform: 'scale(0.55)', transformOrigin: 'center' }}>
              <PlayerCharacter />
            </div>
          </div>
          <p className="text-[10px] font-bold text-[var(--color-text)] text-center mt-0.5 truncate">
            {profile.name || 'Me'}
          </p>
        </div>

        {storedStations.length === 0 ? (
          <div
            className="flex items-center text-[10px] font-bold text-[var(--color-text-muted)] opacity-70 px-3"
            style={{ minHeight: 76 }}
          >
            All stations placed
          </div>
        ) : (
          <AnimatePresence mode="popLayout" initial={false}>
            {storedStations.map(station => (
              <motion.div
                key={station.id}
                layout
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ type: 'spring', damping: 22, stiffness: 320 }}
                style={{ width: 72, flexShrink: 0 }}
              >
                <ToolboxItem station={station} />
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </motion.div>
  );
}
