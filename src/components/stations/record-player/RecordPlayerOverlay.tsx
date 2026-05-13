'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'motion/react';

interface Track {
  id: string;
  name: string;
  hz: string;
  hzDetail: string;
  description: string;
  color: string;
  colorLight: string;
  requiresHeadphones: boolean;
  src: string;
  sourceLabel: string;
  sourceUrl: string;
}

// All tracks streamed directly from archive.org (no hosting needed).
const TRACKS: Track[] = [
  {
    id: 'schumann-7-83',
    name: 'Schumann Resonance',
    hz: '7.83 Hz',
    hzDetail: 'deep theta binaural · 1 hr',
    description: "Earth's electromagnetic frequency — sits on the theta/alpha boundary. Grounding, meditative calm.",
    color: 'var(--color-mint)',
    colorLight: 'var(--color-mint-light)',
    requiresHeadphones: true,
    src: "https://archive.org/download/EarthsOhm7.83HzDeepThetaBinauralBeatsPurerSchumannResonanceaEart/Earth%27s%20Ohm%207.83%20Hz%E2%98%85Deep%20Theta%20Binaural%20Beats%20Pure%E2%98%85Schumann%20Resonance%E2%98%85Eart.mp3",
    sourceLabel: 'archive.org',
    sourceUrl: 'https://archive.org/details/EarthsOhm7.83HzDeepThetaBinauralBeatsPurerSchumannResonanceaEart',
  },
  {
    id: 'theta-7',
    name: 'Theta Binaural',
    hz: '7 Hz',
    hzDetail: 'theta band · 1 hr loop',
    description: 'Deep meditation range. Theta-band beats linked to relaxation and reduced pain perception.',
    color: 'var(--color-lavender)',
    colorLight: 'var(--color-lavender-light)',
    requiresHeadphones: true,
    src: 'https://archive.org/download/RestorativeSleepMusicBinauralBeatsSleepInTheClouds432Hz/Pure%20Theta%20Waves%20Binaural%20Beats%20%287%20Hz%29%20%201H.mp3',
    sourceLabel: 'archive.org',
    sourceUrl: 'https://archive.org/details/RestorativeSleepMusicBinauralBeatsSleepInTheClouds432Hz',
  },
  {
    id: 'alpha-10',
    name: 'Alpha Binaural',
    hz: '10 Hz',
    hzDetail: 'alpha band · relaxation',
    description: 'Relaxed alertness. The most-studied range for stress reduction and light focus.',
    color: 'var(--color-blue)',
    colorLight: 'var(--color-blue-light)',
    requiresHeadphones: true,
    src: 'https://archive.org/download/RestorativeSleepMusicBinauralBeatsSleepInTheClouds432Hz/Pure%20Alpha%20Waves%20%2810%20Hz%29%20%20Relaxation.mp3',
    sourceLabel: 'archive.org',
    sourceUrl: 'https://archive.org/details/RestorativeSleepMusicBinauralBeatsSleepInTheClouds432Hz',
  },
  {
    id: 'deep-theta-4',
    name: 'Deep Theta',
    hz: '4 Hz',
    hzDetail: 'deep meditation · 1 hr',
    description: 'Lower theta for deep meditative states and pre-sleep wind-down.',
    color: 'var(--color-peach)',
    colorLight: 'var(--color-peach-light)',
    requiresHeadphones: true,
    src: 'https://archive.org/download/RestorativeSleepMusicBinauralBeatsSleepInTheClouds432Hz/Pure%20Theta%20Waves%20%284%20Hz%29%20%20Deep%20Meditation%20-%201hr%20Binaural%20Beats.mp3',
    sourceLabel: 'archive.org',
    sourceUrl: 'https://archive.org/details/RestorativeSleepMusicBinauralBeatsSleepInTheClouds432Hz',
  },
  {
    id: 'solfeggio-528',
    name: '528 Hz Meditation',
    hz: '528 Hz',
    hzDetail: 'solfeggio · anti-anxiety',
    description: 'A 2018 study reported reduced cortisol and lower anxiety after exposure to 528 Hz.',
    color: 'var(--color-pink)',
    colorLight: 'var(--color-pink-light)',
    requiresHeadphones: false,
    src: 'https://archive.org/download/RestorativeSleepMusicBinauralBeatsSleepInTheClouds432Hz/M%C3%A9ditation%20Son%20Binaural%20%20528%20Hz%20%28Anti%20Anxi%C3%A9t%C3%A9%29.mp3',
    sourceLabel: 'archive.org',
    sourceUrl: 'https://archive.org/details/RestorativeSleepMusicBinauralBeatsSleepInTheClouds432Hz',
  },
  {
    id: 'sleep-432',
    name: 'Sleep in the Clouds',
    hz: '432 Hz',
    hzDetail: 'ambient · restorative sleep',
    description: 'A small double-blind study found 432 Hz music slowed heart rate vs. 440 Hz tuning.',
    color: 'var(--color-yellow)',
    colorLight: 'var(--color-yellow-light)',
    requiresHeadphones: false,
    src: 'https://archive.org/download/RestorativeSleepMusicBinauralBeatsSleepInTheClouds432Hz/Restorative%20Sleep%20Music%20-%20Binaural%20Beats%20Sleep%20In%20The%20Clouds%20-%20432%20Hz.mp3',
    sourceLabel: 'archive.org',
    sourceUrl: 'https://archive.org/details/RestorativeSleepMusicBinauralBeatsSleepInTheClouds432Hz',
  },
];

const DURATION_PRESETS: { label: string; seconds: number | null }[] = [
  { label: '3 min', seconds: 3 * 60 },
  { label: '5 min', seconds: 5 * 60 },
  { label: '10 min', seconds: 10 * 60 },
  { label: '15 min', seconds: 15 * 60 },
  { label: '20 min', seconds: 20 * 60 },
  { label: '30 min', seconds: 30 * 60 },
  { label: 'Open', seconds: null },
];

const BASE_VOLUME = 0.8;
const FADE_OUT_SECONDS = 4;

function formatTime(totalSeconds: number): string {
  const s = Math.max(0, Math.floor(totalSeconds));
  const mm = Math.floor(s / 60).toString().padStart(2, '0');
  const ss = (s % 60).toString().padStart(2, '0');
  return `${mm}:${ss}`;
}

export default function RecordPlayerOverlay() {
  const [activeTrackId, setActiveTrackId] = useState<string | null>(null);
  const [selectedSeconds, setSelectedSeconds] = useState<number | null>(10 * 60);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const startedAtRef = useRef<number | null>(null);
  const pausedElapsedRef = useRef(0);
  const sessionSecondsRef = useRef<number | null>(null);
  const tickTimerRef = useRef<number | null>(null);
  const autoStopTimerRef = useRef<number | null>(null);
  const fadeTimerRef = useRef<number | null>(null);
  const slowLoadTimerRef = useRef<number | null>(null);
  const canplayHandlerRef = useRef<(() => void) | null>(null);

  const isPlaying = activeTrackId !== null;
  const activeTrack = TRACKS.find(t => t.id === activeTrackId) || null;
  const totalSeconds = selectedSeconds;
  const remainingSeconds = totalSeconds == null ? null : Math.max(0, totalSeconds - elapsedSeconds);

  // Lazy init of the shared <audio> element
  const getAudio = useCallback((): HTMLAudioElement => {
    if (audioRef.current) return audioRef.current;
    const el = new Audio();
    el.preload = 'auto';
    el.loop = true;
    el.volume = BASE_VOLUME;
    audioRef.current = el;
    return el;
  }, []);

  const clearTimers = useCallback(() => {
    if (tickTimerRef.current != null) {
      window.clearInterval(tickTimerRef.current);
      tickTimerRef.current = null;
    }
    if (autoStopTimerRef.current != null) {
      window.clearTimeout(autoStopTimerRef.current);
      autoStopTimerRef.current = null;
    }
    if (fadeTimerRef.current != null) {
      window.clearInterval(fadeTimerRef.current);
      fadeTimerRef.current = null;
    }
    if (slowLoadTimerRef.current != null) {
      window.clearTimeout(slowLoadTimerRef.current);
      slowLoadTimerRef.current = null;
    }
    const el = audioRef.current;
    if (el && canplayHandlerRef.current) {
      el.removeEventListener('canplay', canplayHandlerRef.current);
      canplayHandlerRef.current = null;
    }
  }, []);

  const fadeOutAndStop = useCallback((seconds: number) => {
    const el = audioRef.current;
    if (!el) return;
    if (fadeTimerRef.current != null) {
      window.clearInterval(fadeTimerRef.current);
    }
    const startVol = el.volume;
    const startAt = performance.now();
    fadeTimerRef.current = window.setInterval(() => {
      const t = (performance.now() - startAt) / 1000 / seconds;
      if (t >= 1) {
        el.volume = 0;
        el.pause();
        el.currentTime = 0;
        el.volume = BASE_VOLUME;
        if (fadeTimerRef.current != null) {
          window.clearInterval(fadeTimerRef.current);
          fadeTimerRef.current = null;
        }
        return;
      }
      el.volume = startVol * (1 - t);
    }, 60);
  }, []);

  const scheduleAutoStop = useCallback((remainingMs: number) => {
    if (autoStopTimerRef.current != null) {
      window.clearTimeout(autoStopTimerRef.current);
      autoStopTimerRef.current = null;
    }
    const fadeStartMs = Math.max(0, remainingMs - FADE_OUT_SECONDS * 1000);
    autoStopTimerRef.current = window.setTimeout(() => {
      fadeOutAndStop(FADE_OUT_SECONDS);
      window.setTimeout(() => {
        clearTimers();
        startedAtRef.current = null;
        pausedElapsedRef.current = 0;
        sessionSecondsRef.current = null;
        setActiveTrackId(null);
        setElapsedSeconds(0);
        setIsPaused(false);
      }, FADE_OUT_SECONDS * 1000);
    }, fadeStartMs);
  }, [clearTimers, fadeOutAndStop]);

  const stopCurrent = useCallback((fade = 2) => {
    clearTimers();
    const el = audioRef.current;
    if (el && !el.paused) {
      fadeOutAndStop(fade);
    }
    startedAtRef.current = null;
    pausedElapsedRef.current = 0;
    sessionSecondsRef.current = null;
    setActiveTrackId(null);
    setElapsedSeconds(0);
    setIsLoading(false);
    setIsPaused(false);
    setErrorMessage(null);
  }, [clearTimers, fadeOutAndStop]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearTimers();
      const el = audioRef.current;
      if (el) {
        el.pause();
        el.src = '';
        audioRef.current = null;
      }
    };
  }, [clearTimers]);

  const playTrack = useCallback(async (track: Track) => {
    // Toggle-off if same track — Resume is via the dedicated Pause/Resume button
    if (activeTrackId === track.id) {
      stopCurrent(2);
      return;
    }

    clearTimers();
    setErrorMessage(null);
    const el = getAudio();

    // Cancel any in-progress fade so the new track starts at full volume
    el.volume = BASE_VOLUME;

    if (el.src !== track.src) {
      setIsLoading(true);
      // Clear loading as soon as the browser says it can play through
      const handleCanPlay = () => {
        setIsLoading(false);
        if (slowLoadTimerRef.current != null) {
          window.clearTimeout(slowLoadTimerRef.current);
          slowLoadTimerRef.current = null;
        }
      };
      canplayHandlerRef.current = handleCanPlay;
      el.addEventListener('canplay', handleCanPlay, { once: true });
      // Warn user if the network is slow
      slowLoadTimerRef.current = window.setTimeout(() => {
        setErrorMessage('Still loading… your connection looks slow.');
      }, 8000);
      el.src = track.src;
      el.currentTime = 0;
    } else {
      el.currentTime = 0;
    }

    try {
      const playPromise = el.play();
      if (playPromise) await playPromise;
    } catch (err) {
      console.error('[RecordPlayer] play failed', err);
      clearTimers();
      setIsLoading(false);
      setActiveTrackId(null);
      setErrorMessage("Couldn't play this track. Check your connection or try another.");
      return;
    }

    setIsLoading(false);
    startedAtRef.current = performance.now();
    pausedElapsedRef.current = 0;
    sessionSecondsRef.current = selectedSeconds;
    setActiveTrackId(track.id);
    setElapsedSeconds(0);
    setIsPaused(false);

    // Tick the UI
    tickTimerRef.current = window.setInterval(() => {
      if (startedAtRef.current == null) return;
      setElapsedSeconds(pausedElapsedRef.current + (performance.now() - startedAtRef.current) / 1000);
    }, 250);

    // Schedule auto-stop using the session length captured at play start
    if (sessionSecondsRef.current != null) {
      scheduleAutoStop(sessionSecondsRef.current * 1000);
    }
  }, [activeTrackId, selectedSeconds, stopCurrent, clearTimers, getAudio, scheduleAutoStop]);

  const pauseResume = useCallback(() => {
    const el = audioRef.current;
    if (!el || !activeTrackId) return;
    if (isPaused) {
      // Resume
      const playPromise = el.play();
      if (playPromise) {
        playPromise.catch(err => {
          console.error('[RecordPlayer] resume failed', err);
          setErrorMessage("Couldn't resume. Try again.");
        });
      }
      startedAtRef.current = performance.now();
      tickTimerRef.current = window.setInterval(() => {
        if (startedAtRef.current == null) return;
        setElapsedSeconds(pausedElapsedRef.current + (performance.now() - startedAtRef.current) / 1000);
      }, 250);
      if (sessionSecondsRef.current != null) {
        const remainingMs = (sessionSecondsRef.current - pausedElapsedRef.current) * 1000;
        scheduleAutoStop(remainingMs);
      }
      setIsPaused(false);
    } else {
      // Pause
      el.pause();
      if (startedAtRef.current != null) {
        pausedElapsedRef.current += (performance.now() - startedAtRef.current) / 1000;
        startedAtRef.current = null;
      }
      if (tickTimerRef.current != null) {
        window.clearInterval(tickTimerRef.current);
        tickTimerRef.current = null;
      }
      if (autoStopTimerRef.current != null) {
        window.clearTimeout(autoStopTimerRef.current);
        autoStopTimerRef.current = null;
      }
      setIsPaused(true);
    }
  }, [activeTrackId, isPaused, scheduleAutoStop]);

  const progress = (() => {
    if (totalSeconds == null || !isPlaying) return 0;
    return Math.min(1, elapsedSeconds / totalSeconds);
  })();

  const countdownLabel = (() => {
    if (!isPlaying) return '';
    if (remainingSeconds == null) return formatTime(elapsedSeconds);
    return formatTime(remainingSeconds);
  })();

  return (
    <div className="flex flex-col items-center gap-6 p-8 max-w-md mx-auto">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-[var(--color-text)] mb-1">Meditation Sound</h2>
        <p className="text-sm text-[var(--color-text-muted)]">
          Science-backed tones & binaural beats
        </p>
      </div>

      {/* Turntable + progress ring */}
      <div className="relative w-56 h-56 flex items-center justify-center">
        <svg className="absolute inset-0 -rotate-90" width="100%" height="100%" viewBox="0 0 224 224">
          <circle
            cx="112" cy="112" r="108"
            fill="none"
            stroke="var(--color-outline-soft)"
            strokeWidth="3"
            opacity="0.4"
          />
          {isPlaying && totalSeconds != null && (
            <motion.circle
              cx="112" cy="112" r="108"
              fill="none"
              stroke={activeTrack?.color || 'var(--color-pink)'}
              strokeWidth="4"
              strokeLinecap="round"
              pathLength="1"
              strokeDasharray="1"
              initial={{ strokeDashoffset: 1 }}
              animate={{ strokeDashoffset: 1 - progress }}
              transition={{ ease: 'linear', duration: 0.25 }}
            />
          )}
        </svg>

        <div
          className="absolute w-44 h-44 rounded-full border-2 border-[var(--color-outline-soft)]"
          style={{ background: 'var(--color-warm-white)' }}
        />

        <motion.div
          className="w-36 h-36 rounded-full relative"
          animate={isPlaying && !isPaused ? { rotate: 360 } : { rotate: 0 }}
          transition={isPlaying && !isPaused ? { repeat: Infinity, duration: 3, ease: 'linear' } : { duration: 0.5 }}
          style={{
            background: 'radial-gradient(circle, var(--color-outline-soft) 8%, #4a4040 10%, #5a5050 30%, #4a4040 31%, #5a5050 50%, #4a4040 51%, #5a5050 70%, #4a4040 71%, #5a5050 90%, #4a4040 100%)',
            border: '3px solid var(--color-outline)',
          }}
        >
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center border-2 border-[var(--color-outline)]"
            style={{ background: activeTrack?.color || 'var(--color-pink)' }}
          >
            <div className="w-2 h-2 rounded-full bg-[var(--color-outline)]" />
          </div>
        </motion.div>

        <motion.div
          className="absolute top-3 right-6 origin-top-right"
          animate={{ rotate: isPlaying && !isPaused ? 25 : 0 }}
          transition={{ type: 'spring', damping: 20, stiffness: 100 }}
        >
          <svg width="60" height="80" viewBox="0 0 60 80" fill="none">
            <circle cx="50" cy="8" r="6" fill="var(--color-outline-soft)" stroke="var(--color-outline)" strokeWidth="1.5" />
            <line x1="50" y1="14" x2="15" y2="70" stroke="var(--color-outline-soft)" strokeWidth="3" strokeLinecap="round" />
            <circle cx="15" cy="70" r="3" fill="var(--color-outline)" />
          </svg>
        </motion.div>
      </div>

      {/* Countdown readout */}
      <div className="h-14 flex flex-col items-center justify-center">
        {isLoading ? (
          <div className="text-sm text-[var(--color-text-muted)]">Loading audio…</div>
        ) : isPlaying ? (
          <>
            <div className="text-3xl font-bold text-[var(--color-text)] tabular-nums tracking-wider">
              {countdownLabel}
            </div>
            <div className="text-xs text-[var(--color-text-muted)]">
              {isPaused ? 'paused' : remainingSeconds == null ? 'elapsed' : 'remaining'}
              {activeTrack && ` · ${activeTrack.hz}`}
            </div>
          </>
        ) : (
          <div className="text-sm text-[var(--color-text-muted)]">
            Pick a duration, then choose a sound
          </div>
        )}
      </div>

      {/* Error banner */}
      {errorMessage && (
        <div
          role="alert"
          className="w-full text-center text-xs font-semibold px-3 py-2 rounded-lg border-2"
          style={{
            background: 'var(--color-peach-light)',
            borderColor: 'var(--color-peach)',
            color: 'var(--color-text)',
          }}
        >
          {errorMessage}
        </div>
      )}

      {/* Duration picker */}
      <div className="w-full">
        <div className="text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wide mb-2">
          Session length
        </div>
        <div className="flex flex-wrap gap-2">
          {DURATION_PRESETS.map((preset) => {
            const isSelected = selectedSeconds === preset.seconds;
            return (
              <button
                key={preset.label}
                onClick={() => setSelectedSeconds(preset.seconds)}
                disabled={isPlaying}
                className="px-3 py-1.5 rounded-full border-2 text-sm font-semibold transition-colors cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
                style={{
                  background: isSelected ? 'var(--color-pink-light)' : 'var(--color-warm-white)',
                  borderColor: isSelected ? 'var(--color-pink)' : 'var(--color-outline-soft)',
                  color: 'var(--color-text)',
                }}
              >
                {preset.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Track list */}
      <div className="w-full flex flex-col gap-2.5">
        <div className="text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wide">
          Sounds
        </div>
        {TRACKS.map((track, i) => {
          const isActive = activeTrackId === track.id;
          return (
            <motion.button
              key={track.id}
              onClick={() => playTrack(track)}
              disabled={isLoading && !isActive}
              className="flex items-center gap-3 p-3 rounded-2xl border-2 transition-colors cursor-pointer text-left disabled:opacity-60 disabled:cursor-wait"
              style={{
                backgroundColor: isActive ? track.colorLight : 'var(--color-warm-white)',
                borderColor: isActive ? track.color : 'var(--color-outline-soft)',
              }}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.06 }}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
            >
              <div
                className="w-16 h-16 rounded-xl flex flex-col items-center justify-center shrink-0 border-2"
                style={{
                  background: `linear-gradient(135deg, ${track.color}, ${track.colorLight})`,
                  borderColor: 'var(--color-outline-soft)',
                }}
              >
                <div className="text-[11px] font-bold text-[var(--color-text)] leading-none">
                  {track.hz}
                </div>
                <div className="mt-1">
                  {isActive ? (
                    <svg width="14" height="14" viewBox="0 0 20 20" fill="var(--color-text)">
                      <rect x="4" y="3" width="4" height="14" rx="1" />
                      <rect x="12" y="3" width="4" height="14" rx="1" />
                    </svg>
                  ) : (
                    <svg width="14" height="14" viewBox="0 0 20 20" fill="var(--color-text)">
                      <path d="M6 3L17 10L6 17V3Z" />
                    </svg>
                  )}
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="font-bold text-sm text-[var(--color-text)]">{track.name}</span>
                  {track.requiresHeadphones && (
                    <span
                      className="text-[10px] px-1.5 py-0.5 rounded-md font-semibold"
                      style={{ background: 'var(--color-cream)', color: 'var(--color-text-muted)' }}
                      title="Binaural beats require stereo headphones"
                    >
                      headphones
                    </span>
                  )}
                </div>
                <div className="text-[11px] text-[var(--color-text-muted)] mt-0.5">{track.hzDetail}</div>
                <div className="text-xs text-[var(--color-text-muted)] mt-1 leading-snug">
                  {track.description}
                </div>
              </div>

              {isActive && (
                <div className="flex items-end gap-0.5 h-4 shrink-0">
                  {[1, 2, 3].map(bar => (
                    <motion.div
                      key={bar}
                      className="w-1 rounded-full"
                      style={{ background: track.color }}
                      animate={{ height: ['4px', '16px', '4px'] }}
                      transition={{
                        repeat: Infinity,
                        duration: 0.8 + bar * 0.2,
                        ease: 'easeInOut',
                      }}
                    />
                  ))}
                </div>
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Transport controls */}
      {isPlaying && (
        <motion.div
          className="flex items-center gap-3"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <motion.button
            onClick={pauseResume}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-[var(--color-warm-white)] text-[var(--color-text)] font-semibold border-2 border-[var(--color-outline)] shadow-[var(--shadow-soft)] cursor-pointer"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {isPaused ? (
              <>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M4 2L14 8L4 14V2Z" />
                </svg>
                Resume
              </>
            ) : (
              <>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                  <rect x="3" y="2" width="4" height="12" rx="1" />
                  <rect x="9" y="2" width="4" height="12" rx="1" />
                </svg>
                Pause
              </>
            )}
          </motion.button>
          <motion.button
            onClick={() => stopCurrent(2)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-[var(--color-peach)] text-[var(--color-text)] font-semibold border-2 border-[var(--color-outline)] shadow-[var(--shadow-soft)] cursor-pointer"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <rect x="2" y="2" width="12" height="12" rx="2" />
            </svg>
            Stop
          </motion.button>
        </motion.div>
      )}

      {/* Footer note */}
      <p className="text-[10px] text-[var(--color-text-muted)] text-center max-w-sm leading-snug">
        Audio streamed from the Internet Archive. Binaural beats require stereo headphones so each ear
        receives a different frequency. Effects vary by individual.
      </p>
    </div>
  );
}
