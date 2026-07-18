'use client';

import { useState, useEffect } from 'react';
import { resolveBreakpoint, isTouchViewport } from '@/engine/ad-console/core/engine';
import type { Breakpoint } from '@/engine/ad-console/core/engine';

/**
 * Thin React hook over the pure resolveBreakpoint + isTouchViewport functions.
 * Returns the current breakpoint and whether the viewport is touch-friendly.
 * SSR-safe: defaults to 'desktop' / false until mount.
 */
export function useBreakpoint(): {
  breakpoint: Breakpoint;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isTouch: boolean;
} {
  const [breakpoint, setBreakpoint] = useState<Breakpoint>('desktop');
  const [width, setWidth] = useState(0);
  const [touch, setTouch] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia('(pointer: coarse)');
    const handleTouch = () => setTouch(mql.matches);

    const handleResize = () => {
      const w = window.innerWidth;
      setWidth(w);
      setBreakpoint(resolveBreakpoint(w));
    };

    handleResize();
    handleTouch();

    window.addEventListener('resize', handleResize);
    mql.addEventListener('change', handleTouch);

    return () => {
      window.removeEventListener('resize', handleResize);
      mql.removeEventListener('change', handleTouch);
    };
  }, []);

  return {
    breakpoint,
    isMobile: breakpoint === 'mobile',
    isTablet: breakpoint === 'tablet',
    isDesktop: breakpoint === 'desktop',
    isTouch: isTouchViewport(touch, width),
  };
}
