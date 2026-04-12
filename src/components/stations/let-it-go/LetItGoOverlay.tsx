'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAudioEngine } from '@/hooks/useAudioEngine';
import { audioEngine } from '@/lib/audio/AudioEngine';
import BurnEffect from './BurnEffect';
import TearEffect from './TearEffect';

type ThreatTag = 'real' | 'perceived' | null;
type Stage = 'writing' | 'burning' | 'tearing' | 'done';
type DestroyMethod = 'burn' | 'tear';

export default function LetItGoOverlay() {
  const { initialize } = useAudioEngine();
  const [text, setText] = useState('');
  const [tag, setTag] = useState<ThreatTag>(null);
  const [stage, setStage] = useState<Stage>('writing');
  const [destroyMethod, setDestroyMethod] = useState<DestroyMethod>('burn');
  const [released, setReleased] = useState(0);
  const [soundOn, setSoundOn] = useState(true);

  const droneRef = useRef<{ stop: (fadeOut?: number) => void } | null>(null);
  const soundOnRef = useRef(soundOn);

  useEffect(() => {
    soundOnRef.current = soundOn;
  });

  useEffect(() => {
    initialize();
  }, [initialize]);

  const startDrone = useCallback(() => {
    if (droneRef.current || !soundOnRef.current) return;
    droneRef.current = audioEngine.createDrone({
      frequency: 110,
      type: 'sine',
      gain: 0.06,
      fadeIn: 3,
    });
  }, []);

  const stopDrone = useCallback(() => {
    if (droneRef.current) {
      droneRef.current.stop(2);
      droneRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (soundOn) {
      startDrone();
    } else {
      stopDrone();
    }
  }, [soundOn, startDrone, stopDrone]);

  useEffect(() => {
    return () => {
      droneRef.current?.stop(0.5);
      droneRef.current = null;
    };
  }, []);

  const startBurn = () => {
    if (!text.trim() || tag === null) return;
    setDestroyMethod('burn');
    setStage('burning');
  };

  const startTear = () => {
    if (!text.trim() || tag === null) return;
    setDestroyMethod('tear');
    setStage('tearing');
  };

  const handleComplete = useCallback(() => {
    setReleased(r => r + 1);
    setStage('done');
    if (soundOnRef.current) {
      audioEngine.playBowlTone({ fundamental: 392, gain: 0.15 });
    }
  }, []);

  const writeAnother = () => {
    setText('');
    setTag(null);
    setStage('writing');
  };

  const canDestroy = text.trim().length > 0 && tag !== null;

  return (
    <div className="flex flex-col items-center gap-6 p-6 max-w-lg mx-auto select-none">
      {/* Sound toggle */}
      <button
        onClick={() => setSoundOn(s => !s)}
        className="fixed top-5 right-5 z-[1100] flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-200 cursor-pointer"
        style={{
          borderColor: 'var(--color-outline-soft)',
          backgroundColor: soundOn ? 'var(--color-peach-light)' : 'var(--color-warm-white)',
        }}
        aria-label={soundOn ? 'Mute background sound' : 'Unmute background sound'}
      >
        {soundOn ? (
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M3 8v4h3l4 4V4L6 8H3z" fill="var(--color-text)" />
            <path d="M14 6.5a4.5 4.5 0 010 7" stroke="var(--color-text)" strokeWidth="1.5" strokeLinecap="round" />
            <path d="M16 4a7.5 7.5 0 010 12" stroke="var(--color-text)" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        ) : (
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M3 8v4h3l4 4V4L6 8H3z" fill="var(--color-text-muted)" />
            <line x1="14" y1="7" x2="18" y2="13" stroke="var(--color-text-muted)" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="18" y1="7" x2="14" y2="13" stroke="var(--color-text-muted)" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        )}
      </button>

      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-[var(--color-text)] mb-1">Let It Go</h2>
        <p className="text-xs text-[var(--color-text-muted)] max-w-xs leading-relaxed">
          Your brain treats rejection like danger — it&apos;s not. Name the fear, then let it go.
        </p>
      </div>

      {/* Released counter */}
      {released > 0 && (
        <div
          className="flex items-center gap-2 px-4 py-1.5 border-2"
          style={{
            borderRadius: 'var(--radius-full)',
            borderColor: 'var(--color-peach)',
            backgroundColor: 'var(--color-warm-white)',
          }}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M7 2 Q9 5 8 7 Q10 6 7 10 Q4 6 6 7 Q5 5 7 2Z" fill="var(--color-peach)" />
          </svg>
          <span className="text-xs font-bold text-[var(--color-text)] tabular-nums">
            {released} {released === 1 ? 'fear' : 'fears'} released
          </span>
        </div>
      )}

      {/* Main area */}
      <div className="relative w-full flex flex-col items-center" style={{ minHeight: 360 }}>
        <AnimatePresence mode="wait">
          {/* ---- Writing stage ---- */}
          {stage === 'writing' && (
            <motion.div
              key="note"
              className="w-full flex flex-col items-center gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.3 }}
            >
              {/* Paper note */}
              <div
                className="w-full border-2 overflow-hidden"
                style={{
                  borderRadius: 'var(--radius-lg)',
                  borderColor: 'var(--color-outline-soft)',
                  backgroundColor: 'var(--color-cream)',
                  boxShadow: 'var(--shadow-soft)',
                }}
              >
                <div className="px-4 pt-3 pb-1">
                  <p className="text-[11px] font-bold text-[var(--color-text-muted)]">
                    What fear is holding you back?
                  </p>
                </div>
                <textarea
                  value={text}
                  onChange={e => setText(e.target.value)}
                  placeholder="e.g. People will think my idea is stupid..."
                  rows={3}
                  className="w-full px-4 pb-4 text-sm text-[var(--color-text)] bg-transparent resize-none outline-none placeholder:text-[var(--color-outline-soft)]"
                  style={{ fontStyle: 'italic' }}
                  maxLength={200}
                />
              </div>

              {/* Threat check */}
              <div className="flex flex-col items-center gap-2">
                <p className="text-[11px] font-semibold text-[var(--color-text-muted)]">
                  Is this a real threat?
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setTag('real')}
                    className="px-4 py-1.5 text-xs font-bold border-2 transition-all duration-200 cursor-pointer"
                    style={{
                      borderRadius: 'var(--radius-full)',
                      borderColor: tag === 'real' ? 'var(--color-outline)' : 'var(--color-outline-soft)',
                      backgroundColor: tag === 'real' ? 'var(--color-pink-light)' : 'var(--color-warm-white)',
                      color: 'var(--color-text)',
                    }}
                  >
                    Real threat
                  </button>
                  <button
                    onClick={() => setTag('perceived')}
                    className="px-4 py-1.5 text-xs font-bold border-2 transition-all duration-200 cursor-pointer"
                    style={{
                      borderRadius: 'var(--radius-full)',
                      borderColor: tag === 'perceived' ? 'var(--color-outline)' : 'var(--color-outline-soft)',
                      backgroundColor: tag === 'perceived' ? 'var(--color-mint-light)' : 'var(--color-warm-white)',
                      color: 'var(--color-text)',
                    }}
                  >
                    Just my brain worrying
                  </button>
                </div>
              </div>

              {/* Destroy method buttons */}
              <div className="flex gap-3">
                <motion.button
                  onClick={startBurn}
                  disabled={!canDestroy}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-full font-semibold border-2 shadow-[var(--shadow-soft)] cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                  style={{
                    backgroundColor: 'var(--color-peach)',
                    borderColor: 'var(--color-outline)',
                    color: 'var(--color-text)',
                  }}
                  whileHover={canDestroy ? { scale: 1.05 } : undefined}
                  whileTap={canDestroy ? { scale: 0.95 } : undefined}
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M8 2 Q11 5 10 8 Q12 6 8 13 Q4 6 6 8 Q5 5 8 2Z" fill="currentColor" />
                  </svg>
                  Burn it
                </motion.button>

                <motion.button
                  onClick={startTear}
                  disabled={!canDestroy}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-full font-semibold border-2 shadow-[var(--shadow-soft)] cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                  style={{
                    backgroundColor: 'var(--color-lavender-light)',
                    borderColor: 'var(--color-outline)',
                    color: 'var(--color-text)',
                  }}
                  whileHover={canDestroy ? { scale: 1.05 } : undefined}
                  whileTap={canDestroy ? { scale: 0.95 } : undefined}
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M5 2v4l-3 3h4l2 5 2-5h4l-3-3V2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                  </svg>
                  Tear it up
                </motion.button>
              </div>
            </motion.div>
          )}

          {/* ---- Burning stage ---- */}
          {stage === 'burning' && (
            <motion.div
              key="burning"
              className="flex flex-col items-center justify-center"
              style={{ minHeight: 300 }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <BurnEffect
                text={text}
                tag={tag}
                soundOn={soundOn}
                onComplete={handleComplete}
              />
            </motion.div>
          )}

          {/* ---- Tearing stage ---- */}
          {stage === 'tearing' && (
            <motion.div
              key="tearing"
              className="flex flex-col items-center justify-center"
              style={{ minHeight: 300 }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <TearEffect
                text={text}
                tag={tag}
                soundOn={soundOn}
                onComplete={handleComplete}
              />
            </motion.div>
          )}

          {/* ---- Done stage ---- */}
          {stage === 'done' && (
            <motion.div
              key="done"
              className="flex flex-col items-center justify-center gap-5"
              style={{ minHeight: 300 }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              {/* Icon */}
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', damping: 12, delay: 0.2 }}
              >
                {destroyMethod === 'burn' ? (
                  <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                    <path d="M24 6 Q32 16 30 24 Q36 18 24 38 Q12 18 18 24 Q16 16 24 6Z" fill="var(--color-peach)" stroke="var(--color-outline-soft)" strokeWidth="1.5" />
                    <path d="M24 18 Q28 24 24 32 Q20 24 24 18Z" fill="var(--color-yellow-light)" />
                  </svg>
                ) : (
                  <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                    <rect x="8" y="14" width="13" height="20" rx="2" fill="var(--color-lavender-light)" stroke="var(--color-outline-soft)" strokeWidth="1.5" transform="rotate(-12 14 24)" />
                    <rect x="27" y="14" width="13" height="20" rx="2" fill="var(--color-lavender-light)" stroke="var(--color-outline-soft)" strokeWidth="1.5" transform="rotate(8 33 24)" />
                    <rect x="16" y="18" width="16" height="14" rx="2" fill="var(--color-cream)" stroke="var(--color-outline-soft)" strokeWidth="1.5" transform="rotate(3 24 25)" />
                  </svg>
                )}
              </motion.div>

              <motion.p
                className="text-lg font-bold text-[var(--color-text)]"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                {destroyMethod === 'burn' ? 'Turned to ash' : 'Torn to pieces'}
              </motion.p>

              <motion.p
                className="text-xs text-[var(--color-text-muted)] text-center max-w-[240px]"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
              >
                {tag === 'perceived'
                  ? 'That fear was just outdated wiring. You saw through it.'
                  : 'Even real fears lose their grip when you face them.'}
              </motion.p>

              <motion.button
                onClick={writeAnother}
                className="flex items-center gap-2 px-5 py-2.5 rounded-full font-semibold border-2 shadow-[var(--shadow-soft)] cursor-pointer"
                style={{
                  backgroundColor: 'var(--color-warm-white)',
                  borderColor: 'var(--color-outline-soft)',
                  color: 'var(--color-text)',
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
              >
                Write another
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
