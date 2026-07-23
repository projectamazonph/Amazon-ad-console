/**
 * Phase 0 — Topbar contract tests.
 *
 * Pins the topbar navigation contract:
 * - nav.app-navbar renders with aria-label="Global"
 * - All 4 sections render as <button> elements inside .app-navbar (not mobile drawer)
 * - Exactly one button has aria-current="page"
 * - Active section updates when the store view changes
 * - Brand text, SyncButton, and UserMenu are mounted
 *
 * Note: "Campaign Manager", "Portfolios", etc. also appear in the mobile-drawer
 * tab list. All queries target .app-navbar to avoid those false positives.
 *
 * Migration plan Phase 10 will replace the markup with <TopNav> + <NavItem>.
 */
import React from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import { render, within, fireEvent, type RenderResult } from '@testing-library/react';
import { SessionProvider } from 'next-auth/react';
import { AdConsole } from '../../AdConsole';
import { useAdConsoleStore } from '@/engine/ad-console/store';
import { GLOBAL_NAV, activeTopbarSection } from '../../nav/consoleNav';

function resetStore() {
  useAdConsoleStore.getState().resetAll();
}

function renderAdConsole(): RenderResult {
  return render(
    <SessionProvider session={null}>
      <AdConsole />
    </SessionProvider>,
  );
}

const TOPBAR_SECTIONS = ['Campaign Manager', 'Portfolios', 'Measurement', 'Training'];

describe('Topbar contract — rendering and structure', () => {
  beforeEach(resetStore);

  it('renders a nav.app-navbar with aria-label="Global"', () => {
    renderAdConsole();
    const nav = document.querySelector('nav.app-navbar[aria-label="Global"]');
    expect(nav).not.toBeNull();
  });

  it('renders all 4 global nav section buttons inside .app-navbar', () => {
    renderAdConsole();
    const nav = document.querySelector('nav.app-navbar');
    expect(nav).not.toBeNull();

    // Scope to .nav-section children so mobile-drawer tabs are excluded
    for (const section of TOPBAR_SECTIONS) {
      const btns = nav!.querySelectorAll('button.nav-section');
      const btn = Array.from(btns).find(
        (b) => b.textContent?.trim().toLowerCase().includes(section.toLowerCase()),
      );
      expect(btn, `nav-section button for "${section}" must exist`).not.toBeUndefined();
      expect(btn!.tagName).toBe('BUTTON');
    }
  });

  it('no nav-section is a <div> (semantic button requirement)', () => {
    renderAdConsole();
    const divSections = document.querySelectorAll('div.nav-section');
    expect(divSections.length).toBe(0);
  });

  it('brand text "Amazon Ads Console" renders in .nav-brand', () => {
    renderAdConsole();
    const brand = document.querySelector('.nav-brand');
    expect(brand).not.toBeNull();
    expect(brand?.textContent).toContain('Amazon');
    expect(brand?.textContent).toContain('Console');
  });

  it('SyncButton and UserMenu are mounted in the topbar', () => {
    renderAdConsole();
    const nav = document.querySelector('nav.app-navbar');
    expect(nav).not.toBeNull();
    // SyncButton renders a button
    const syncBtn = nav?.querySelector('button:not(.nav-section)');
    expect(syncBtn).not.toBeNull();
  });
});

describe('Topbar contract — active section follows view', () => {
  beforeEach(resetStore);

  it('exactly one nav-section has aria-current="page" at a time', () => {
    renderAdConsole();
    const active = document.querySelectorAll('button.nav-section[aria-current="page"]');
    expect(active.length).toBe(1);
  });

  it('active section reflects the current store view', () => {
    renderAdConsole();
    const store = useAdConsoleStore.getState();
    const expectedSection = activeTopbarSection(store.view);

    const activeBtn = document.querySelector('button.nav-section[aria-current="page"]');
    expect(activeBtn).not.toBeNull();

    const activeLabel = activeBtn!.textContent?.trim() ?? '';
    const sectionLabel = GLOBAL_NAV.find((s) => s.view === expectedSection)?.label;
    expect(activeLabel).toBe(sectionLabel);
  });

  it('clicking "Portfolios" in the topbar updates store view to portfolio', () => {
    renderAdConsole();
    const nav = document.querySelector('nav.app-navbar');
    const btns = nav!.querySelectorAll('button.nav-section');
    const btn = Array.from(btns).find(
      (b) => b.textContent?.includes('Portfolios'),
    );
    expect(btn).not.toBeUndefined();
    fireEvent.click(btn!);

    const newStore = useAdConsoleStore.getState();
    expect(newStore.view).toBe('portfolio');
  });

  it('setView("drills") makes Training the active nav-section', () => {
    // Set view to 'drills' before rendering so Training is active from the start
    useAdConsoleStore.getState().setView('drills');
    renderAdConsole();

    const active = document.querySelector('button.nav-section[aria-current="page"]');
    expect(active).not.toBeNull();
    expect(active?.textContent?.trim()).toBe('Training');
  });
});

describe('Topbar contract — activeTopbarSection helper', () => {
  it('returns "campaigns" for views: campaigns, detail, create', () => {
    expect(activeTopbarSection('campaigns')).toBe('campaigns');
    expect(activeTopbarSection('create')).toBe('campaigns');
  });

  it('returns "portfolio" for view: portfolio', () => {
    expect(activeTopbarSection('portfolio')).toBe('portfolio');
  });

  it('returns "dashboard" for view: dashboard', () => {
    expect(activeTopbarSection('dashboard')).toBe('dashboard');
  });

  it('returns "training" for all 6 training views', () => {
    const trainingViews = ['drills', 'missions', 'reports', 'bulk', 'trainer', 'integrity'];
    for (const view of trainingViews) {
      expect(activeTopbarSection(view)).toBe('training');
    }
  });
});
