'use client';

import { useState } from 'react';
import { AnimatePresence } from 'motion/react';
import FloatingLabel from '@/components/ui/FloatingLabel';

export default function SingingBowlObject({
  isActive,
  onActivate,
}: {
  isActive: boolean;
  onActivate: () => void;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <button
      onClick={onActivate}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="relative group cursor-pointer"
      aria-label="Open Singing Bowl station"
    >
      <AnimatePresence>
        {hovered && !isActive && (
          <FloatingLabel text="Singing Bowls" color="var(--color-lavender-light)" />
        )}
      </AnimatePresence>

      <svg
        width="120"
        height="100"
        viewBox="0 0 120 100"
        fill="none"
        className="transition-all duration-300"
        style={{
          filter: hovered
            ? 'drop-shadow(0 0 12px rgba(195, 177, 216, 0.6))'
            : 'drop-shadow(0 2px 4px rgba(122, 110, 110, 0.1))',
        }}
      >
        {/* Cushion/mat */}
        <ellipse cx="60" cy="80" rx="45" ry="12" fill="var(--color-pink-light)" stroke="var(--color-outline)" strokeWidth="2" />

        {/* Large bowl (back) */}
        <ellipse cx="60" cy="60" rx="35" ry="10" fill="var(--color-lavender)" stroke="var(--color-outline)" strokeWidth="2.5" />
        <path d="M25 60 Q25 80 60 80 Q95 80 95 60" fill="var(--color-lavender)" stroke="var(--color-outline)" strokeWidth="2.5" />
        <ellipse cx="60" cy="60" rx="28" ry="7" fill="var(--color-lavender-light)" opacity="0.5" />

        {/* Small bowl (front) */}
        <ellipse cx="42" cy="52" rx="18" ry="5" fill="var(--color-blue)" stroke="var(--color-outline)" strokeWidth="2" />
        <path d="M24 52 Q24 65 42 65 Q60 65 60 52" fill="var(--color-blue)" stroke="var(--color-outline)" strokeWidth="2" />
        <ellipse cx="42" cy="52" rx="14" ry="3.5" fill="var(--color-blue-light)" opacity="0.5" />

        {/* Tiny bowl */}
        <ellipse cx="78" cy="50" rx="12" ry="3.5" fill="var(--color-yellow)" stroke="var(--color-outline)" strokeWidth="1.5" />
        <path d="M66 50 Q66 59 78 59 Q90 59 90 50" fill="var(--color-yellow)" stroke="var(--color-outline)" strokeWidth="1.5" />
        <ellipse cx="78" cy="50" rx="9" ry="2.5" fill="var(--color-yellow-light)" opacity="0.5" />

        {/* Shimmer highlights */}
        <circle cx="50" cy="57" r="2" fill="white" opacity="0.6" className="animate-shimmer" />
        <circle cx="75" cy="48" r="1.5" fill="white" opacity="0.5" className="animate-shimmer sparkle-delay-2" />

        {/* Mallet */}
        <line x1="90" y1="35" x2="75" y2="55" stroke="var(--color-peach)" strokeWidth="3" strokeLinecap="round" />
        <circle cx="90" cy="35" r="5" fill="var(--color-peach)" stroke="var(--color-outline)" strokeWidth="1.5" />
      </svg>
    </button>
  );
}
