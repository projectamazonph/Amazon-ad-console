'use client';

import { useRef, useEffect } from 'react';
import { useAdConsoleStore } from '@/engine/ad-console/store';
import { useBreakpoint } from '@/lib/useBreakpoint';
import { GLOBAL_NAV, getLeftRail, isSidebarItemActive, resolveSidebarClick, sidebarSectionForView, type RailSection } from '../nav/consoleNav';

const GROUP_TITLES: Record<string, string> = {
  campaigns: 'Campaign Manager',
  portfolios: 'Portfolios',
  measurement: 'Measurement',
  training: 'Training',
};

export function MobileNav() {
  const { isMobile, isTablet, isTouch } = useBreakpoint();
  const isMobileOrTablet = isMobile || isTablet;

  const mobileMenu = useAdConsoleStore((s) => s.mobileMenu);
  const toggleMobileMenu = useAdConsoleStore((s) => s.toggleMobileMenu);
  const closeMobileMenu = useAdConsoleStore((s) => s.closeMobileMenu);
  const mobileMenuAnimationEnd = useAdConsoleStore((s) => s.mobileMenuAnimationEnd);
  const view = useAdConsoleStore((s) => s.view);
  const selectedTab = useAdConsoleStore((s) => s.state.selectedTab);
  const setView = useAdConsoleStore((s) => s.setView);
  const setTab = useAdConsoleStore((s) => s.setTab);
  const runSimulation = useAdConsoleStore((s) => s.runSimulation);
  const resetAll = useAdConsoleStore((s) => s.resetAll);

  const drawerRef = useRef<HTMLDivElement>(null);
  const activeSectionTabRef = useRef<HTMLButtonElement>(null);

  // Mirror the desktop sidebar's section resolution so the drawer shows the
  // same rail as the active global-nav section instead of always defaulting
  // to Campaign Manager. `sidebarSectionForView` is shared with the desktop
  // sidebar (H-03) so the two stay in sync.
  const section: RailSection = sidebarSectionForView(view);
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

  // The section switcher can scroll horizontally on narrow drawers — make
  // sure the active section is always the one in view, not clipped off.
  useEffect(() => {
    if (mobileMenu.status !== 'open') return;
    activeSectionTabRef.current?.scrollIntoView({ inline: 'nearest', block: 'nearest' });
  }, [mobileMenu.status, section]);

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
          <span className="mobile-drawer-title">Project Amazon PH</span>
          <button className="mobile-drawer-close" onClick={closeMobileMenu} aria-label="Close menu">
            ✕
          </button>
        </div>

        {/* .nav-section (the desktop equivalent) is hidden below 768px, so this
            is the only way for phone-width users to switch top-level sections. */}
        <div className="tabs mobile-drawer-tabs" role="tablist" aria-label="Console sections">
          {GLOBAL_NAV.map((navSection) => {
            // Compare `section` (a RailSection) to `navSection.key`, not
            // `navSection.view` — the Training section's key is 'training'
            // while its nav target is 'drills' (H-03).
            const isActive = section === navSection.key;
            return (
              <button
                key={navSection.key}
                ref={isActive ? activeSectionTabRef : undefined}
                className={`tab ${isActive ? 'active' : ''}`}
                onClick={() => setView(navSection.view)}
              >
                {navSection.label}
              </button>
            );
          })}
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
