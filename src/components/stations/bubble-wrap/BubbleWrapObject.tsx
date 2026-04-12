'use client';

import { useState } from 'react';
import { AnimatePresence } from 'motion/react';
import FloatingLabel from '@/components/ui/FloatingLabel';

export default function BubbleWrapObject({
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
      aria-label="Open Bubble Wrap station"
    >
      <AnimatePresence>
        {hovered && !isActive && (
          <FloatingLabel text="Bubble Wrap" color="var(--color-mint-light)" />
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
            ? 'drop-shadow(0 0 12px rgba(168, 207, 192, 0.6))'
            : 'drop-shadow(0 2px 4px rgba(122, 110, 110, 0.1))',
        }}
      >
        {/* Bubble wrap sheet */}
        <rect x="10" y="15" width="100" height="70" rx="8" fill="#d4ebe2" stroke="var(--color-outline)" strokeWidth="2.5" />
        <rect x="10" y="15" width="100" height="70" rx="8" fill="url(#wrapSheen)" />

        {/* Bubbles grid */}
        {[
          [30, 35], [55, 35], [80, 35],
          [30, 55], [55, 55], [80, 55],
          [30, 75], [55, 75], [80, 75],
        ].map(([cx, cy], i) => (
          <g key={i}>
            <circle cx={cx} cy={cy} r="8" fill="var(--color-mint-light)" stroke="var(--color-outline-soft)" strokeWidth="1.5" />
            <circle cx={cx! - 2} cy={cy! - 2} r="2.5" fill="white" opacity="0.7" />
          </g>
        ))}

        {/* Sparkle accents */}
        <circle cx="95" cy="25" r="2" fill="var(--color-sparkle)" className="animate-sparkle sparkle-delay-1" />
        <circle cx="20" cy="70" r="1.5" fill="var(--color-sparkle)" className="animate-sparkle sparkle-delay-3" />

        <defs>
          <linearGradient id="wrapSheen" x1="10" y1="15" x2="110" y2="85" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="white" stopOpacity="0.2" />
            <stop offset="50%" stopColor="white" stopOpacity="0" />
            <stop offset="100%" stopColor="white" stopOpacity="0.1" />
          </linearGradient>
        </defs>
      </svg>
    </button>
  );
}
