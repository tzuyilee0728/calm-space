'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { audioEngine } from '@/lib/audio/AudioEngine';

const BURN_DURATION = 4500; // ms

interface EmberProps {
  x: number;       // 0-100 percentage across paper width
  burnY: number;   // 0-100 percentage from top where burn edge is
  seed: number;    // 0-1 for deterministic randomness
  paperW: number;
  paperH: number;
}

function Ember({ x, burnY, seed, paperW, paperH }: EmberProps) {
  const [params] = useState(() => ({
    size: 2 + seed * 5,
    dx: (seed - 0.5) * 60,
    dy: -(40 + ((seed * 7.3) % 1) * 60),
    duration: 0.8 + ((seed * 3.1) % 1) * 1.2,
    isOrange: seed > 0.4,
  }));

  const left = (x / 100) * paperW;
  const top = (burnY / 100) * paperH;

  return (
    <motion.div
      className="absolute rounded-full pointer-events-none"
      style={{
        width: params.size,
        height: params.size,
        backgroundColor: params.isOrange ? '#ff8c00' : '#ff4500',
        left,
        top,
        boxShadow: `0 0 ${params.size + 2}px ${params.isOrange ? '#ff8c00' : '#ff4500'}`,
      }}
      initial={{ opacity: 1, scale: 1 }}
      animate={{ opacity: 0, scale: 0.2, x: params.dx, y: params.dy }}
      transition={{ duration: params.duration, ease: 'easeOut' }}
    />
  );
}

function generateBurnClip(burnY: number, progress: number): string {
  if (progress <= 0) return 'inset(0 0 0 0)';
  // Wavy bottom edge using multi-frequency sine for natural look
  const pts: string[] = ['0% 0%', '100% 0%'];
  pts.push(`100% ${burnY}%`);
  for (let i = 20; i >= 0; i--) {
    const x = (i / 20) * 100;
    const wave =
      Math.sin(i * 0.9 + progress * 0.06) * 2.5 +
      Math.sin(i * 2.3 + progress * 0.1) * 1.5 +
      Math.sin(i * 0.4 + progress * 0.03) * 1.2;
    pts.push(`${x}% ${Math.max(0, burnY + wave)}%`);
  }
  return `polygon(${pts.join(', ')})`;
}

export default function BurnEffect({
  text,
  tag,
  soundOn,
  onComplete,
}: {
  text: string;
  tag: 'real' | 'perceived' | null;
  soundOn: boolean;
  onComplete: () => void;
}) {
  const [progress, setProgress] = useState(0);   // 0-100
  const [embers, setEmbers] = useState<{ id: number; x: number; seed: number }[]>([]);
  const startRef = useRef<number | null>(null);
  const completedRef = useRef(false);
  const progressRef = useRef(0);

  const paperW = 300;
  const paperH = 200;

  // Play crackling fire sound
  useEffect(() => {
    if (!soundOn) return;
    const crackle = audioEngine.playFilteredNoise({
      filterType: 'bandpass',
      frequency: 600,
      Q: 1.5,
      gain: 0.12,
      duration: 6,
      fadeIn: 0.5,
    });
    // Higher crackle layer
    const crackle2 = audioEngine.playFilteredNoise({
      filterType: 'bandpass',
      frequency: 2200,
      Q: 2,
      gain: 0.06,
      duration: 5,
      fadeIn: 1,
    });
    return () => {
      crackle.stop(0.5);
      crackle2.stop(0.5);
    };
  }, [soundOn]);

  // Animate burn progress with requestAnimationFrame
  useEffect(() => {
    const frame = (timestamp: number) => {
      if (startRef.current === null) startRef.current = timestamp;
      const elapsed = timestamp - startRef.current;
      // Non-linear: slow start (fire catching), accelerates
      const raw = Math.min(1, elapsed / BURN_DURATION);
      const eased = raw < 0.2
        ? raw * raw * 25       // slow quadratic start
        : 0.2 * 0.2 * 25 + (raw - 0.2) * (1 - 0.2 * 0.2 * 25) / 0.8;  // linear rest
      const p = Math.min(100, eased * 100);
      setProgress(p);
      progressRef.current = p;

      if (p >= 100 && !completedRef.current) {
        completedRef.current = true;
        onComplete();
        return;
      }
      if (p < 100) requestAnimationFrame(frame);
    };
    const id = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(id);
  }, [onComplete]);

  // Spawn embers periodically
  useEffect(() => {
    const id = setInterval(() => {
      if (progressRef.current >= 97) return;
      const newEmber = {
        id: Date.now() + Math.random(),
        x: Math.random() * 100,
        seed: Math.random(),
      };
      setEmbers(prev => [...prev.slice(-14), newEmber]);
    }, 180);
    return () => clearInterval(id);
  }, []);

  // Burn edge Y (100% = bottom of paper, 0% = top)
  // Burn progresses from bottom to top, so burnY goes from 100 → 0
  const burnY = 100 - progress;
  const clipPath = generateBurnClip(burnY, progress);

  // Browning gradient: cream → amber → dark brown at the burn edge
  const brownStart = Math.max(0, burnY - 20);
  const bgGradient = `linear-gradient(to bottom, var(--color-cream) ${brownStart}%, #d4b088 ${Math.max(0, burnY - 8)}%, #a07040 ${Math.max(0, burnY - 2)}%, #6b4020 ${burnY}%)`;

  // Curl increases as more paper burns
  const curlDeg = progress * 0.12;
  const curlScale = 1 - progress * 0.001;

  return (
    <div
      className="relative flex items-center justify-center"
      style={{ width: paperW, height: paperH + 40 }}
    >
      {/* Paper with burn effect */}
      <div
        className="absolute overflow-hidden"
        style={{
          width: paperW,
          height: paperH,
          top: 0,
          clipPath,
          background: bgGradient,
          borderRadius: progress < 5 ? 'var(--radius-lg)' : '4px 4px 0 0',
          border: progress < 5 ? '2px solid var(--color-outline-soft)' : 'none',
          transform: `perspective(800px) rotateX(${curlDeg}deg) scale(${curlScale})`,
          transformOrigin: 'top center',
          transition: 'border 0.3s',
        }}
      >
        <div className="p-4">
          <p className="text-sm text-[var(--color-text)] italic leading-relaxed">{text}</p>
          {tag && (
            <p className="text-[10px] font-bold text-[var(--color-text-muted)] mt-3">
              {tag === 'perceived' ? 'Just my brain worrying' : 'Real — but I can let go'}
            </p>
          )}
        </div>
      </div>

      {/* Glow line at burn edge */}
      {progress > 2 && progress < 97 && (
        <div
          className="absolute left-0 pointer-events-none"
          style={{
            top: `${(burnY / 100) * paperH - 3}px`,
            width: paperW,
            height: 14,
            background: 'linear-gradient(to bottom, rgba(255,130,0,0.9) 0%, rgba(255,60,0,0.7) 40%, rgba(200,30,0,0.3) 70%, transparent 100%)',
            filter: 'blur(3px)',
          }}
        />
      )}

      {/* Char line — darker edge right at the burn */}
      {progress > 3 && progress < 97 && (
        <div
          className="absolute left-0 pointer-events-none"
          style={{
            top: `${(burnY / 100) * paperH - 1}px`,
            width: paperW,
            height: 3,
            backgroundColor: '#2a1500',
            opacity: 0.6,
            filter: 'blur(1px)',
          }}
        />
      )}

      {/* Embers */}
      {embers.map(({ id, x, seed }) => (
        <Ember
          key={id}
          x={x}
          burnY={burnY}
          seed={seed}
          paperW={paperW}
          paperH={paperH}
        />
      ))}

      {/* Fire glow at bottom */}
      <motion.div
        className="absolute pointer-events-none"
        style={{
          bottom: 0,
          left: '50%',
          transform: 'translateX(-50%)',
          width: 180,
          height: 100,
          background: 'radial-gradient(ellipse at center bottom, rgba(255,140,0,0.5) 0%, rgba(255,80,0,0.25) 40%, transparent 70%)',
          filter: 'blur(10px)',
        }}
        animate={{ opacity: [0.4, 0.8, 0.5, 0.7, 0.4], scale: [0.95, 1.05, 0.98, 1.03, 0.95] }}
        transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
      />
    </div>
  );
}
