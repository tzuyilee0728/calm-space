'use client';

export default function Sparkle({
  x,
  y,
  size = 8,
  delay = 0,
}: {
  x: number;
  y: number;
  size?: number;
  delay?: number;
}) {
  return (
    <svg
      className="animate-sparkle absolute pointer-events-none"
      style={{
        left: x,
        top: y,
        animationDelay: `${delay}s`,
        width: size,
        height: size,
      }}
      viewBox="0 0 20 20"
      fill="var(--color-sparkle)"
    >
      <path d="M10 0L12.5 7.5L20 10L12.5 12.5L10 20L7.5 12.5L0 10L7.5 7.5Z" />
    </svg>
  );
}
