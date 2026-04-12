import type { Metadata } from 'next';
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
