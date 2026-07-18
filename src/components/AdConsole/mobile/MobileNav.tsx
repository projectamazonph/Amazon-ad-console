'use client';

import { useRef, useEffect } from 'react';
import { useAdConsoleStore } from '@/engine/ad-console/store';
import { useBreakpoint } from '@/lib/useBreakpoint';
import { getLeftRail, type NavView } from '../nav/consoleNav';

const GROUP_TITLES: Record<string, string> = {
  campaigns: 'Campaign Manager',
  portfolios: 'Portfolios',
  measurement: 'Measurement',
};

export function MobileNav() {
  const { isMobile, isTablet, isTouch } = useBreakpoint();
  const isMobileOrTablet = isMobile || isTablet;

  const mobileMenu = useAdConsoleStore((s) => s.mobileMenu);
  const toggleMobileMenu = useAdConsoleStore((s) => s.toggleMobileMenu);
  const closeMobileMenu = useAdConsoleStore((s) => s.closeMobileMenu);
  const mobileMenuAnimationEnd = useAdConsoleStore((s) => s.mobileMenuAnimationEnd);
  const view = useAdConsoleStore((s) => s.view);
  const setView = useAdConsoleStore((s) => s.setView);
  const runSimulation = useAdConsoleStore((s) => s.runSimulation);
  const resetAll = useAdConsoleStore((s) => s.resetAll);

  const drawerRef = useRef<HTMLDivElement>(null);

  const section: NavView = view === 'portfolio' ? 'portfolio' : 'campaigns';
  const items = getLeftRail(section);

  const groups: Record<string, typeof items> = {};
  for (const item of items) {
    (groups[item.group] ??= []).push(item);
  }

  // Handle animation end for closing transition
  const handleTransitionEnd = (e: React.TransitionEvent) => {
    if (e.propertyName === 'transform' || e.target === drawerRef.current) {
      mobileMenuAnimationEnd();
    }
  };

  // Close on Escape key
  useEffect(() => {
    if (mobileMenu.status !== 'open') return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeMobileMenu();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [mobileMenu.status, closeMobileMenu]);

  if (!isMobileOrTablet) return null;

  const drawerOpen = mobileMenu.status === 'open' || mobileMenu.status === 'closing';
  const isVisible = mobileMenu.status === 'open';

  return (
    <>
      <button
        className="mobile-hamburger"
        onClick={toggleMobileMenu}
        aria-label={mobileMenu.status === 'open' ? 'Close menu' : 'Open menu'}
        aria-expanded={mobileMenu.status === 'open'}
        style={{ touchAction: 'manipulation' }}
      >
        <span className={`hamburger-line ${mobileMenu.status === 'open' ? 'open' : ''}`} />
        <span className={`hamburger-line ${mobileMenu.status === 'open' ? 'open' : ''}`} />
        <span className={`hamburger-line ${mobileMenu.status === 'open' ? 'open' : ''}`} />
      </button>

      {drawerOpen && (
        <div
          className={`mobile-backdrop ${isVisible ? 'visible' : ''}`}
          onClick={closeMobileMenu}
          onTransitionEnd={(e) => {
            if (e.propertyName === 'opacity') {
              if (mobileMenu.status === 'closing') mobileMenuAnimationEnd();
            }
          }}
        />
      )}

      <nav
        ref={drawerRef}
        className={`mobile-drawer ${isVisible ? 'open' : 'closing'}`}
        onTransitionEnd={handleTransitionEnd}
        aria-label="Console sections"
        style={{ touchAction: isTouch ? 'pan-y' : undefined } as React.CSSProperties}
      >
        <div className="mobile-drawer-header">
          <span className="mobile-drawer-title">Amazon Ads Console</span>
          <button className="mobile-drawer-close" onClick={closeMobileMenu} aria-label="Close menu">
            ✕
          </button>
        </div>

        {Object.entries(groups).map(([group, groupItems]) => (
          <div key={group}>
            <div className="sidebar-group-title">{GROUP_TITLES[group]}</div>
            {groupItems.map((item) => (
              <button
                key={item.label}
                className={`mobile-drawer-item ${view === item.view && group === 'campaigns' ? 'active' : ''}`}
                onClick={() => {
                  setView(item.view);
                  closeMobileMenu();
                }}
              >
                {item.label}
              </button>
            ))}
          </div>
        ))}

        <div className="sidebar-spacer" />
        <button
          className="mobile-drawer-item"
          onClick={() => { runSimulation(); closeMobileMenu(); }}
        >
          Run 7-day sim
        </button>
        <button
          className="mobile-drawer-item"
          onClick={() => { if (confirm('Reset all data?')) { resetAll(); closeMobileMenu(); } }}
        >
          Reset sandbox
        </button>
      </nav>
    </>
  );
}
