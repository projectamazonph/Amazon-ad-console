/**
 * Regression tests for the a11y-taste pass.
 *
 * Pins the P0/P1 structural fixes so future refactors don't accidentally
 * regress the keyboard / landmark surface:
 *
 *  - AdConsole renders a <main> landmark with id="main-content"
 *  - AdConsole renders a skip link pointing at that main landmark
 *  - Topbar nav sections are <button> elements, not <div>s
 *  - Sidebar items are <button> elements, not <div>s
 *  - The OverviewTab inputs have label htmlFor -> input id wiring
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, within } from '@testing-library/react';
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

describe('A11y — AdConsole landmarks and skip link', () => {
  beforeEach(resetStore);

  it('renders a main landmark for landmark navigation', () => {
    renderAdConsole();
    const main = screen.getByRole('main');
    expect(main.id).toBeTruthy();
  });

  it('renders a skip link that points to the main landmark', () => {
    renderAdConsole();
    const main = screen.getByRole('main');
    const skip = screen.getByRole('link', { name: /skip to content/i });
    expect(skip.getAttribute('href')).toBe(`#${main.id}`);
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

  it('marks Training active for training views', () => {
    useAdConsoleStore.getState().setView('drills');
    renderAdConsole();
    const topbar = screen.getByRole('navigation', { name: 'Global' });
    const training = Array.from(topbar.querySelectorAll('button.nav-section')).find(
      (button) => button.textContent === 'Training',
    );
    expect(training?.getAttribute('aria-current')).toBe('page');
  });

  it('sidebar rail items are <button> elements (no clickable divs)', () => {
    renderAdConsole();
    const sidebars = screen.getAllByRole('navigation', { name: 'Side navigation' });
    expect(
      sidebars.some((sidebar) =>
        Boolean(within(sidebar).queryByRole('button', { name: 'Sponsored Products' })),
      ),
    ).toBe(true);
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
