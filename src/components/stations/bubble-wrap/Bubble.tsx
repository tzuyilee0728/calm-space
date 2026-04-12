'use client';

import { useState, useCallback, useRef } from 'react';
import { motion } from 'motion/react';
import { audioEngine } from '@/lib/audio/AudioEngine';

type BubbleState = 'unpopped' | 'popping' | 'popped';

export default function Bubble({
  index,
  resistance,
  onPop,
}: {
  index: number;
  resistance: number; // 0-1, higher = harder to pop
  onPop: () => void;
}) {
  const [state, setState] = useState<BubbleState>('unpopped');
  const holdTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const requiredHoldMs = 50 + resistance * 400;

  const startPop = useCallback(() => {
    if (state !== 'unpopped') return;

    holdTimerRef.current = setTimeout(() => {
      setState('popping');

      // Randomized pop sound
      const filterFreq = 1500 + Math.random() * 2000;
      audioEngine.playNoiseBurst({
        duration: 0.05,
        filterFreq,
        filterQ: 0.8 + Math.random() * 1.5,
        gain: 0.3 + Math.random() * 0.3,
        decay: 0.01 + Math.random() * 0.02,
      });
      audioEngine.playClick(2000 + Math.random() * 2000, 0.15);

      setTimeout(() => {
        setState('popped');
        onPop();
      }, 150);
    }, requiredHoldMs);
  }, [state, requiredHoldMs, onPop]);

  const cancelPop = useCallback(() => {
    if (holdTimerRef.current) {
      clearTimeout(holdTimerRef.current);
      holdTimerRef.current = null;
    }
  }, []);

  const handleClick = useCallback(() => {
    if (state !== 'unpopped') return;
    setState('popping');

    const filterFreq = 1500 + Math.random() * 2000;
    audioEngine.playNoiseBurst({
      duration: 0.05,
      filterFreq,
      filterQ: 0.8 + Math.random() * 1.5,
      gain: 0.3 + Math.random() * 0.3,
      decay: 0.01 + Math.random() * 0.02,
    });
    audioEngine.playClick(2000 + Math.random() * 2000, 0.15);

    setTimeout(() => {
      setState('popped');
      onPop();
    }, 150);
  }, [state, onPop]);

  // Deterministic particle directions based on index
  const particleDirections = [
    { x: -12, y: -10 },
    { x: 14, y: -8 },
    { x: 2, y: 13 },
  ];

  if (state === 'popped') {
    return (
      <div className="w-full aspect-square flex items-center justify-center">
        <div
          className="w-[70%] h-[70%] rounded-full bg-[var(--color-mint)]/30 border border-[var(--color-outline-soft)]/30"
        />
      </div>
    );
  }

  return (
    <motion.button
      className="w-full aspect-square flex items-center justify-center cursor-pointer relative"
      onMouseDown={startPop}
      onMouseUp={cancelPop}
      onMouseLeave={cancelPop}
      onTouchStart={startPop}
      onTouchEnd={cancelPop}
      onClick={handleClick}
      whileHover={{ scale: state === 'unpopped' ? 1.1 : 1 }}
      whileTap={{ scale: state === 'unpopped' ? 0.85 : 1 }}
      aria-label={`Bubble ${index + 1}, ${state === 'unpopped' ? 'tap to pop' : 'popped'}`}
    >
      <motion.div
        className="w-[85%] h-[85%] rounded-full relative"
        animate={
          state === 'popping'
            ? { scale: [1, 0.3], opacity: [1, 0] }
            : { scale: 1, opacity: 1 }
        }
        transition={state === 'popping' ? { duration: 0.15 } : undefined}
        style={{
          background: 'radial-gradient(circle at 35% 35%, rgba(255,255,255,0.6), var(--color-mint-light) 40%, var(--color-mint) 100%)',
          border: '2px solid var(--color-outline-soft)',
          boxShadow: 'inset 0 -2px 4px rgba(122, 110, 110, 0.1), 0 1px 3px rgba(122, 110, 110, 0.08)',
        }}
      >
        {/* Highlight shine */}
        <div
          className="absolute w-[30%] h-[30%] rounded-full top-[20%] left-[22%]"
          style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.8), transparent)' }}
        />
      </motion.div>

      {/* Pop particles */}
      {state === 'popping' && (
        <>
          {particleDirections.map((dir, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 rounded-full bg-[var(--color-mint)]"
              initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
              animate={{
                x: dir.x,
                y: dir.y,
                opacity: 0,
                scale: 0,
              }}
              transition={{ duration: 0.3 }}
            />
          ))}
        </>
      )}
    </motion.button>
  );
}

export function ResetBubble({
  delay,
}: {
  delay: number;
}) {
  return (
    <motion.div
      className="w-full aspect-square flex items-center justify-center"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{
        type: 'spring',
        damping: 12,
        stiffness: 200,
        delay,
      }}
    >
      <div
        className="w-[85%] h-[85%] rounded-full relative"
        style={{
          background: 'radial-gradient(circle at 35% 35%, rgba(255,255,255,0.6), var(--color-mint-light) 40%, var(--color-mint) 100%)',
          border: '2px solid var(--color-outline-soft)',
          boxShadow: 'inset 0 -2px 4px rgba(122, 110, 110, 0.1), 0 1px 3px rgba(122, 110, 110, 0.08)',
        }}
      >
        <div
          className="absolute w-[30%] h-[30%] rounded-full top-[20%] left-[22%]"
          style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.8), transparent)' }}
        />
      </div>
    </motion.div>
  );
}
