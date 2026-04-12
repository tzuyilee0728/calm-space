'use client';

import { motion } from 'motion/react';

export default function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <motion.button
      onClick={onClick}
      className="fixed top-6 left-6 z-50 flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--color-warm-white)] text-[var(--color-text)] font-semibold shadow-[var(--shadow-soft)] border-2 border-[var(--color-outline-soft)] hover:border-[var(--color-pink)] transition-colors cursor-pointer"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      aria-label="Back to room"
    >
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path
          d="M12 15L7 10L12 5"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <span className="text-sm">Back</span>
    </motion.button>
  );
}
