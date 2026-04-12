'use client';

import { SCENE_WIDTH, SCENE_HEIGHT } from '@/lib/isometric/constants';
import IsometricFloor from './IsometricFloor';
import IsometricStationLayer from './IsometricStationLayer';
import Sparkle from './Sparkle';

export default function IsometricRoom() {
  return (
    <div className="relative w-full min-h-screen flex flex-col items-center">
      {/* Background gradient */}
      <div
        className="fixed inset-0 -z-10"
        style={{
          background: 'linear-gradient(180deg, #e8dff0 0%, var(--color-cream) 35%, var(--color-peach-light) 100%)',
        }}
      />

      {/* Sky decorations */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-5">
        {/* Moon */}
        <div className="absolute top-6 right-8 md:top-10 md:right-16">
          <svg width="50" height="50" viewBox="0 0 50 50" fill="none">
            <circle cx="25" cy="25" r="20" fill="var(--color-yellow-light)" stroke="var(--color-outline-soft)" strokeWidth="1.5" />
            <circle cx="20" cy="20" r="3" fill="var(--color-yellow)" opacity="0.3" />
            <circle cx="30" cy="28" r="2" fill="var(--color-yellow)" opacity="0.3" />
          </svg>
        </div>

        {/* Clouds */}
        <svg className="absolute top-14 left-6 md:left-16 opacity-50" width="90" height="35" viewBox="0 0 90 35" fill="var(--color-warm-white)">
          <ellipse cx="28" cy="20" rx="22" ry="13" />
          <ellipse cx="50" cy="14" rx="24" ry="14" />
          <ellipse cx="68" cy="20" rx="20" ry="12" />
        </svg>
        <svg className="absolute top-6 left-[35%] opacity-35" width="70" height="28" viewBox="0 0 70 28" fill="var(--color-warm-white)">
          <ellipse cx="22" cy="16" rx="18" ry="11" />
          <ellipse cx="42" cy="11" rx="20" ry="13" />
          <ellipse cx="56" cy="16" rx="16" ry="10" />
        </svg>

        {/* Sparkles */}
        <Sparkle x={60} y={45} size={14} delay={0} />
        <Sparkle x={200} y={85} size={9} delay={0.7} />
        <Sparkle x={340} y={30} size={11} delay={1.4} />
        <Sparkle x={150} y={150} size={7} delay={2.1} />
      </div>

      {/* Content */}
      <div className="relative flex flex-col items-center pt-6 md:pt-10 pb-8">
        {/* Title */}
        <div className="text-center mb-4 md:mb-6">
          <h1 className="text-4xl md:text-5xl font-extrabold text-[var(--color-text)] tracking-tight">
            My Space
          </h1>
          <p className="text-sm md:text-base text-[var(--color-text-muted)] mt-2 font-medium">
            Your cozy space to recharge
          </p>
        </div>

        {/* Isometric scene */}
        <div
          data-isometric-scene
          className="relative origin-top"
          style={{
            width: SCENE_WIDTH,
            height: SCENE_HEIGHT,
          }}
        >
          <IsometricFloor />
          <IsometricStationLayer />
        </div>

        {/* Tulip decorations */}
        <div className="flex items-end gap-3 mt-4">
          {[
            'var(--color-pink)',
            'var(--color-lavender)',
            'var(--color-yellow)',
            'var(--color-mint)',
            'var(--color-blue)',
            'var(--color-pink)',
            'var(--color-lavender)',
          ].map((color, i) => (
            <svg
              key={i}
              width="20"
              height="32"
              viewBox="0 0 24 36"
              fill="none"
              style={{ animationDelay: `${i * 0.25}s` }}
              className="animate-gentle-pulse"
            >
              <path
                d="M12 16C8 10 4 8 4 4C4 1 8 0 12 4C16 0 20 1 20 4C20 8 16 10 12 16Z"
                fill={color}
                stroke="var(--color-outline-soft)"
                strokeWidth="1"
              />
              <line x1="12" y1="16" x2="12" y2="36" stroke="var(--color-mint)" strokeWidth="2" strokeLinecap="round" />
              <path d="M12 28C9 26 6 26 6 26" stroke="var(--color-mint)" strokeWidth="1.5" strokeLinecap="round" fill="none" />
            </svg>
          ))}
        </div>

        {/* Hint */}
        <p className="text-xs text-[var(--color-text-muted)] mt-4 animate-gentle-pulse">
          Click on a station to begin
        </p>
      </div>
    </div>
  );
}
