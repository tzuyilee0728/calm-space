'use client';

import { useState } from 'react';
import { AnimatePresence } from 'motion/react';
import FloatingLabel from '@/components/ui/FloatingLabel';

export default function BreathingGuideObject({
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
      aria-label="Open Breathing Guide station"
    >
      <AnimatePresence>
        {hovered && !isActive && (
          <FloatingLabel text="Breathing Guide" color="var(--color-blue-light)" />
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
            ? 'drop-shadow(0 0 14px rgba(167, 196, 212, 0.6))'
            : 'drop-shadow(0 2px 4px rgba(122, 110, 110, 0.1))',
        }}
      >
        {/* Cushion / mat */}
        <ellipse cx="60" cy="92" rx="42" ry="9" fill="var(--color-blue-light)" stroke="var(--color-outline)" strokeWidth="2.5" />
        <ellipse cx="60" cy="90" rx="36" ry="6" fill="var(--color-warm-white)" opacity="0.6" />

        {/* Outer petals — softly pulsing aura */}
        <g
          className={isActive ? 'animate-gentle-pulse' : ''}
          style={{ transformOrigin: '60px 60px' }}
        >
          <ellipse cx="60" cy="36" rx="12" ry="22" fill="var(--color-mint-light)" stroke="var(--color-outline-soft)" strokeWidth="1.5" opacity="0.85" />
          <ellipse cx="60" cy="36" rx="12" ry="22" fill="var(--color-mint-light)" stroke="var(--color-outline-soft)" strokeWidth="1.5" opacity="0.85" transform="rotate(60 60 60)" />
          <ellipse cx="60" cy="36" rx="12" ry="22" fill="var(--color-blue-light)" stroke="var(--color-outline-soft)" strokeWidth="1.5" opacity="0.85" transform="rotate(120 60 60)" />
          <ellipse cx="60" cy="36" rx="12" ry="22" fill="var(--color-blue-light)" stroke="var(--color-outline-soft)" strokeWidth="1.5" opacity="0.85" transform="rotate(180 60 60)" />
          <ellipse cx="60" cy="36" rx="12" ry="22" fill="var(--color-lavender-light)" stroke="var(--color-outline-soft)" strokeWidth="1.5" opacity="0.85" transform="rotate(240 60 60)" />
          <ellipse cx="60" cy="36" rx="12" ry="22" fill="var(--color-lavender-light)" stroke="var(--color-outline-soft)" strokeWidth="1.5" opacity="0.85" transform="rotate(300 60 60)" />
        </g>

        {/* Center orb */}
        <circle cx="60" cy="60" r="14" fill="var(--color-blue)" stroke="var(--color-outline)" strokeWidth="2.5" />
        <circle cx="60" cy="60" r="9" fill="var(--color-blue-light)" opacity="0.8" />
        <circle cx="56" cy="56" r="3" fill="white" opacity="0.7" />

        {/* Sparkle accents */}
        <circle cx="22" cy="40" r="1.8" fill="var(--color-sparkle)" className="animate-sparkle sparkle-delay-1" />
        <circle cx="98" cy="50" r="1.5" fill="var(--color-sparkle)" className="animate-sparkle sparkle-delay-3" />
        <circle cx="92" cy="22" r="1.3" fill="var(--color-sparkle)" className="animate-sparkle sparkle-delay-2" />
      </svg>
    </button>
  );
}
