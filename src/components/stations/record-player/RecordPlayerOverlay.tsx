'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'motion/react';
import { useAudioEngine } from '@/hooks/useAudioEngine';
import { audioEngine } from '@/lib/audio/AudioEngine';

interface Track {
  id: string;
  name: string;
  description: string;
  color: string;
  colorLight: string;
  duration: string;
}

const tracks: Track[] = [
  {
    id: 'morning-mist',
    name: 'Morning Mist',
    description: 'Gentle binaural tones for focus',
    color: 'var(--color-blue)',
    colorLight: 'var(--color-blue-light)',
    duration: '~',
  },
  {
    id: 'gentle-rain',
    name: 'Gentle Rain',
    description: 'Soft rain sounds for relaxation',
    color: 'var(--color-mint)',
    colorLight: 'var(--color-mint-light)',
    duration: '~',
  },
  {
    id: 'deep-calm',
    name: 'Deep Calm',
    description: 'Low resonant drone for deep rest',
    color: 'var(--color-lavender)',
    colorLight: 'var(--color-lavender-light)',
    duration: '~',
  },
];

type StopFn = { stop: (fadeOut?: number) => void };

export default function RecordPlayerOverlay() {
  const { initialize } = useAudioEngine();
  const [activeTrack, setActiveTrack] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const activeSoundsRef = useRef<StopFn[]>([]);

  useEffect(() => {
    initialize();
  }, [initialize]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      activeSoundsRef.current.forEach(s => s.stop(0.5));
      activeSoundsRef.current = [];
    };
  }, []);

  const stopCurrentTrack = useCallback(() => {
    activeSoundsRef.current.forEach(s => s.stop(2));
    activeSoundsRef.current = [];
    setIsPlaying(false);
  }, []);

  const playTrack = useCallback((trackId: string) => {
    // Stop current track first
    stopCurrentTrack();

    if (trackId === activeTrack && isPlaying) {
      setActiveTrack(null);
      return;
    }

    setActiveTrack(trackId);
    setIsPlaying(true);

    const sounds: StopFn[] = [];

    switch (trackId) {
      case 'morning-mist': {
        // Binaural beat: two slightly detuned sine oscillators
        sounds.push(audioEngine.createDrone({ frequency: 220, type: 'sine', gain: 0.12, fadeIn: 3 }));
        sounds.push(audioEngine.createDrone({ frequency: 223, type: 'sine', gain: 0.12, fadeIn: 3 }));
        // Filtered brown noise bed
        sounds.push(audioEngine.playFilteredNoise({ filterType: 'lowpass', frequency: 300, Q: 0.5, gain: 0.04, fadeIn: 4, duration: 300 }));
        break;
      }
      case 'gentle-rain': {
        // Rain texture: bandpass filtered noise
        sounds.push(audioEngine.playFilteredNoise({ filterType: 'bandpass', frequency: 500, Q: 0.8, gain: 0.08, fadeIn: 3, duration: 300 }));
        sounds.push(audioEngine.playFilteredNoise({ filterType: 'highpass', frequency: 2000, Q: 0.3, gain: 0.03, fadeIn: 5, duration: 300 }));
        break;
      }
      case 'deep-calm': {
        // Low drone with harmonics
        sounds.push(audioEngine.createDrone({ frequency: 110, type: 'sine', gain: 0.15, fadeIn: 4 }));
        sounds.push(audioEngine.createDrone({ frequency: 220, type: 'sine', gain: 0.08, fadeIn: 5 }));
        sounds.push(audioEngine.createDrone({ frequency: 330, type: 'sine', gain: 0.04, fadeIn: 6 }));
        break;
      }
    }

    activeSoundsRef.current = sounds;
  }, [activeTrack, isPlaying, stopCurrentTrack]);

  const currentTrack = tracks.find(t => t.id === activeTrack);

  return (
    <div className="flex flex-col items-center gap-6 p-8 max-w-md mx-auto">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-[var(--color-text)] mb-1">Meditation Music</h2>
        <p className="text-sm text-[var(--color-text-muted)]">Ambient sounds for your mind</p>
      </div>

      {/* Turntable illustration */}
      <div className="relative w-48 h-48 flex items-center justify-center">
        {/* Platter base */}
        <div
          className="absolute w-44 h-44 rounded-full border-2 border-[var(--color-outline-soft)]"
          style={{ background: 'var(--color-warm-white)' }}
        />

        {/* Record */}
        <motion.div
          className="w-36 h-36 rounded-full relative"
          animate={isPlaying ? { rotate: 360 } : { rotate: 0 }}
          transition={isPlaying ? { repeat: Infinity, duration: 3, ease: 'linear' } : { duration: 0.5 }}
          style={{
            background: 'radial-gradient(circle, var(--color-outline-soft) 8%, #4a4040 10%, #5a5050 30%, #4a4040 31%, #5a5050 50%, #4a4040 51%, #5a5050 70%, #4a4040 71%, #5a5050 90%, #4a4040 100%)',
            border: '3px solid var(--color-outline)',
          }}
        >
          {/* Center label */}
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center border-2 border-[var(--color-outline)]"
            style={{ background: currentTrack?.color || 'var(--color-pink)' }}
          >
            <div className="w-2 h-2 rounded-full bg-[var(--color-outline)]" />
          </div>
        </motion.div>

        {/* Tonearm */}
        <motion.div
          className="absolute top-2 right-4 origin-top-right"
          animate={{ rotate: isPlaying ? 25 : 0 }}
          transition={{ type: 'spring', damping: 20, stiffness: 100 }}
        >
          <svg width="60" height="80" viewBox="0 0 60 80" fill="none">
            <circle cx="50" cy="8" r="6" fill="var(--color-outline-soft)" stroke="var(--color-outline)" strokeWidth="1.5" />
            <line x1="50" y1="14" x2="15" y2="70" stroke="var(--color-outline-soft)" strokeWidth="3" strokeLinecap="round" />
            <circle cx="15" cy="70" r="3" fill="var(--color-outline)" />
          </svg>
        </motion.div>
      </div>

      {/* Track list */}
      <div className="w-full flex flex-col gap-3">
        {tracks.map((track, i) => {
          const isActive = activeTrack === track.id && isPlaying;
          return (
            <motion.button
              key={track.id}
              onClick={() => playTrack(track.id)}
              className="flex items-center gap-4 p-4 rounded-2xl border-2 transition-colors cursor-pointer text-left"
              style={{
                backgroundColor: isActive ? track.colorLight : 'var(--color-warm-white)',
                borderColor: isActive ? track.color : 'var(--color-outline-soft)',
              }}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {/* Album art placeholder */}
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: `linear-gradient(135deg, ${track.color}, ${track.colorLight})` }}
              >
                {isActive ? (
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="var(--color-text)">
                    <rect x="4" y="3" width="4" height="14" rx="1" />
                    <rect x="12" y="3" width="4" height="14" rx="1" />
                  </svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="var(--color-text)">
                    <path d="M6 3L17 10L6 17V3Z" />
                  </svg>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="font-bold text-sm text-[var(--color-text)]">{track.name}</div>
                <div className="text-xs text-[var(--color-text-muted)]">{track.description}</div>
              </div>

              {/* Playing indicator */}
              {isActive && (
                <div className="flex items-end gap-0.5 h-4">
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

      {/* Stop button (only when playing) */}
      {isPlaying && (
        <motion.button
          onClick={stopCurrentTrack}
          className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-[var(--color-peach)] text-[var(--color-text)] font-semibold border-2 border-[var(--color-outline)] shadow-[var(--shadow-soft)] cursor-pointer"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <rect x="2" y="2" width="12" height="12" rx="2" />
          </svg>
          Stop
        </motion.button>
      )}
    </div>
  );
}
