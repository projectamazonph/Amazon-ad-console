'use client';

import Link from 'next/link';
import { Theme } from '@astryxdesign/core/theme';
import { LinkProvider } from '@astryxdesign/core/Link';
import { neutralTheme } from '@astryxdesign/theme-neutral/built';
import { SessionProvider } from '@/components/SessionProvider';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <Theme theme={neutralTheme}>
        <LinkProvider component={Link}>{children}</LinkProvider>
      </Theme>
    </SessionProvider>
  );
}
