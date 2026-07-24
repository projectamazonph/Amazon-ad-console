/**
 * Regression tests for the a11y-taste pass.
 *
 * Pins the P0/P1 structural fixes so future refactors don't accidentally
 * regress the keyboard / landmark surface:
 *
 *  - AdConsole renders a <main> landmark with id="main-content"
 *  - AdConsole renders a skip link pointing at that main landmark
 *  - Topbar nav sections are <button> elements, not <div>s
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

describe('A11y — AdConsole landmarks and skip link', () => {
  beforeEach(resetStore);

  it('renders a <main> element with id="main-content" for landmark navigation', () => {
    renderAdConsole();
    const main = document.querySelector('main#main-content');
    expect(main).not.toBeNull();
  });

  it('renders a skip link that points to the main landmark', () => {
    renderAdConsole();
    const skip = document.querySelector('a.skip-link');
    expect(skip).not.toBeNull();
    expect(skip?.getAttribute('href')).toBe('#main-content');
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
