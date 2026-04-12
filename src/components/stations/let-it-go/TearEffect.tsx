'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { audioEngine } from '@/lib/audio/AudioEngine';

const COLS = 12;
const ROWS = 8;
const TOTAL = COLS * ROWS;
const PAPER_W = 300;
const PAPER_H = 190;
const PIECE_W = PAPER_W / COLS;
const PIECE_H = PAPER_H / ROWS;
const COMPLETE_THRESHOLD = 0.65;

interface PieceAnim {
  dx: number;
  dy: number;
  rotate: number;
  duration: number;
}

export default function TearEffect({
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
  const containerRef = useRef<HTMLDivElement>(null);
  const lastPosRef = useRef<{ x: number; y: number } | null>(null);
  const cutSetRef = useRef<Set<string>>(new Set());
  const isPointerDownRef = useRef(false);
  const soundOnRef = useRef(soundOn);
  const completedRef = useRef(false);
  const cutSoundCounterRef = useRef(0);

  const [cutPieces, setCutPieces] = useState<Map<string, PieceAnim>>(new Map());
  const cutCount = cutPieces.size;

  useEffect(() => {
    soundOnRef.current = soundOn;
  });

  // Check for completion
  useEffect(() => {
    if (cutCount >= TOTAL * COMPLETE_THRESHOLD && !completedRef.current) {
      completedRef.current = true;
      setTimeout(onComplete, 600);
    }
  }, [cutCount, onComplete]);

  const cutPiece = useCallback((col: number, row: number) => {
    const key = `${col},${row}`;
    if (cutSetRef.current.has(key)) return;
    cutSetRef.current.add(key);

    // Random animation for this piece (called in event handler — lint-safe)
    const anim: PieceAnim = {
      dx: (Math.random() - 0.5) * 140,
      dy: 30 + Math.random() * 100,
      rotate: (Math.random() - 0.5) * 360,
      duration: 0.4 + Math.random() * 0.4,
    };

    setCutPieces(prev => {
      const next = new Map(prev);
      next.set(key, anim);
      return next;
    });

    // Paper rip sound every 3 cuts
    cutSoundCounterRef.current += 1;
    if (cutSoundCounterRef.current % 3 === 0 && soundOnRef.current) {
      audioEngine.playNoiseBurst({
        duration: 0.04,
        filterFreq: 3000 + Math.random() * 2000,
        filterQ: 1,
        gain: 0.2,
        attack: 0.001,
        decay: 0.015,
      });
    }
  }, []);

  const cutAtPosition = useCallback((x: number, y: number) => {
    const col = Math.floor(x / PIECE_W);
    const row = Math.floor(y / PIECE_H);
    if (col >= 0 && col < COLS && row >= 0 && row < ROWS) {
      cutPiece(col, row);
      if (row + 1 < ROWS) cutPiece(col, row + 1);
      if (row - 1 >= 0) cutPiece(col, row - 1);
    }
  }, [cutPiece]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!isPointerDownRef.current || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Interpolate from last position to current to avoid gaps
    if (lastPosRef.current) {
      const lx = lastPosRef.current.x;
      const ly = lastPosRef.current.y;
      const dist = Math.sqrt((x - lx) ** 2 + (y - ly) ** 2);
      const step = Math.min(PIECE_W, PIECE_H) / 2;
      const steps = Math.max(1, Math.ceil(dist / step));

      for (let i = 0; i <= steps; i++) {
        const t = i / steps;
        const px = lx + (x - lx) * t;
        const py = ly + (y - ly) * t;
        cutAtPosition(px, py);
      }
    } else {
      // First move after pointerDown — cut immediately at this position
      cutAtPosition(x, y);
    }

    lastPosRef.current = { x, y };
  }, [cutAtPosition]);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    isPointerDownRef.current = true;
    lastPosRef.current = null;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);

    // Cut immediately at click position
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      cutAtPosition(x, y);
    }
  }, [cutAtPosition]);

  const handlePointerUp = useCallback(() => {
    isPointerDownRef.current = false;
    lastPosRef.current = null;
  }, []);

  // Text fades as pieces are removed
  const textOpacity = Math.max(0, 1 - cutCount / (TOTAL * 0.4));

  return (
    <div className="flex flex-col items-center gap-3">
      <p className="text-xs text-[var(--color-text-muted)]">
        Click and drag across the note to tear it apart
      </p>

      <div
        ref={containerRef}
        className="relative"
        style={{
          width: PAPER_W,
          height: PAPER_H,
          cursor: 'crosshair',
          touchAction: 'none',
          overflow: 'visible',
          boxShadow: 'var(--shadow-soft)',
        }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        {/* Grid of paper pieces */}
        {Array.from({ length: ROWS }, (_, row) =>
          Array.from({ length: COLS }, (_, col) => {
            const key = `${col},${row}`;
            const anim = cutPieces.get(key);
            const isCut = anim !== undefined;

            // Corner radius for outer pieces
            const isTopLeft = col === 0 && row === 0;
            const isTopRight = col === COLS - 1 && row === 0;
            const isBotLeft = col === 0 && row === ROWS - 1;
            const isBotRight = col === COLS - 1 && row === ROWS - 1;

            return (
              <motion.div
                key={key}
                className="absolute"
                initial={false}
                style={{
                  left: col * PIECE_W,
                  top: row * PIECE_H,
                  width: PIECE_W,
                  height: PIECE_H,
                  backgroundColor: 'var(--color-cream)',
                  borderTop: row === 0 ? '2px solid var(--color-outline-soft)' : '0.5px solid rgba(176,166,166,0.15)',
                  borderLeft: col === 0 ? '2px solid var(--color-outline-soft)' : '0.5px solid rgba(176,166,166,0.15)',
                  borderRight: col === COLS - 1 ? '2px solid var(--color-outline-soft)' : 'none',
                  borderBottom: row === ROWS - 1 ? '2px solid var(--color-outline-soft)' : 'none',
                  borderTopLeftRadius: isTopLeft ? 16 : 0,
                  borderTopRightRadius: isTopRight ? 16 : 0,
                  borderBottomLeftRadius: isBotLeft ? 16 : 0,
                  borderBottomRightRadius: isBotRight ? 16 : 0,
                }}
                animate={
                  isCut
                    ? {
                        x: anim!.dx,
                        y: anim!.dy,
                        rotate: anim!.rotate,
                        opacity: 0,
                        scale: 0.5,
                      }
                    : { x: 0, y: 0, rotate: 0, opacity: 1, scale: 1 }
                }
                transition={
                  isCut
                    ? { duration: anim!.duration, ease: 'easeOut' }
                    : { duration: 0 }
                }
              />
            );
          }),
        )}

        {/* Text overlay */}
        <div
          className="absolute inset-0 pointer-events-none p-4"
          style={{ opacity: textOpacity, transition: 'opacity 0.3s' }}
        >
          <p className="text-[11px] font-bold text-[var(--color-text-muted)] mb-1">
            My fear:
          </p>
          <p className="text-sm text-[var(--color-text)] italic leading-relaxed">{text}</p>
          {tag && (
            <p className="text-[10px] font-bold text-[var(--color-text-muted)] mt-3">
              {tag === 'perceived' ? 'Just my brain worrying' : 'Real — but I can let go'}
            </p>
          )}
        </div>
      </div>

      {/* Progress hint */}
      <p className="text-[10px] text-[var(--color-text-muted)] tabular-nums">
        {Math.round((cutCount / TOTAL) * 100)}% torn
      </p>
    </div>
  );
}
