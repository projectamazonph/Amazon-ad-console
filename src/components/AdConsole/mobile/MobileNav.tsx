'use client';

import { useRef, useEffect } from 'react';
import Link from 'next/link';
import { useAdConsoleStore } from '@/engine/ad-console/store';
import { useBreakpoint } from '@/lib/useBreakpoint';
import {
  GLOBAL_NAV,
  getLeftRail,
  isSidebarItemActive,
  resolveSidebarClick,
  sidebarSectionForView,
  type RailSection,
} from '../nav/consoleNav';
import { SideNav, SideNavSection, SideNavItem } from '@astryxdesign/core/SideNav';
import { Text } from '@astryxdesign/core/Text';
import { Button } from '@astryxdesign/core/Button';
import {
  navIconFor,
  RefreshIcon,
  PlayFilledIcon,
  CloseIcon,
} from '../layout/navIcons';

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

  // Make sure the active section tab is in view in narrow drawers.
  useEffect(() => {
    if (mobileMenu.status !== 'open') return;
    activeSectionTabRef.current?.scrollIntoView({ inline: 'nearest', block: 'nearest' });
  }, [mobileMenu.status, section]);

  if (!isMobileOrTablet) return null;

  const drawerOpen = mobileMenu.status === 'open' || mobileMenu.status === 'closing';
  const isVisible = mobileMenu.status === 'open';

  const header = (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px 16px',
        borderBottom: '1px solid var(--border, #d5d9d9)',
        background: 'var(--surface-1, #ffffff)',
      }}
    >
      <Link
        href="/"
        onClick={() => closeMobileMenu()}
        style={{
          color: 'var(--ink-900, #0f1111)',
          fontWeight: 700,
          fontSize: 'var(--text-base, 1rem)',
          textDecoration: 'none',
          minWidth: 0,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
      >
        Amazon Ads Console
      </Link>
      <Button
        variant="ghost"
        size="sm"
        label="Close"
        onClick={closeMobileMenu}
        aria-label="Close menu"
        icon={<CloseIcon />}
      />
    </div>
  );

  const footer = (
    <div style={{ display: 'grid', gap: 4, padding: '8px' }}>
      <button
        type="button"
        className="sidebar-action"
        onClick={() => {
          runSimulation();
          closeMobileMenu();
        }}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '8px 12px',
          background: 'transparent',
          border: 'none',
          borderRadius: 6,
          cursor: 'pointer',
          color: 'var(--ink-700, #2b3947)',
          font: 'inherit',
          fontSize: 'var(--text-sm, 0.875rem)',
          textAlign: 'left',
          width: '100%',
          minWidth: 0,
        }}
      >
        <PlayFilledIcon size={18} />
        <span style={{ minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          Run 7-day sim
        </span>
      </button>
      <button
        type="button"
        className="sidebar-action"
        onClick={() => {
          if (confirm('Reset all data?')) {
            resetAll();
            closeMobileMenu();
          }
        }}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '8px 12px',
          background: 'transparent',
          border: 'none',
          borderRadius: 6,
          cursor: 'pointer',
          color: 'var(--ink-700, #2b3947)',
          font: 'inherit',
          fontSize: 'var(--text-sm, 0.875rem)',
          textAlign: 'left',
          width: '100%',
          minWidth: 0,
        }}
      >
        <RefreshIcon size={18} />
        <span style={{ minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          Reset sandbox
        </span>
      </button>
    </div>
  );

  const sectionHeader = (
    <div
      className="tabs mobile-drawer-tabs"
      role="tablist"
      aria-label="Console sections"
      style={{
        display: 'flex',
        gap: 4,
        padding: '8px 12px',
        background: 'var(--surface-1, #ffffff)',
        borderBottom: '1px solid var(--border, #d5d9d9)',
        overflowX: 'auto',
      }}
    >
      {GLOBAL_NAV.map((navSection) => {
        const isActive = section === navSection.view;
        return (
          <button
            key={navSection.view}
            ref={isActive ? activeSectionTabRef : undefined}
            className={`tab ${isActive ? 'active' : ''}`}
            onClick={() => setView(navSection.view)}
            type="button"
            style={{
              padding: '6px 10px',
              borderRadius: 4,
              border: 'none',
              background: isActive ? 'var(--accent-soft, #fef3e0)' : 'transparent',
              color: isActive ? 'var(--accent-active, #c45500)' : 'var(--ink-700, #2b3947)',
              cursor: 'pointer',
              font: 'inherit',
              fontSize: 'var(--text-sm, 0.875rem)',
              fontWeight: isActive ? 600 : 400,
              whiteSpace: 'nowrap',
            }}
          >
            {navSection.label}
          </button>
        );
      })}
    </div>
  );

  return (
    <>
      <button
        className="mobile-hamburger"
        onClick={toggleMobileMenu}
        aria-label={mobileMenu.status === 'open' ? 'Close menu' : 'Open menu'}
        aria-expanded={mobileMenu.status === 'open'}
        type="button"
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
        className={`mobile-drawer amazon-sidebar ${isVisible ? 'open' : 'closing'}`}
        onTransitionEnd={handleTransitionEnd}
        aria-label="Console sections"
        style={{
          background: 'var(--surface-1, #ffffff)',
          color: 'var(--ink-900, #0f1111)',
          fontFamily: 'var(--font-body)',
          touchAction: isTouch ? 'pan-y' : undefined,
        } as React.CSSProperties}
      >
        {header}
        {sectionHeader}

        <SideNav
          header={
            <Text
              type="supporting"
              size="xsm"
              weight="medium"
              maxLines={1}
              hasTruncateTooltip
              style={{
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                color: 'var(--ink-500, #5f6b7a)',
                padding: '12px 16px 4px',
              }}
            >
              {GROUP_TITLES[section] ?? ''}
            </Text>
          }
          footer={footer}
          style={{
            backgroundColor: 'var(--surface-1, #ffffff)',
            color: 'var(--ink-900, #0f1111)',
            fontFamily: 'var(--font-body)',
          }}
        >
          {Object.entries(groups).map(([group, groupItems]) => (
            <SideNavSection key={group} title={GROUP_TITLES[group]}>
              {groupItems.map((item) => {
                const isSelected = isSidebarItemActive(item, view, selectedTab);
                return (
                  <SideNavItem
                    key={item.label}
                    className="sidebar-item"
                    label={item.label}
                    icon={navIconFor(item.label, isSelected)}
                    isSelected={isSelected}
                    onClick={() => {
                      const action = resolveSidebarClick(item, view);
                      if (action.type === 'setTab') setTab(action.tab!);
                      else if (action.type === 'setTabAndView') {
                        setTab(action.tab!);
                        setView(action.view!);
                      } else setView(action.view!);
                      closeMobileMenu();
                    }}
                  />
                );
              })}
            </SideNavSection>
          ))}
        </SideNav>
      </nav>
    </>
  );
}
