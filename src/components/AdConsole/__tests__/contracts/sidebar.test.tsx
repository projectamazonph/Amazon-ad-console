/**
 * Phase 0 — Sidebar contract tests.
 *
 * Pins the sidebar navigation contract:
 * - All rail items are <button> elements (not <div>)
 * - Active items correctly reflect the current view + selectedTab
 * - Footer action buttons (Run 7-day sim, Reset sandbox) are mounted
 *
 * Note: The Measurement rail shows ALL items as active simultaneously because
 * all items share the same `view: 'dashboard'` and the current view is also
 * 'dashboard'. This is by design.
 *
 * Migration plan Phase 9 will replace the markup with <SideNav> + <NavItem>.
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import { SessionProvider } from 'next-auth/react';
import { AdConsole } from '../../AdConsole';
import { useAdConsoleStore } from '@/engine/ad-console/store';

function resetStore() {
  useAdConsoleStore.getState().resetAll();
}

function renderAdConsole() {
  return render(
    <SessionProvider session={null}>
      <AdConsole />
    </SessionProvider>,
  );
}

describe('Sidebar contract — navigation structure', () => {
  beforeEach(resetStore);

  it('sidebar rail items are <button> elements (no clickable divs)', () => {
    renderAdConsole();
    const buttons = document.querySelectorAll('button.sidebar-item');
    expect(buttons.length).toBeGreaterThan(0);
    const divItems = document.querySelectorAll('div.sidebar-item');
    expect(divItems.length).toBe(0);
  });

  it('has a visible nav landmark', () => {
    renderAdConsole();
    const nav = document.querySelector('nav.app-sidebar');
    expect(nav).not.toBeNull();
  });

  it('section group titles render', () => {
    renderAdConsole();
    const titles = document.querySelectorAll('.sidebar-group-title');
    expect(titles.length).toBeGreaterThan(0);
    const text = Array.from(titles).map((t) => t.textContent?.trim());
    expect(text.some((t) => t!.length > 0)).toBe(true);
  });
});

describe('Sidebar contract — active state', () => {
  beforeEach(resetStore);

  it('active items reflect the current view (≥1, not zero)', () => {
    renderAdConsole();
    // The default view is 'dashboard' (Measurement), which renders ALL 5
    // Measurement rail items as active simultaneously — this is correct behaviour.
    const activeItems = document.querySelectorAll('button.sidebar-item[aria-current="page"]');
    expect(activeItems.length).toBeGreaterThan(0);
  });

  it('clicking a sidebar item updates the store view or tab', () => {
    // Use campaigns view so clicking "Ad groups" changes selectedTab
    useAdConsoleStore.getState().setView('campaigns');
    renderAdConsole();

    const store = useAdConsoleStore.getState();
    const initialTab = store.state.selectedTab;
    // Click "Ad groups" — it has tab='adgroups', which changes selectedTab
    const items = document.querySelectorAll('button.sidebar-item');
    const adGroupsBtn = Array.from(items).find(
      (b) => b.textContent?.trim() === 'Ad groups',
    );
    expect(adGroupsBtn).not.toBeUndefined();

    fireEvent.click(adGroupsBtn!);

    const newStore = useAdConsoleStore.getState();
    expect(
      newStore.state.selectedTab !== initialTab ||
        newStore.view !== store.view,
    ).toBe(true);
  });

  it('sidebar shows "Campaign Manager" section for campaigns view', () => {
    useAdConsoleStore.getState().setView('campaigns');
    renderAdConsole();
    const titles = Array.from(
      document.querySelectorAll('.sidebar-group-title'),
    ).map((t) => t.textContent?.trim());
    expect(titles).toContain('Campaign Manager');
  });

  it('sidebar shows "Training" section for a training view', () => {
    useAdConsoleStore.getState().setView('drills');
    renderAdConsole();
    const titles = Array.from(
      document.querySelectorAll('.sidebar-group-title'),
    ).map((t) => t.textContent?.trim());
    expect(titles).toContain('Training');
  });
});

describe('Sidebar contract — footer actions', () => {
  beforeEach(resetStore);

  it('"Run 7-day sim" footer button is in .app-sidebar', () => {
    renderAdConsole();
    // Footer buttons are always the last two .sidebar-item elements
    const sidebar = document.querySelector('nav.app-sidebar');
    const btns = Array.from(sidebar!.querySelectorAll('button.sidebar-item'));
    const footerBtns = btns.slice(-2);
    expect(footerBtns[0]?.textContent?.trim()).toContain('Run 7-day sim');
  });

  it('"Reset sandbox" footer button is in .app-sidebar', () => {
    renderAdConsole();
    const sidebar = document.querySelector('nav.app-sidebar');
    const btns = Array.from(sidebar!.querySelectorAll('button.sidebar-item'));
    const footerBtns = btns.slice(-2);
    expect(footerBtns[1]?.textContent?.trim()).toContain('Reset sandbox');
  });
});
