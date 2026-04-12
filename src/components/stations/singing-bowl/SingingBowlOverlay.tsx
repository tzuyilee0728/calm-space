'use client';

import { useEffect } from 'react';
import { motion } from 'motion/react';
import Bowl from './Bowl';
import { useAudioEngine } from '@/hooks/useAudioEngine';
import { audioEngine } from '@/lib/audio/AudioEngine';

const bowls = [
  { fundamental: 174, color: 'var(--color-pink)', colorLight: 'var(--color-pink-light)', size: 5, label: 'Deep' },
  { fundamental: 220, color: 'var(--color-lavender)', colorLight: 'var(--color-lavender-light)', size: 4, label: 'Warm' },
  { fundamental: 293, color: 'var(--color-mint)', colorLight: 'var(--color-mint-light)', size: 3, label: 'Clear' },
  { fundamental: 392, color: 'var(--color-blue)', colorLight: 'var(--color-blue-light)', size: 2, label: 'Bright' },
  { fundamental: 523, color: 'var(--color-yellow)', colorLight: 'var(--color-yellow-light)', size: 1, label: 'Crystal' },
];

export default function SingingBowlOverlay() {
  const { initialize } = useAudioEngine();

  useEffect(() => {
    initialize();
  }, [initialize]);

  const strikeAll = () => {
    bowls.forEach((bowl, i) => {
      setTimeout(() => {
        audioEngine.playBowlTone({
          fundamental: bowl.fundamental,
          gain: 0.2,
        });
      }, i * 200);
    });
  };

  return (
    <div className="flex flex-col items-center gap-8 p-8 max-w-2xl mx-auto">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-[var(--color-text)] mb-1">Singing Bowls</h2>
        <p className="text-sm text-[var(--color-text-muted)]">Tap the bowls to hear them sing</p>
      </div>

      {/* Bowls in arc arrangement */}
      <div className="relative flex items-end justify-center gap-4 md:gap-6 py-8">
        {bowls.map((bowl, i) => {
          // Arc position - center bowls higher
          const centerOffset = Math.abs(i - 2);
          const yOffset = centerOffset * 15;

          return (
            <motion.div
              key={bowl.label}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: yOffset }}
              transition={{ delay: i * 0.1, type: 'spring', damping: 15 }}
            >
              <Bowl {...bowl} />
            </motion.div>
          );
        })}
      </div>

      {/* Strike all button */}
      <motion.button
        onClick={strikeAll}
        className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-[var(--color-lavender)] text-[var(--color-text)] font-semibold border-2 border-[var(--color-outline)] shadow-[var(--shadow-soft)] cursor-pointer"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
          <circle cx="9" cy="9" r="7" stroke="currentColor" strokeWidth="2" />
          <circle cx="9" cy="9" r="3" fill="currentColor" />
        </svg>
        Strike All
      </motion.button>

      <p className="text-xs text-[var(--color-text-muted)] text-center max-w-xs">
        Multiple bowls can ring at the same time. Try creating your own harmony.
      </p>
    </div>
  );
}
