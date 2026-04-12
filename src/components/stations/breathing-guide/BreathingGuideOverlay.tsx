'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAudioEngine } from '@/hooks/useAudioEngine';
import { audioEngine } from '@/lib/audio/AudioEngine';

type Phase = 'inhale' | 'exhale';

const INHALE_SECONDS = 4;
const EXHALE_SECONDS = 8;
const ROUND_SECONDS = INHALE_SECONDS + EXHALE_SECONDS;
const MIN_ROUNDS = 5;
const MAX_ROUNDS = 12;

const TUTORIAL_STEPS = [
  { step: '1', text: 'Inhale slowly through your nose for 4 seconds' },
  { step: '2', text: 'Exhale gently through your mouth for 8 seconds' },
  { step: '3', text: 'Repeat for 5–12 rounds to activate calm' },
];

export default function BreathingGuideOverlay() {
  const { initialize } = useAudioEngine();
  const [targetRounds, setTargetRounds] = useState(8);
  const [running, setRunning] = useState(false);
  const [phase, setPhase] = useState<Phase>('inhale');
  const [secondsLeft, setSecondsLeft] = useState(INHALE_SECONDS);
  const [currentRound, setCurrentRound] = useState(1);
  const [finished, setFinished] = useState(false);
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
      frequency: 65.41, // low C2 — deep, grounding
      type: 'sine',
      gain: 0.1,
      fadeIn: 3,
    });
  }, []);

  const stopDrone = useCallback(() => {
    if (droneRef.current) {
      droneRef.current.stop(2);
      droneRef.current = null;
    }
  }, []);

  // Stop drone on unmount
  useEffect(() => {
    return () => {
      droneRef.current?.stop(0.5);
      droneRef.current = null;
    };
  }, []);

  // Toggle sound while running
  useEffect(() => {
    if (running && soundOn) {
      startDrone();
    } else {
      stopDrone();
    }
  }, [running, soundOn, startDrone, stopDrone]);

  // Timer tick
  const stateRef = useRef({ phase, currentRound, targetRounds });
  useEffect(() => {
    stateRef.current = { phase, currentRound, targetRounds };
  });

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      setSecondsLeft(prev => {
        if (prev > 1) return prev - 1;
        const { phase: ph, currentRound: round, targetRounds: target } = stateRef.current;
        if (ph === 'inhale') {
          setPhase('exhale');
          return EXHALE_SECONDS;
        }
        // End of exhale — check if session is done
        if (round >= target) {
          setRunning(false);
          setFinished(true);
          return 0;
        }
        setPhase('inhale');
        setCurrentRound(r => r + 1);
        return INHALE_SECONDS;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [running]);

  const start = () => {
    setPhase('inhale');
    setSecondsLeft(INHALE_SECONDS);
    setCurrentRound(1);
    setFinished(false);
    setRunning(true);
  };

  const reset = () => {
    setRunning(false);
    setPhase('inhale');
    setSecondsLeft(INHALE_SECONDS);
    setCurrentRound(1);
    setFinished(false);
  };

  // Orb scale: full at inhale, small at exhale
  const orbScale = phase === 'inhale' ? 1.0 : 0.5;
  const orbDuration = phase === 'inhale' ? INHALE_SECONDS : EXHALE_SECONDS;

  // Progress through the session
  const totalSeconds = targetRounds * ROUND_SECONDS;
  const elapsedSeconds =
    (currentRound - 1) * ROUND_SECONDS
    + (phase === 'inhale'
      ? INHALE_SECONDS - secondsLeft
      : INHALE_SECONDS + EXHALE_SECONDS - secondsLeft);
  const progress = finished ? 1 : elapsedSeconds / totalSeconds;

  return (
    <div className="flex flex-col items-center gap-6 p-6 max-w-lg mx-auto select-none">
      {/* Sound toggle — top-right corner */}
      <button
        onClick={() => setSoundOn(s => !s)}
        className="fixed top-5 right-5 z-[1100] flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-200 cursor-pointer"
        style={{
          borderColor: 'var(--color-outline-soft)',
          backgroundColor: soundOn ? 'var(--color-blue-light)' : 'var(--color-warm-white)',
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
        <h2 className="text-2xl font-bold text-[var(--color-text)] mb-1">Breathing Guide</h2>
        <p className="text-xs text-[var(--color-text-muted)]">Down-regulation breathing</p>
      </div>

      {/* 3-step tutorial */}
      <div className="flex gap-3 w-full max-w-sm">
        {TUTORIAL_STEPS.map(({ step, text }) => (
          <div
            key={step}
            className="flex-1 flex flex-col items-center gap-1.5 px-2 py-3 border-2 text-center"
            style={{
              borderRadius: 'var(--radius-md)',
              borderColor: 'var(--color-outline-soft)',
              backgroundColor: 'var(--color-warm-white)',
            }}
          >
            <div
              className="w-6 h-6 flex items-center justify-center rounded-full text-xs font-extrabold text-[var(--color-warm-white)]"
              style={{ backgroundColor: 'var(--color-blue)' }}
            >
              {step}
            </div>
            <p className="text-[11px] leading-tight font-semibold text-[var(--color-text-muted)]">
              {text}
            </p>
          </div>
        ))}
      </div>

      {/* Rounds selector (only before starting) */}
      {!running && !finished && (
        <div className="flex flex-col items-center gap-2">
          <p className="text-xs font-semibold text-[var(--color-text-muted)]">Rounds</p>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setTargetRounds(r => Math.max(MIN_ROUNDS, r - 1))}
              disabled={targetRounds <= MIN_ROUNDS}
              className="w-8 h-8 flex items-center justify-center rounded-full border-2 font-bold text-sm cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
              style={{
                borderColor: 'var(--color-outline-soft)',
                backgroundColor: 'var(--color-warm-white)',
                color: 'var(--color-text)',
              }}
            >
              -
            </button>
            <span className="text-2xl font-extrabold text-[var(--color-text)] w-8 text-center tabular-nums">
              {targetRounds}
            </span>
            <button
              onClick={() => setTargetRounds(r => Math.min(MAX_ROUNDS, r + 1))}
              disabled={targetRounds >= MAX_ROUNDS}
              className="w-8 h-8 flex items-center justify-center rounded-full border-2 font-bold text-sm cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
              style={{
                borderColor: 'var(--color-outline-soft)',
                backgroundColor: 'var(--color-warm-white)',
                color: 'var(--color-text)',
              }}
            >
              +
            </button>
          </div>
          <p className="text-[10px] text-[var(--color-text-muted)]">
            12 rounds for full parasympathetic activation
          </p>
        </div>
      )}

      {/* Breathing orb */}
      <div className="relative flex items-center justify-center" style={{ width: 280, height: 280 }}>
        {/* Outer progress ring */}
        <svg className="absolute inset-0" width="280" height="280" viewBox="0 0 280 280">
          <circle cx="140" cy="140" r="132" fill="none" stroke="var(--color-outline-soft)" strokeWidth="3" opacity="0.2" />
          <circle
            cx="140"
            cy="140"
            r="132"
            fill="none"
            stroke="var(--color-blue)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray={2 * Math.PI * 132}
            strokeDashoffset={2 * Math.PI * 132 * (1 - progress)}
            style={{ transform: 'rotate(-90deg)', transformOrigin: 'center', transition: 'stroke-dashoffset 1s linear' }}
          />
        </svg>

        {/* Animated light ball */}
        <motion.div
          className="absolute rounded-full flex items-center justify-center"
          style={{
            width: 220,
            height: 220,
            background: 'radial-gradient(circle at 35% 35%, #e8f4fd, var(--color-blue-light) 50%, var(--color-blue) 85%, var(--color-lavender) 100%)',
            boxShadow: running
              ? `0 0 60px rgba(167, 196, 212, 0.5), 0 0 120px rgba(167, 196, 212, 0.2)`
              : 'var(--shadow-float)',
          }}
          animate={{ scale: running ? orbScale : 0.65 }}
          transition={{ duration: running ? orbDuration : 0.6, ease: 'easeInOut' }}
        >
          <div className="text-center">
            <AnimatePresence mode="wait">
              <motion.p
                key={finished ? 'done' : running ? phase : 'ready'}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.3 }}
                className="text-lg font-extrabold text-[var(--color-text)]"
              >
                {finished ? 'Well done' : running ? (phase === 'inhale' ? 'Breathe in' : 'Breathe out') : 'Ready'}
              </motion.p>
            </AnimatePresence>
            {running && (
              <p className="text-4xl font-extrabold text-[var(--color-text)] mt-1 tabular-nums">
                {secondsLeft}
              </p>
            )}
          </div>
        </motion.div>
      </div>

      {/* Round counter (while running) */}
      {(running || finished) && (
        <div
          className="flex items-center gap-2 px-4 py-1.5 border-2"
          style={{
            borderRadius: 'var(--radius-full)',
            borderColor: 'var(--color-blue)',
            backgroundColor: 'var(--color-warm-white)',
          }}
        >
          <span className="text-xs font-bold text-[var(--color-text)] tabular-nums">
            {finished ? targetRounds : currentRound} / {targetRounds} rounds
          </span>
        </div>
      )}

      {/* Controls */}
      <div className="flex gap-3">
        {!running && !finished && (
          <motion.button
            onClick={start}
            className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-[var(--color-blue)] text-[var(--color-text)] font-semibold border-2 border-[var(--color-outline)] shadow-[var(--shadow-soft)] cursor-pointer"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Start
          </motion.button>
        )}
        {running && (
          <motion.button
            onClick={reset}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-[var(--color-warm-white)] text-[var(--color-text)] font-semibold border-2 border-[var(--color-outline-soft)] shadow-[var(--shadow-soft)] cursor-pointer"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Stop
          </motion.button>
        )}
        {finished && (
          <motion.button
            onClick={reset}
            className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-[var(--color-blue)] text-[var(--color-text)] font-semibold border-2 border-[var(--color-outline)] shadow-[var(--shadow-soft)] cursor-pointer"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Again
          </motion.button>
        )}
      </div>

      {!running && !finished && (
        <p className="text-xs text-[var(--color-text-muted)] text-center max-w-xs">
          Inhale for 4 seconds, exhale for 8. The longer exhale activates your body&apos;s rest &amp; digest response.
        </p>
      )}
    </div>
  );
}
