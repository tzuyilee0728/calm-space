'use client';

import { motion, AnimatePresence } from 'motion/react';
import { useStation } from '@/hooks/useStation';
import { stations } from '@/components/stations/StationRegistry';
import ToolboxToggle from './ToolboxToggle';
import ToolboxItem from './ToolboxItem';

export default function Toolbox() {
  const { toolboxOpen, positions } = useStation();

  const storedStations = stations.filter(s => positions[s.id] === null);

  return (
    <>
      <ToolboxToggle />

      {/* Drawer */}
      <motion.div
        data-toolbox-dropzone
        className="fixed right-0 top-0 bottom-0 z-[100] bg-[var(--color-warm-white)] border-l-2 border-[var(--color-outline-soft)] shadow-[var(--shadow-float)] overflow-hidden"
        initial={false}
        animate={{
          x: toolboxOpen ? 0 : 280,
        }}
        transition={{
          type: 'spring',
          damping: 28,
          stiffness: 300,
        }}
        style={{ width: 280 }}
      >
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="px-5 pt-5 pb-3 border-b border-[var(--color-outline-soft)]">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-extrabold text-[var(--color-text)]">Toolbox</h2>
              <span
                className="text-[11px] font-bold text-[var(--color-text-muted)] bg-[var(--color-cream)] px-2 py-0.5 border border-[var(--color-outline-soft)]"
                style={{ borderRadius: 'var(--radius-full)' }}
              >
                {storedStations.length} / {stations.length}
              </span>
            </div>
            <p className="text-[11px] text-[var(--color-text-muted)] mt-1">
              Drag items onto the grass to place them
            </p>
          </div>

          {/* Items */}
          <div className="flex-1 overflow-auto px-4 py-3">
            {storedStations.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center px-4 opacity-60">
                <svg width="40" height="40" viewBox="0 0 40 40" fill="none" className="mb-3 opacity-50">
                  <rect x="6" y="14" width="28" height="18" rx="5" fill="var(--color-cream)" stroke="var(--color-outline-soft)" strokeWidth="1.5" />
                  <path d="M12 14 Q12 8 20 8 Q28 8 28 14" fill="none" stroke="var(--color-outline-soft)" strokeWidth="1.5" />
                  <circle cx="20" cy="22" r="3" fill="var(--color-outline-soft)" opacity="0.4" />
                </svg>
                <p className="text-xs font-bold text-[var(--color-text-muted)]">
                  No items stored
                </p>
                <p className="text-[10px] text-[var(--color-text-muted)] mt-1">
                  Drag stations from the grass here to store them
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                <AnimatePresence mode="popLayout">
                  {storedStations.map(station => (
                    <motion.div
                      key={station.id}
                      layout
                      initial={{ opacity: 0, scale: 0.8, y: -10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.8, y: -10 }}
                      transition={{ type: 'spring', damping: 20, stiffness: 300 }}
                    >
                      <ToolboxItem station={station} />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </>
  );
}
