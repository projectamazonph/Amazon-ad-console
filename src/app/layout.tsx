import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { SessionProvider } from '@/components/SessionProvider';
import './globals.css';

const geist = Geist({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
});

const geistMono = Geist_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
});

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  title: 'Amazon Ads Console Training Simulator',
  description: 'Practice Amazon PPC campaign management in a safe, offline sandbox',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geist.variable} ${geistMono.variable}`}>
      <body>
        <SessionProvider>
          {children}
        </SessionProvider>
      </body>
    </html>
  );
}
