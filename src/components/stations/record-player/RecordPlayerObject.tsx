'use client';

import { useState } from 'react';
import { AnimatePresence } from 'motion/react';
import FloatingLabel from '@/components/ui/FloatingLabel';

export default function RecordPlayerObject({
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
      aria-label="Open Record Player station"
    >
      <AnimatePresence>
        {hovered && !isActive && (
          <FloatingLabel text="Meditation Music" color="var(--color-peach-light)" />
        )}
      </AnimatePresence>

      <svg
        width="130"
        height="110"
        viewBox="0 0 130 110"
        fill="none"
        className="transition-all duration-300"
        style={{
          filter: hovered
            ? 'drop-shadow(0 0 12px rgba(226, 196, 168, 0.6))'
            : 'drop-shadow(0 2px 4px rgba(122, 110, 110, 0.1))',
        }}
      >
        {/* Cabinet body */}
        <rect x="10" y="30" width="110" height="65" rx="10" fill="var(--color-peach)" stroke="var(--color-outline)" strokeWidth="2.5" />
        <rect x="10" y="30" width="110" height="65" rx="10" fill="url(#cabinetSheen)" />

        {/* Cabinet front detail */}
        <rect x="20" y="70" width="30" height="18" rx="4" fill="var(--color-peach-light)" stroke="var(--color-outline-soft)" strokeWidth="1.5" />
        <line x1="28" y1="74" x2="42" y2="74" stroke="var(--color-outline-soft)" strokeWidth="1" />
        <line x1="28" y1="78" x2="42" y2="78" stroke="var(--color-outline-soft)" strokeWidth="1" />
        <line x1="28" y1="82" x2="42" y2="82" stroke="var(--color-outline-soft)" strokeWidth="1" />

        {/* Knobs */}
        <circle cx="75" cy="79" r="4" fill="var(--color-yellow)" stroke="var(--color-outline)" strokeWidth="1.5" />
        <circle cx="90" cy="79" r="4" fill="var(--color-yellow)" stroke="var(--color-outline)" strokeWidth="1.5" />
        <circle cx="105" cy="79" r="4" fill="var(--color-pink)" stroke="var(--color-outline)" strokeWidth="1.5" />

        {/* Turntable surface */}
        <rect x="15" y="28" width="100" height="8" rx="4" fill="var(--color-peach-light)" stroke="var(--color-outline)" strokeWidth="2" />

        {/* Record */}
        <g className={isActive ? 'animate-spin-slow' : ''} style={{ transformOrigin: '65px 22px' }}>
          <circle cx="65" cy="22" r="20" fill="#4a4040" stroke="var(--color-outline)" strokeWidth="2" />
          <circle cx="65" cy="22" r="16" fill="none" stroke="var(--color-outline-soft)" strokeWidth="0.5" opacity="0.5" />
          <circle cx="65" cy="22" r="12" fill="none" stroke="var(--color-outline-soft)" strokeWidth="0.5" opacity="0.5" />
          <circle cx="65" cy="22" r="8" fill="none" stroke="var(--color-outline-soft)" strokeWidth="0.5" opacity="0.5" />
          <circle cx="65" cy="22" r="4" fill="var(--color-pink)" stroke="var(--color-outline)" strokeWidth="1" />
          <circle cx="65" cy="22" r="1.5" fill="var(--color-outline)" />
        </g>

        {/* Tonearm */}
        <line x1="100" y1="10" x2="75" y2="22" stroke="var(--color-outline-soft)" strokeWidth="2" strokeLinecap="round" />
        <circle cx="100" cy="10" r="3" fill="var(--color-outline-soft)" />
        <circle cx="75" cy="22" r="1.5" fill="var(--color-outline)" />

        {/* Sparkle */}
        <circle cx="25" cy="40" r="2" fill="var(--color-sparkle)" className="animate-sparkle sparkle-delay-2" />

        <defs>
          <linearGradient id="cabinetSheen" x1="10" y1="30" x2="120" y2="95" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="white" stopOpacity="0.15" />
            <stop offset="100%" stopColor="white" stopOpacity="0" />
          </linearGradient>
        </defs>
      </svg>
    </button>
  );
}
