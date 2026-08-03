/**
 * Sidebar contract tests.
 *
 * Pins the fix for a real navigation gap: `Sidebar` (nav/consoleNav's
 * `getLeftRail`/training rail) existed with full unit test coverage but was
 * never mounted into `AdConsole`, so Missions/Reports/Bulk ops/Trainer/
 * Integrity were unreachable from the desktop UI. This locks in that the
 * sidebar renders and actually drives navigation for those views.
 */
import React from 'react';
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

describe('Sidebar contract — mounted and reachable', () => {
  beforeEach(resetStore);

  it('renders a nav.app-sidebar inside app-body', () => {
    renderAdConsole();
    const sidebar = document.querySelector('.app-body > nav.app-sidebar');
    expect(sidebar).not.toBeNull();
  });

  it('shows the training rail (Missions, Reports, Bulk ops, Trainer, Integrity) when on a training view', () => {
    useAdConsoleStore.getState().setView('drills');
    renderAdConsole();

    const sidebar = document.querySelector('.app-sidebar')!;
    for (const label of ['Drills', 'Missions', 'Reports', 'Bulk ops', 'Trainer', 'Integrity']) {
      const btn = Array.from(sidebar.querySelectorAll('button.sidebar-item')).find(
        (b) => b.textContent?.trim() === label,
      );
      expect(btn, `sidebar item "${label}" must exist`).not.toBeUndefined();
    }
  });

  it('clicking "Missions" in the sidebar navigates to the missions view', () => {
    useAdConsoleStore.getState().setView('drills');
    renderAdConsole();

    const sidebar = document.querySelector('.app-sidebar')!;
    const btn = Array.from(sidebar.querySelectorAll('button.sidebar-item')).find(
      (b) => b.textContent?.trim() === 'Missions',
    );
    expect(btn).not.toBeUndefined();
    fireEvent.click(btn!);

    expect(useAdConsoleStore.getState().view).toBe('missions');
  });

  it('clicking "Reports" in the sidebar navigates to the reports view', () => {
    useAdConsoleStore.getState().setView('trainer');
    renderAdConsole();

    const sidebar = document.querySelector('.app-sidebar')!;
    const btn = Array.from(sidebar.querySelectorAll('button.sidebar-item')).find(
      (b) => b.textContent?.trim() === 'Reports',
    );
    expect(btn).not.toBeUndefined();
    fireEvent.click(btn!);

    expect(useAdConsoleStore.getState().view).toBe('reports');
  });

  it('marks the active view\'s rail item with aria-current="page"', () => {
    useAdConsoleStore.getState().setView('integrity');
    renderAdConsole();

    const sidebar = document.querySelector('.app-sidebar')!;
    const active = sidebar.querySelector('button.sidebar-item[aria-current="page"]');
    expect(active).not.toBeNull();
    expect(active?.textContent?.trim()).toBe('Integrity');
  });
});
