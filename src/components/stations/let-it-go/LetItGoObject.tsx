'use client';

import { useState } from 'react';
import { AnimatePresence } from 'motion/react';
import FloatingLabel from '@/components/ui/FloatingLabel';

export default function LetItGoObject({
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
      aria-label="Open Let It Go station"
    >
      <AnimatePresence>
        {hovered && !isActive && (
          <FloatingLabel text="Let It Go" color="var(--color-peach-light)" />
        )}
      </AnimatePresence>

      <svg
        width="120"
        height="110"
        viewBox="0 0 120 110"
        fill="none"
        className="transition-all duration-300"
        style={{
          filter: hovered
            ? 'drop-shadow(0 0 14px rgba(226, 196, 168, 0.7))'
            : 'drop-shadow(0 2px 4px rgba(122, 110, 110, 0.1))',
        }}
      >
        {/* Ground/mat */}
        <ellipse cx="60" cy="95" rx="45" ry="10" fill="var(--color-peach-light)" stroke="var(--color-outline)" strokeWidth="2" />

        {/* Logs */}
        <rect x="28" y="78" width="64" height="10" rx="5" fill="var(--color-peach)" stroke="var(--color-outline)" strokeWidth="2" />
        <rect x="35" y="70" width="50" height="10" rx="5" fill="var(--color-peach)" stroke="var(--color-outline)" strokeWidth="2" transform="rotate(-8 60 75)" />
        <rect x="38" y="72" width="44" height="8" rx="4" fill="var(--color-peach-light)" stroke="var(--color-outline)" strokeWidth="1.5" transform="rotate(6 60 76)" />

        {/* Flames — outer glow */}
        <ellipse cx="60" cy="55" rx="22" ry="28" fill="var(--color-yellow-light)" opacity="0.4" />

        {/* Flames — layered */}
        <path d="M60 30 Q70 45 65 55 Q72 48 68 38 Q75 52 60 68 Q45 52 52 38 Q48 48 55 55 Q50 45 60 30Z" fill="var(--color-yellow)" stroke="var(--color-outline-soft)" strokeWidth="1.5" />
        <path d="M60 40 Q66 50 63 58 Q68 52 60 64 Q52 52 57 58 Q54 50 60 40Z" fill="var(--color-peach)" opacity="0.9" />
        <path d="M60 48 Q63 54 60 60 Q57 54 60 48Z" fill="var(--color-warm-white)" opacity="0.8" />

        {/* Sparkle embers */}
        <circle cx="48" cy="35" r="1.5" fill="var(--color-yellow)" className="animate-sparkle sparkle-delay-1" />
        <circle cx="72" cy="32" r="1.2" fill="var(--color-sparkle)" className="animate-sparkle sparkle-delay-3" />
        <circle cx="55" cy="26" r="1" fill="var(--color-sparkle)" className="animate-sparkle sparkle-delay-2" />
      </svg>
    </button>
  );
}
