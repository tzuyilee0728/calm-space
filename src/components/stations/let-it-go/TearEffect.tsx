'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { audioEngine } from '@/lib/audio/AudioEngine';

const PAPER_W = 300;
const PAPER_H = 200;
const PAPER_AREA = PAPER_W * PAPER_H;
const FALL_AREA_THRESHOLD = 0.25; // pieces < 25% of original fall away
const COMPLETE_THRESHOLD = 0.65;  // auto-complete when 65% has fallen

// ---------- Geometry utilities (pure functions) ----------

interface Pt {
  x: number;
  y: number;
}

function sideOfLine(p: Pt, a: Pt, b: Pt): number {
  return (b.x - a.x) * (p.y - a.y) - (b.y - a.y) * (p.x - a.x);
}

function lineSegmentIntersect(a1: Pt, a2: Pt, b1: Pt, b2: Pt): Pt | null {
  const dx1 = a2.x - a1.x;
  const dy1 = a2.y - a1.y;
  const dx2 = b2.x - b1.x;
  const dy2 = b2.y - b1.y;
  const denom = dx1 * dy2 - dy1 * dx2;
  if (Math.abs(denom) < 1e-10) return null;
  const t = ((b1.x - a1.x) * dy2 - (b1.y - a1.y) * dx2) / denom;
  const u = ((b1.x - a1.x) * dy1 - (b1.y - a1.y) * dx1) / denom;
  if (t < 0 || t > 1 || u < 0 || u > 1) return null;
  return { x: a1.x + t * dx1, y: a1.y + t * dy1 };
}

function polygonArea(verts: Pt[]): number {
  let area = 0;
  for (let i = 0; i < verts.length; i++) {
    const j = (i + 1) % verts.length;
    area += verts[i].x * verts[j].y;
    area -= verts[j].x * verts[i].y;
  }
  return Math.abs(area) / 2;
}

function polygonCentroid(verts: Pt[]): Pt {
  let cx = 0;
  let cy = 0;
  for (const v of verts) {
    cx += v.x;
    cy += v.y;
  }
  return { x: cx / verts.length, y: cy / verts.length };
}

function splitPolygon(
  verts: Pt[],
  lineA: Pt,
  lineB: Pt,
): [Pt[], Pt[]] | null {
  const n = verts.length;
  const sides = verts.map(v => sideOfLine(v, lineA, lineB));

  // Check that the line actually crosses this polygon
  let hasPos = false;
  let hasNeg = false;
  for (const s of sides) {
    if (s > 1e-6) hasPos = true;
    if (s < -1e-6) hasNeg = true;
  }
  if (!hasPos || !hasNeg) return null;

  const left: Pt[] = [];
  const right: Pt[] = [];

  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    const si = sides[i];
    const sj = sides[j];
    const vi = verts[i];
    const vj = verts[j];

    if (si >= 0) left.push(vi);
    if (si <= 0) right.push(vi);

    // If edge crosses the line, add intersection to both
    if ((si > 1e-6 && sj < -1e-6) || (si < -1e-6 && sj > 1e-6)) {
      const ix = lineSegmentIntersect(vi, vj, lineA, lineB);
      if (ix) {
        left.push(ix);
        right.push(ix);
      }
    }
  }

  if (left.length < 3 || right.length < 3) return null;
  return [left, right];
}

// Extend a line segment to ensure it crosses the entire paper
function extendLine(a: Pt, b: Pt): [Pt, Pt] {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const len = Math.sqrt(dx * dx + dy * dy);
  if (len < 1) return [a, b];
  const scale = 500 / len; // extend well beyond paper bounds
  return [
    { x: a.x - dx * scale, y: a.y - dy * scale },
    { x: b.x + dx * scale, y: b.y + dy * scale },
  ];
}

function toClipPath(verts: Pt[]): string {
  const pts = verts.map(v => `${v.x}px ${v.y}px`).join(', ');
  return `polygon(${pts})`;
}

// ---------- Types ----------

interface Piece {
  id: string;
  vertices: Pt[];
  area: number;
  status: 'intact' | 'falling';
  pushX: number;
  pushY: number;
  fallRotate: number;
  fallDelay: number;
}

let pieceIdCounter = 0;
function nextPieceId(): string {
  return `p${++pieceIdCounter}`;
}

// ---------- Component ----------

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
  const soundOnRef = useRef(soundOn);
  const completedRef = useRef(false);

  const [pieces, setPieces] = useState<Piece[]>(() => [{
    id: nextPieceId(),
    vertices: [
      { x: 0, y: 0 },
      { x: PAPER_W, y: 0 },
      { x: PAPER_W, y: PAPER_H },
      { x: 0, y: PAPER_H },
    ],
    area: PAPER_AREA,
    status: 'intact',
    pushX: 0,
    pushY: 0,
    fallRotate: 0,
    fallDelay: 0,
  }]);

  const [trail, setTrail] = useState<Pt[]>([]);
  const [isSlicing, setIsSlicing] = useState(false);

  useEffect(() => {
    soundOnRef.current = soundOn;
  });

  // Check for completion
  const fallenArea = pieces
    .filter(p => p.status === 'falling')
    .reduce((sum, p) => sum + p.area, 0);

  useEffect(() => {
    if (fallenArea >= PAPER_AREA * COMPLETE_THRESHOLD && !completedRef.current) {
      completedRef.current = true;
      setTimeout(onComplete, 800);
    }
  }, [fallenArea, onComplete]);

  const performCut = useCallback((startPt: Pt, endPt: Pt) => {
    const [extA, extB] = extendLine(startPt, endPt);

    // Cut line normal for push direction
    const dx = endPt.x - startPt.x;
    const dy = endPt.y - startPt.y;
    const len = Math.sqrt(dx * dx + dy * dy);
    if (len < 5) return; // swipe too short
    const nx = -dy / len;
    const ny = dx / len;

    let didCut = false;

    setPieces(prev => {
      const next: Piece[] = [];
      let fallIdx = 0;

      for (const piece of prev) {
        if (piece.status === 'falling') {
          next.push(piece);
          continue;
        }

        const result = splitPolygon(piece.vertices, extA, extB);
        if (!result) {
          next.push(piece);
          continue;
        }

        didCut = true;
        const [leftVerts, rightVerts] = result;
        const leftArea = polygonArea(leftVerts);
        const rightArea = polygonArea(rightVerts);
        const leftCenter = polygonCentroid(leftVerts);
        const rightCenter = polygonCentroid(rightVerts);

        // Push direction: which side of the cut line is each centroid on?
        const leftSide = sideOfLine(leftCenter, startPt, endPt);
        const pushMagnitude = 8 + Math.random() * 12;

        const makepiece = (verts: Pt[], area: number, center: Pt, side: number): Piece => {
          const dir = side >= 0 ? 1 : -1;
          const isFalling = area < PAPER_AREA * FALL_AREA_THRESHOLD;
          return {
            id: nextPieceId(),
            vertices: verts,
            area,
            status: isFalling ? 'falling' : 'intact',
            pushX: nx * dir * pushMagnitude,
            pushY: ny * dir * pushMagnitude,
            fallRotate: isFalling ? (Math.random() - 0.5) * 180 : 0,
            fallDelay: isFalling ? fallIdx++ * 0.05 : 0,
          };
        };

        next.push(
          makepiece(leftVerts, leftArea, leftCenter, leftSide),
          makepiece(rightVerts, rightArea, rightCenter, -leftSide),
        );
      }

      return next;
    });

    if (didCut && soundOnRef.current) {
      audioEngine.playNoiseBurst({
        duration: 0.06,
        filterFreq: 3000 + Math.random() * 2000,
        filterQ: 1,
        gain: 0.25,
        attack: 0.001,
        decay: 0.02,
      });
    }
  }, []);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    setIsSlicing(true);
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const pt = { x: e.clientX - rect.left, y: e.clientY - rect.top };
      setTrail([pt]);
    }
  }, []);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!isSlicing || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const pt = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    setTrail(prev => [...prev.slice(-20), pt]);
  }, [isSlicing]);

  const handlePointerUp = useCallback(() => {
    if (!isSlicing) return;
    setIsSlicing(false);

    // Use the trail start → end as the cut line
    setTrail(prev => {
      if (prev.length >= 2) {
        const start = prev[0];
        const end = prev[prev.length - 1];
        // Defer cut to next microtask so state is settled
        queueMicrotask(() => performCut(start, end));
      }
      return [];
    });
  }, [isSlicing, performCut]);

  // Visible trail points (last 15 for tail effect)
  const visibleTrail = trail.slice(-15);

  return (
    <div className="flex flex-col items-center gap-3">
      <p className="text-xs text-[var(--color-text-muted)]">
        Swipe across the note to slice it apart
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
        }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        {/* Paper pieces */}
        {pieces.map(piece => (
          <motion.div
            key={piece.id}
            className="absolute inset-0"
            initial={false}
            style={{
              width: PAPER_W,
              height: PAPER_H,
              clipPath: toClipPath(piece.vertices),
              backgroundColor: 'var(--color-cream)',
              boxShadow: 'var(--shadow-soft)',
            }}
            animate={
              piece.status === 'falling'
                ? {
                    x: piece.pushX * 2,
                    y: 250 + piece.pushY,
                    rotate: piece.fallRotate,
                    opacity: 0,
                    scale: 0.7,
                  }
                : {
                    x: piece.pushX,
                    y: piece.pushY,
                    rotate: 0,
                    opacity: 1,
                    scale: 1,
                  }
            }
            transition={
              piece.status === 'falling'
                ? { duration: 0.8, ease: 'easeIn', delay: piece.fallDelay }
                : { type: 'spring', damping: 20, stiffness: 200 }
            }
          >
            {/* Paper content — same in every piece, clip-path crops it */}
            <div className="p-4">
              <p className="text-[11px] font-bold text-[var(--color-text-muted)] mb-1">
                My fear:
              </p>
              <p className="text-sm text-[var(--color-text)] italic leading-relaxed">
                {text}
              </p>
              {tag && (
                <p className="text-[10px] font-bold text-[var(--color-text-muted)] mt-3">
                  {tag === 'perceived' ? 'Just my brain worrying' : 'Real — but I can let go'}
                </p>
              )}
            </div>
          </motion.div>
        ))}

        {/* Blade trail SVG */}
        {isSlicing && visibleTrail.length >= 2 && (
          <svg
            className="absolute inset-0 pointer-events-none"
            width={PAPER_W}
            height={PAPER_H}
            style={{ overflow: 'visible' }}
          >
            <defs>
              <linearGradient id="blade-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="var(--color-lavender-light)" stopOpacity="0" />
                <stop offset="60%" stopColor="var(--color-lavender)" stopOpacity="0.6" />
                <stop offset="100%" stopColor="white" stopOpacity="0.9" />
              </linearGradient>
            </defs>
            <polyline
              points={visibleTrail.map(p => `${p.x},${p.y}`).join(' ')}
              fill="none"
              stroke="url(#blade-grad)"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Bright dot at cursor */}
            <circle
              cx={visibleTrail[visibleTrail.length - 1].x}
              cy={visibleTrail[visibleTrail.length - 1].y}
              r="4"
              fill="white"
              opacity="0.8"
            />
          </svg>
        )}
      </div>

      {/* Progress */}
      <p className="text-[10px] text-[var(--color-text-muted)] tabular-nums">
        {Math.round((fallenArea / PAPER_AREA) * 100)}% destroyed
      </p>
    </div>
  );
}
