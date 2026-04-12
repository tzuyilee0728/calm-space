'use client';

import { useState, useCallback } from 'react';
import { motion } from 'motion/react';
import { audioEngine } from '@/lib/audio/AudioEngine';

interface BowlProps {
  fundamental: number;
  color: string;
  colorLight: string;
  size: number; // 1-5, larger = bigger bowl
  label: string;
}

export default function Bowl({ fundamental, color, colorLight, size, label }: BowlProps) {
  const [isRinging, setIsRinging] = useState(false);
  const [ripples, setRipples] = useState<number[]>([]);

  const strike = useCallback(() => {
    // Play tone
    audioEngine.playBowlTone({
      fundamental,
      partials: [fundamental * 3, fundamental * 5],
      partialGains: [0.4, 0.15],
      decayConstants: [3.0, 1.5, 0.8],
      gain: 0.3,
    });

    // Visual feedback
    setIsRinging(true);
    const rippleId = Date.now();
    setRipples(prev => [...prev, rippleId]);

    setTimeout(() => setIsRinging(false), 600);
    setTimeout(() => {
      setRipples(prev => prev.filter(id => id !== rippleId));
    }, 2000);
  }, [fundamental]);

  const bowlWidth = 60 + size * 25;
  const bowlHeight = 30 + size * 10;

  return (
    <button
      onClick={strike}
      className="relative flex flex-col items-center gap-2 cursor-pointer group"
      aria-label={`${label} singing bowl`}
    >
      <svg
        width={bowlWidth}
        height={bowlHeight + 30}
        viewBox={`0 0 ${bowlWidth} ${bowlHeight + 30}`}
        fill="none"
        className="overflow-visible"
      >
        {/* Ripple circles */}
        {ripples.map(id => (
          <g key={id}>
            {[0, 1, 2].map(i => (
              <circle
                key={i}
                cx={bowlWidth / 2}
                cy={bowlHeight / 2}
                r="10"
                fill="none"
                stroke={color}
                strokeWidth="1.5"
                opacity="0.5"
                style={{
                  animation: `ripple 2s ease-out ${i * 0.3}s forwards`,
                }}
              />
            ))}
          </g>
        ))}

        {/* Bowl body */}
        <motion.g
          animate={
            isRinging
              ? {
                  x: [0, -2, 2, -1.5, 1.5, -0.5, 0.5, 0],
                }
              : { x: 0 }
          }
          transition={isRinging ? { duration: 0.4, ease: 'easeOut' } : undefined}
        >
          {/* Top ellipse (opening) */}
          <ellipse
            cx={bowlWidth / 2}
            cy={12}
            rx={bowlWidth / 2 - 4}
            ry={10}
            fill={color}
            stroke="var(--color-outline)"
            strokeWidth="2.5"
          />

          {/* Bowl sides */}
          <path
            d={`M4 12 Q4 ${bowlHeight + 10} ${bowlWidth / 2} ${bowlHeight + 10} Q${bowlWidth - 4} ${bowlHeight + 10} ${bowlWidth - 4} 12`}
            fill={color}
            stroke="var(--color-outline)"
            strokeWidth="2.5"
          />

          {/* Inner highlight */}
          <ellipse
            cx={bowlWidth / 2}
            cy={12}
            rx={bowlWidth / 2 - 12}
            ry={7}
            fill={colorLight}
            opacity="0.5"
          />

          {/* Shine */}
          <ellipse
            cx={bowlWidth / 2 - bowlWidth * 0.15}
            cy={bowlHeight * 0.4}
            rx={4}
            ry={8}
            fill="white"
            opacity="0.3"
            transform={`rotate(-15 ${bowlWidth / 2 - bowlWidth * 0.15} ${bowlHeight * 0.4})`}
          />
        </motion.g>
      </svg>

      {/* Label */}
      <span className="text-xs font-semibold text-[var(--color-text-muted)] group-hover:text-[var(--color-text)] transition-colors">
        {label}
      </span>
    </button>
  );
}
