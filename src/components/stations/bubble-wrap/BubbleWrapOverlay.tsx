'use client';

import { useState, useCallback, useEffect } from 'react';
import { motion } from 'motion/react';
import Bubble from './Bubble';
import { useAudioEngine } from '@/hooks/useAudioEngine';
import { audioEngine } from '@/lib/audio/AudioEngine';

const COLS = 10;
const ROWS = 8;
const TOTAL = COLS * ROWS;

function generateResistances(): number[] {
  return Array.from({ length: TOTAL }, () => Math.random());
}

export default function BubbleWrapOverlay() {
  const { initialize } = useAudioEngine();
  const [poppedSet, setPoppedSet] = useState<Set<number>>(new Set());
  const [resistances, setResistances] = useState<number[]>(generateResistances);
  const [resetKey, setResetKey] = useState(0);

  useEffect(() => {
    initialize();
  }, [initialize]);

  const handlePop = useCallback((index: number) => {
    setPoppedSet(prev => {
      const next = new Set(prev);
      next.add(index);
      return next;
    });
  }, []);

  const handleReset = useCallback(() => {
    audioEngine.playCrinkle();
    setPoppedSet(new Set());
    setResistances(generateResistances());
    setResetKey(k => k + 1);
  }, []);

  const poppedCount = poppedSet.size;
  const allPopped = poppedCount === TOTAL;

  return (
    <div className="flex flex-col items-center gap-6 p-8 max-w-xl mx-auto">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-[var(--color-text)] mb-1">Bubble Wrap</h2>
        <p className="text-sm text-[var(--color-text-muted)]">Pop away your stress</p>
      </div>

      {/* Counter */}
      <div className="flex items-center gap-3 px-4 py-2 rounded-full bg-[var(--color-warm-white)] border-2 border-[var(--color-mint)] shadow-[var(--shadow-soft)]">
        <span className="text-sm font-semibold text-[var(--color-text)]">
          {poppedCount} / {TOTAL}
        </span>
        <div className="w-24 h-2 bg-[var(--color-mint-light)] rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-[var(--color-mint)] rounded-full"
            animate={{ width: `${(poppedCount / TOTAL) * 100}%` }}
            transition={{ type: 'spring', damping: 20 }}
          />
        </div>
      </div>

      {/* Bubble Grid */}
      <div
        key={resetKey}
        className="grid gap-1 p-4 rounded-2xl bg-[var(--color-warm-white)]/80 border-2 border-[var(--color-outline-soft)] shadow-[var(--shadow-float)]"
        style={{
          gridTemplateColumns: `repeat(${COLS}, minmax(0, 1fr))`,
          maxWidth: '420px',
          width: '100%',
        }}
      >
        {Array.from({ length: TOTAL }, (_, i) => (
          <Bubble
            key={`${resetKey}-${i}`}
            index={i}
            resistance={resistances[i]}
            onPop={() => handlePop(i)}
          />
        ))}
      </div>

      {/* Reset button */}
      <motion.button
        onClick={handleReset}
        className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-[var(--color-mint)] text-[var(--color-text)] font-semibold border-2 border-[var(--color-outline)] shadow-[var(--shadow-soft)] cursor-pointer"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
          <path
            d="M3 9a6 6 0 1011.5-2.4M14.5 2v4.6H10"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        {allPopped ? 'New Sheet!' : 'Fresh Wrap'}
      </motion.button>
    </div>
  );
}
