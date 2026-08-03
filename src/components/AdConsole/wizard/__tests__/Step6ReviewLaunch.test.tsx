/**
 * Step6ReviewLaunch pins a real bug found during a wizard walkthrough:
 * `audienceLookback` defaults to '30' in makeDraft() regardless of
 * campaign type, so the old `{d.audienceLookback && ...}` condition
 * showed a "Lookback" row on every campaign's review step — including
 * Sponsored Products, which has no such concept. The Lookback row should
 * only appear when targetingMode is actually an audience mode.
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Step6ReviewLaunch } from '../Step6ReviewLaunch';
import { useAdConsoleStore } from '@/engine/ad-console/store';

function resetStore() {
  useAdConsoleStore.getState().resetAll();
  useAdConsoleStore.getState().resetDraft();
}

describe('Step6ReviewLaunch — Lookback row', () => {
  beforeEach(resetStore);

  it('does not show Lookback for a default (non-audience) SP draft', () => {
    render(<Step6ReviewLaunch isActive isComplete={false} />);
    expect(screen.queryByText('Lookback')).toBeNull();
  });

  it('shows Lookback once targetingMode is an audience mode', () => {
    useAdConsoleStore.getState().updateDraft('type', 'SD');
    useAdConsoleStore.getState().updateDraft('targetingMode', 'Audiences - views remarketing');
    useAdConsoleStore.getState().updateDraft('audienceLookback', '60');
    render(<Step6ReviewLaunch isActive isComplete={false} />);
    expect(screen.getByText('Lookback')).toBeTruthy();
    expect(screen.getByText('60 days')).toBeTruthy();
  });

  it('hides Lookback again if targetingMode is switched back to a non-audience mode', () => {
    useAdConsoleStore.getState().updateDraft('type', 'SB');
    useAdConsoleStore.getState().updateDraft('targetingMode', 'Keyword');
    render(<Step6ReviewLaunch isActive isComplete={false} />);
    expect(screen.queryByText('Lookback')).toBeNull();
  });
});

describe('Step6ReviewLaunch — targeting/creative summary rows', () => {
  beforeEach(resetStore);

  it('shows ASIN and category target counts when entered', () => {
    useAdConsoleStore.getState().updateDraft('asinTargets', 'B0ABC123\nB0DEF456');
    useAdConsoleStore.getState().updateDraft('categoryTargets', 'Drinkware');
    render(<Step6ReviewLaunch isActive isComplete={false} />);
    expect(screen.getByText('ASIN targets')).toBeTruthy();
    expect(screen.getByText('2 entered')).toBeTruthy();
    expect(screen.getByText('Category targets')).toBeTruthy();
    expect(screen.getByText('1 entered')).toBeTruthy();
  });

  it('shows the SB/SD creative headline, brand, and destination when set', () => {
    useAdConsoleStore.getState().updateDraft('creative', {
      headline: 'Discover your perfect brew',
      brandName: 'Acme Coffee',
      destination: 'Brand Store',
    });
    render(<Step6ReviewLaunch isActive isComplete={false} />);
    expect(screen.getByText('Headline')).toBeTruthy();
    expect(screen.getByText('Discover your perfect brew')).toBeTruthy();
    expect(screen.getByText('Brand')).toBeTruthy();
    expect(screen.getByText('Acme Coffee')).toBeTruthy();
    expect(screen.getByText('Destination')).toBeTruthy();
    expect(screen.getByText('Brand Store')).toBeTruthy();
  });

  it('does not show creative rows for a fresh SP draft with no creative set', () => {
    render(<Step6ReviewLaunch isActive isComplete={false} />);
    expect(screen.queryByText('Headline')).toBeNull();
    expect(screen.queryByText('Brand')).toBeNull();
    expect(screen.queryByText('Destination')).toBeNull();
  });
});
