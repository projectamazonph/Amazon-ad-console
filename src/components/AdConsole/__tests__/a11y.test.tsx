/**
 * Regression tests for the a11y-taste pass.
 *
 * Pins the P0/P1 structural fixes so future refactors don't accidentally
 * regress the keyboard / landmark surface:
 *
 *  - AdConsole renders a <main> landmark with id="astryx-app-shell-main"
 *  - Topbar nav sections are <button> elements, not <div>s
 *  - Sidebar items are <button> elements, not <div>s
 *  - The OverviewTab inputs have label htmlFor -> input id wiring
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SessionProvider } from 'next-auth/react';
import { AdConsole } from '../AdConsole';
import { OverviewTab } from '../details/OverviewTab';
import { useAdConsoleStore } from '@/engine/ad-console/store';
import type { Campaign } from '@/engine/ad-console/types';

function resetStore() {
  useAdConsoleStore.getState().resetAll();
}

function getFirstCampaign(): Campaign {
  return useAdConsoleStore.getState().state.campaigns[0]!;
}

// AdConsole transitively renders <UserMenu /> which calls useSession(), so
// every AdConsole render test needs a SessionProvider wrapper.
function renderAdConsole() {
  return render(
    <SessionProvider session={null}>
      <AdConsole />
    </SessionProvider>,
  );
}

describe('A11y — AdConsole landmarks', () => {
  beforeEach(resetStore);

  it('renders a main landmark with id for landmark navigation', () => {
    renderAdConsole();
    const main = document.querySelector('[role="main"]');
    expect(main).not.toBeNull();
    expect(main?.id).toBe('astryx-app-shell-main');
  });
});

describe('A11y — Topbar and Sidebar use semantic buttons', () => {
  beforeEach(resetStore);

  it('topbar nav sections are <button> elements with aria-current', () => {
    renderAdConsole();
    const buttons = screen.getAllByRole('button', { name: /Campaign Manager|Portfolios|Measurement|Training/ });
    expect(buttons.length).toBeGreaterThanOrEqual(4);
    const active = buttons.find((b) => b.getAttribute('aria-current') === 'page');
    expect(active).toBeDefined();
  });

  it('sidebar rail items are <button> elements (no clickable divs)', () => {
    renderAdConsole();
    // SideNav renders nav items as <button> elements via NavItemElement
    const railItems = document.querySelectorAll('nav button');
    expect(railItems.length).toBeGreaterThan(0);
  });
});

describe('A11y — OverviewTab inputs are label-wired', () => {
  beforeEach(resetStore);

  it('every input has an associated label via htmlFor/id', () => {
    const c = getFirstCampaign();
    render(<OverviewTab campaign={c} />);

    const inputs = screen.getAllByRole('spinbutton');
    expect(inputs.length).toBeGreaterThan(0);
    for (const input of inputs) {
      const id = input.getAttribute('id');
      expect(id, 'OverviewTab input must have an id').toBeTruthy();
      const label = document.querySelector(`label[for="${id}"]`);
      expect(label, `OverviewTab input #${id} is missing a label[for=${id}]`).not.toBeNull();
    }
  });
});
