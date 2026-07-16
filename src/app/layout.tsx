import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Amazon Ads Console Training Simulator',
  description: 'Practice Amazon PPC campaign management in a safe, offline sandbox',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
