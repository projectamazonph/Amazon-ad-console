'use client';

import { useEffect } from 'react';
import { useAdConsoleStore } from '@/engine/ad-console/store';
import { useBreakpoint } from '@/lib/useBreakpoint';
import { getLeftRail, isSidebarItemActive, resolveSidebarClick, sidebarSectionForView } from '../nav/consoleNav';

const GROUP_TITLES: Record<string, string> = {
  campaigns: 'Campaign Manager',
  portfolios: 'Portfolios',
  measurement: 'Measurement',
  training: 'Training',
};

export function MobileNav() {
  const { isMobile, isTablet, isTouch } = useBreakpoint();
  const isMobileOrTablet = isMobile || isTablet;

  const mobileMenuOpen = useAdConsoleStore((s) => s.mobileMenuOpen);
  const toggleMobileMenu = useAdConsoleStore((s) => s.toggleMobileMenu);
  const closeMobileMenu = useAdConsoleStore((s) => s.closeMobileMenu);
  const view = useAdConsoleStore((s) => s.view);
  const selectedTab = useAdConsoleStore((s) => s.state.selectedTab);
  const setView = useAdConsoleStore((s) => s.setView);
  const setTab = useAdConsoleStore((s) => s.setTab);
  const runSimulation = useAdConsoleStore((s) => s.runSimulation);
  const resetAll = useAdConsoleStore((s) => s.resetAll);

  const section = sidebarSectionForView(view);
  const items = getLeftRail(section);

  const groups: Record<string, typeof items> = {};
  for (const item of items) {
    (groups[item.group] ??= []).push(item);
  }

  // Close on Escape key
  useEffect(() => {
    if (!mobileMenuOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeMobileMenu();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [mobileMenuOpen, closeMobileMenu]);

  if (!isMobileOrTablet) return null;

  return (
    <>
      <button
        className="mobile-hamburger"
        onClick={toggleMobileMenu}
        aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
        aria-expanded={mobileMenuOpen}
        style={{ touchAction: 'manipulation' }}
      >
        <span className={`hamburger-line ${mobileMenuOpen ? 'open' : ''}`} />
        <span className={`hamburger-line ${mobileMenuOpen ? 'open' : ''}`} />
        <span className={`hamburger-line ${mobileMenuOpen ? 'open' : ''}`} />
      </button>

      {mobileMenuOpen && (
        <div className="mobile-backdrop visible" onClick={closeMobileMenu} />
      )}

      <nav
        className={`mobile-drawer ${mobileMenuOpen ? 'open' : ''}`}
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
                className={`mobile-drawer-item ${isSidebarItemActive(item, view, selectedTab) ? 'active' : ''}`}
                onClick={() => {
                  const action = resolveSidebarClick(item, view);
                  if (action.type === 'setTab') setTab(action.tab!);
                  else if (action.type === 'setTabAndView') { setTab(action.tab!); setView(action.view!); }
                  else setView(action.view!);
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
