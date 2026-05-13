import type { Metadata, Viewport } from 'next';
import { Nunito } from 'next/font/google';
import './globals.css';

const nunito = Nunito({
  variable: '--font-nunito',
  subsets: ['latin'],
  weight: ['400', '600', '700', '800'],
});

export const metadata: Metadata = {
  title: 'My Space - Find Your Calm',
  description: 'A cozy space to recharge your mind with soothing sounds and satisfying interactions.',
};

// `viewportFit: 'cover'` enables `env(safe-area-inset-*)` so the canvas extends
// behind the iOS notch / home-indicator while the toolbox + Reset View button
// pad themselves clear of those zones. Locking max-scale prevents iOS's
// pinch-to-zoom and input-focus-zoom from breaking the 3D scene layout.
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${nunito.variable} h-full`}>
      <body className="min-h-full" style={{ fontFamily: 'var(--font-nunito), sans-serif' }}>
        {children}
      </body>
    </html>
  );
}
