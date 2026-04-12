'use client';

import { motion } from 'motion/react';

export default function FloatingLabel({ text, color }: { text: string; color: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
      className="absolute -top-10 left-1/2 -translate-x-1/2 whitespace-nowrap px-3 py-1 rounded-full text-sm font-bold text-[var(--color-text)] border-2 border-[var(--color-outline-soft)] shadow-[var(--shadow-soft)]"
      style={{ backgroundColor: color }}
    >
      {text}
    </motion.div>
  );
}
