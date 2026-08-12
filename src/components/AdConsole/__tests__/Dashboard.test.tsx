/**
 * TDD tests for Dashboard breakpoint branching.
 *
 * Per MOBILE_REDESIGN_PLAN Phase 1: when useBreakpoint().isMobile is true
 * the Dashboard renders CampaignCard list items instead of a <Table>.
 * Tablet and desktop paths must remain unchanged (still use the Table).
 *
 * Strategy: mock @/lib/useBreakpoint to control isMobile per test, then
 * assert which DOM shape is produced. We also assert that onSelect
 * propagates from the card to the store's selectCampaign.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import { SessionProvider } from 'next-auth/react';

// Mock the breakpoint hook so each test can pick its viewport.
const mockUseBreakpoint = vi.fn();
vi.mock('@/lib/useBreakpoint', () => ({
  useBreakpoint: () => mockUseBreakpoint(),
}));

import { Dashboard } from '../Dashboard';
import { useAdConsoleStore } from '@/engine/ad-console/store';

function defaultBreakpoint() {
  return {
    breakpoint: 'desktop' as const,
    isMobile: false,
    isTablet: false,
    isDesktop: true,
    isTouch: false,
  };
}

function mobileBreakpoint() {
  return {
    breakpoint: 'mobile' as const,
    isMobile: true,
    isTablet: false,
    isDesktop: false,
    isTouch: true,
  };
}

function renderDashboard() {
  return render(
    <SessionProvider session={null}>
      <Dashboard />
    </SessionProvider>,
  );
}

beforeEach(() => {
  useAdConsoleStore.getState().resetAll();
  mockUseBreakpoint.mockReset();
});

describe('Dashboard - breakpoint branching', () => {
  it('renders the table on desktop (no CampaignCard articles)', () => {
    mockUseBreakpoint.mockReturnValue(defaultBreakpoint());
    const { container } = renderDashboard();
    expect(container.querySelector('table')).not.toBeNull();
    expect(container.querySelector('.campaign-card')).toBeNull();
  });

  it('renders CampaignCard articles on mobile (no table)', () => {
    mockUseBreakpoint.mockReturnValue(mobileBreakpoint());
    const { container } = renderDashboard();
    expect(container.querySelector('table')).toBeNull();
    const cards = container.querySelectorAll('.campaign-card');
    expect(cards.length).toBeGreaterThan(0);
  });

  it('renders one CampaignCard per campaign on mobile', () => {
    mockUseBreakpoint.mockReturnValue(mobileBreakpoint());
    const { container } = renderDashboard();
    const state = useAdConsoleStore.getState().state;
    const cards = container.querySelectorAll('.campaign-card');
    // Store may slice to 8 like the existing renderCampaignTable does.
    // Either way the count must equal the visible slice.
    expect(cards.length).toBe(Math.min(8, state.campaigns.length));
  });

  it('clicking a CampaignCard select button triggers store.selectCampaign', async () => {
    mockUseBreakpoint.mockReturnValue(mobileBreakpoint());
    const { container } = renderDashboard();
    const firstCard = container.querySelector('.campaign-card');
    expect(firstCard).not.toBeNull();
    const selectBtn = firstCard!.querySelector('.campaign-card__select') as HTMLButtonElement;
    expect(selectBtn).not.toBeNull();
    selectBtn.click();
    const state = useAdConsoleStore.getState().state;
    expect(state.selectedCampaignId).not.toBeNull();
  });

  it('still renders KPI tiles on mobile (KPI grid does not disappear)', () => {
    mockUseBreakpoint.mockReturnValue(mobileBreakpoint());
    const { container } = renderDashboard();
    expect(container.querySelector('.kpi-grid')).not.toBeNull();
  });
});
