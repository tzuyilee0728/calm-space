'use client';

import { useState } from 'react';
import { AnimatePresence } from 'motion/react';
import FloatingLabel from '@/components/ui/FloatingLabel';
import { usePlayer } from '@/hooks/usePlayer';

export default function PlayerCharacter() {
  const { facing, isWalking, profile, openProfile } = usePlayer();
  const [hovered, setHovered] = useState(false);

  const label = profile.name || 'Me';

  return (
    <button
      onClick={openProfile}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="relative group cursor-pointer"
      aria-label="Open profile"
    >
      <AnimatePresence>
        {hovered && (
          <FloatingLabel text={label} color="var(--color-peach-light)" />
        )}
      </AnimatePresence>

      <svg
        width="60"
        height="80"
        viewBox="0 0 60 80"
        fill="none"
        className={isWalking ? 'animate-walk-bob' : ''}
        style={{
          filter: hovered
            ? 'drop-shadow(0 0 10px rgba(232, 180, 184, 0.5))'
            : 'drop-shadow(0 2px 4px rgba(122, 110, 110, 0.15))',
        }}
      >
        <g transform={facing === 'left' ? 'translate(60, 0) scale(-1, 1)' : undefined}>
          {/* Hair */}
          <path
            d="M12 24 Q12 6 30 6 Q48 6 48 24"
            fill="var(--color-lavender)"
            stroke="var(--color-outline)"
            strokeWidth="2"
          />
          {/* Head */}
          <circle cx="30" cy="26" r="18" fill="var(--color-peach-light)" stroke="var(--color-outline)" strokeWidth="2" />
          {/* Hair bangs */}
          <path
            d="M14 22 Q16 14 24 16 Q20 12 30 10 Q26 16 32 14 Q28 18 36 15 Q32 12 38 12 Q44 14 46 22"
            fill="var(--color-lavender)"
            stroke="var(--color-outline)"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />

          {/* Eyes */}
          <circle cx="23" cy="28" r="2.5" fill="var(--color-outline)" />
          <circle cx="37" cy="28" r="2.5" fill="var(--color-outline)" />
          {/* Eye shine */}
          <circle cx="24" cy="27" r="1" fill="white" />
          <circle cx="38" cy="27" r="1" fill="white" />

          {/* Blush */}
          <ellipse cx="18" cy="32" rx="3.5" ry="2" fill="var(--color-blush)" opacity="0.5" />
          <ellipse cx="42" cy="32" rx="3.5" ry="2" fill="var(--color-blush)" opacity="0.5" />

          {/* Mouth */}
          <path d="M27 33 Q30 36 33 33" stroke="var(--color-outline)" strokeWidth="1.5" fill="none" strokeLinecap="round" />

          {/* Body / dress */}
          <path
            d="M20 44 Q20 40 30 40 Q40 40 40 44 L42 60 Q42 64 30 64 Q18 64 18 60 Z"
            fill="var(--color-pink)"
            stroke="var(--color-outline)"
            strokeWidth="2"
          />
          {/* Collar detail */}
          <path d="M24 42 L30 46 L36 42" stroke="var(--color-outline-soft)" strokeWidth="1.5" fill="none" strokeLinecap="round" />

          {/* Arms */}
          <path d="M20 46 Q14 50 16 56" stroke="var(--color-outline)" strokeWidth="2" fill="none" strokeLinecap="round" />
          <path d="M40 46 Q46 50 44 56" stroke="var(--color-outline)" strokeWidth="2" fill="none" strokeLinecap="round" />
          {/* Hands */}
          <circle cx="16" cy="56" r="3" fill="var(--color-peach-light)" stroke="var(--color-outline)" strokeWidth="1.5" />
          <circle cx="44" cy="56" r="3" fill="var(--color-peach-light)" stroke="var(--color-outline)" strokeWidth="1.5" />

          {/* Legs */}
          <rect x="22" y="62" width="6" height="10" rx="3" fill="var(--color-peach-light)" stroke="var(--color-outline)" strokeWidth="1.5" />
          <rect x="32" y="62" width="6" height="10" rx="3" fill="var(--color-peach-light)" stroke="var(--color-outline)" strokeWidth="1.5" />
          {/* Shoes */}
          <ellipse cx="25" cy="73" rx="5" ry="3" fill="var(--color-pink-light)" stroke="var(--color-outline)" strokeWidth="1.5" />
          <ellipse cx="35" cy="73" rx="5" ry="3" fill="var(--color-pink-light)" stroke="var(--color-outline)" strokeWidth="1.5" />
        </g>

        {/* Sparkle */}
        <circle cx="50" cy="10" r="2" fill="var(--color-sparkle)" className="animate-sparkle sparkle-delay-2" />
      </svg>
    </button>
  );
}
