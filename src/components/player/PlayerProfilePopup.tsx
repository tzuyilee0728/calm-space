'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { usePlayer } from '@/hooks/usePlayer';

export default function PlayerProfilePopup() {
  const { isProfileOpen, closeProfile, profile, setProfile } = usePlayer();
  const [name, setName] = useState(profile.name);

  // Sync local state when popup opens
  const handleOpen = () => {
    setName(profile.name);
  };

  const handleSave = () => {
    setProfile({ ...profile, name: name.trim() });
    closeProfile();
  };

  return (
    <AnimatePresence>
      {isProfileOpen && (
        <motion.div
          className="fixed inset-0 z-[200] flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onAnimationStart={handleOpen}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/20" onClick={closeProfile} />

          {/* Card */}
          <motion.div
            className="relative bg-[var(--color-warm-white)] border-2 border-[var(--color-outline-soft)] shadow-[var(--shadow-float)] px-8 py-6 w-[300px]"
            style={{ borderRadius: 'var(--radius-xl)' }}
            initial={{ scale: 0.8, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.8, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          >
            {/* Mini character preview */}
            <div className="flex justify-center mb-4">
              <svg width="60" height="80" viewBox="0 0 60 80" fill="none">
                {/* Hair */}
                <path d="M12 24 Q12 6 30 6 Q48 6 48 24" fill="var(--color-lavender)" stroke="var(--color-outline)" strokeWidth="2" />
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
                <circle cx="24" cy="27" r="1" fill="white" />
                <circle cx="38" cy="27" r="1" fill="white" />
                {/* Blush */}
                <ellipse cx="18" cy="32" rx="3.5" ry="2" fill="var(--color-blush)" opacity="0.5" />
                <ellipse cx="42" cy="32" rx="3.5" ry="2" fill="var(--color-blush)" opacity="0.5" />
                {/* Mouth */}
                <path d="M27 33 Q30 36 33 33" stroke="var(--color-outline)" strokeWidth="1.5" fill="none" strokeLinecap="round" />
                {/* Body */}
                <path d="M20 44 Q20 40 30 40 Q40 40 40 44 L42 60 Q42 64 30 64 Q18 64 18 60 Z" fill="var(--color-pink)" stroke="var(--color-outline)" strokeWidth="2" />
                <path d="M24 42 L30 46 L36 42" stroke="var(--color-outline-soft)" strokeWidth="1.5" fill="none" strokeLinecap="round" />
                {/* Legs */}
                <rect x="22" y="62" width="6" height="10" rx="3" fill="var(--color-peach-light)" stroke="var(--color-outline)" strokeWidth="1.5" />
                <rect x="32" y="62" width="6" height="10" rx="3" fill="var(--color-peach-light)" stroke="var(--color-outline)" strokeWidth="1.5" />
                <ellipse cx="25" cy="73" rx="5" ry="3" fill="var(--color-pink-light)" stroke="var(--color-outline)" strokeWidth="1.5" />
                <ellipse cx="35" cy="73" rx="5" ry="3" fill="var(--color-pink-light)" stroke="var(--color-outline)" strokeWidth="1.5" />
              </svg>
            </div>

            <h2 className="text-xl font-extrabold text-[var(--color-text)] text-center mb-4">
              My Profile
            </h2>

            {/* Name input */}
            <label className="block text-sm font-bold text-[var(--color-text-muted)] mb-1.5">
              Name
            </label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="What should we call you?"
              maxLength={20}
              className="w-full px-3 py-2 bg-[var(--color-cream)] border-2 border-[var(--color-outline-soft)] text-[var(--color-text)] placeholder-[var(--color-text-muted)] focus:border-[var(--color-pink)] focus:outline-none transition-colors"
              style={{ borderRadius: 'var(--radius-md)', fontFamily: 'inherit' }}
              onKeyDown={e => { if (e.key === 'Enter') handleSave(); }}
              autoFocus
            />

            {/* Future: color picker section */}

            {/* Save button */}
            <button
              onClick={handleSave}
              className="mt-4 w-full py-2 bg-[var(--color-pink-light)] border-2 border-[var(--color-outline)] text-[var(--color-text)] font-bold hover:bg-[var(--color-pink)] transition-colors cursor-pointer"
              style={{ borderRadius: 'var(--radius-full)' }}
            >
              Save
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
