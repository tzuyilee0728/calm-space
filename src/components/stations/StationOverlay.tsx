'use client';

import { motion, AnimatePresence } from 'motion/react';
import { Suspense } from 'react';
import { useStation } from '@/hooks/useStation';
import { stations } from './StationRegistry';
import BackButton from '@/components/ui/BackButton';

export default function StationOverlay() {
  const { activeStationId, closeStation } = useStation();
  const activeStation = stations.find(s => s.id === activeStationId);

  return (
    <AnimatePresence>
      {activeStation && (
        <motion.div
          key={activeStation.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-[1000] flex items-center justify-center"
        >
          {/* Fully opaque backdrop — hides room completely */}
          <div
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(180deg, #ede6f0 0%, var(--color-cream) 40%, var(--color-warm-white) 100%)',
            }}
          />

          {/* Scrollable content area */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 16 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 16 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative z-10 w-full h-full overflow-auto"
          >
            <BackButton onClick={closeStation} />
            <Suspense
              fallback={
                <div className="flex items-center justify-center h-full">
                  <div className="w-12 h-12 rounded-full border-4 border-[var(--color-pink-light)] border-t-[var(--color-pink)] animate-spin" />
                </div>
              }
            >
              <div className="flex items-center justify-center min-h-full py-16">
                <activeStation.Overlay />
              </div>
            </Suspense>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
