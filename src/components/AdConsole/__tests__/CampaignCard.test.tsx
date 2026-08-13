/**
 * TDD tests for CampaignCard (mobile campaign list item).
 *
 * Per MOBILE_REDESIGN_PLAN Phase 1: at <768px, each campaign renders as
 * a full-width card instead of a row in a table. Primary face shows
 * Name + Type + Status; secondary metrics expand on demand.
 *
 * Money is rendered with thousand separators and 2dp; ROAS is shown
 * to 2dp. Status uses the existing pill color system (green / orange).
 *
 * Secondary metrics (CPC, Orders, ACOS) live behind a `<details>`
 * element with an aria-expanded toggle so screen readers and keyboard
 * users can access them without losing context.
 */
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CampaignCard } from '../mobile/CampaignCard';
import type { Campaign } from '@/engine/ad-console/types';

const baseMetrics = {
  impressions: 10_000,
  clicks: 500,
  spend: 1234.56,
  sales: 4567.89,
  orders: 87,
};

function makeCampaign(overrides: Partial<Campaign> = {}): Campaign {
  return {
    id: 'camp-test',
    type: 'SP',
    name: 'Spring Sale - Auto',
    portfolio: 'Default',
    status: 'Enabled',
    dailyBudget: 35,
    defaultBid: 0.75,
    startDate: '2026-01-01',
    endDate: null,
    targetingMode: 'Automatic',
    adFormat: 'Standard',
    bidStrategy: 'Dynamic bids - down only',
    placements: { top: 0, product: 0, rest: 0 },
    products: ['B07TESTASIN'],
    creative: null,
    metrics: baseMetrics,
    adGroups: [],
    targets: [],
    searchTerms: [],
    negatives: [],
    budgetRules: [],
    productAds: [],
    ads: [],
    history: [],
    createdBySimulator: true,
    ...overrides,
  } as Campaign;
}

describe('CampaignCard - skeleton', () => {
  it('renders the campaign name', () => {
    render(<CampaignCard campaign={makeCampaign()} onSelect={() => {}} />);
    expect(screen.getByText(/Spring Sale/)).toBeTruthy();
  });

  it('renders the status as text', () => {
    render(<CampaignCard campaign={makeCampaign({ status: 'Enabled' })} onSelect={() => {}} />);
    expect(screen.getByText('Enabled')).toBeTruthy();
  });
});

describe('CampaignCard - primary metrics', () => {
  it('renders the campaign type as a pill', () => {
    render(<CampaignCard campaign={makeCampaign({ type: 'SP' })} onSelect={() => {}} />);
    expect(screen.getByText('SP')).toBeTruthy();
  });

  it('renders spend and sales formatted as money', () => {
    render(<CampaignCard campaign={makeCampaign()} onSelect={() => {}} />);
    expect(screen.getByText(/\$1,234\.56/)).toBeTruthy();
    expect(screen.getByText(/\$4,567\.89/)).toBeTruthy();
  });

  it('renders ROAS as a primary metric (sales/spend to 2dp)', () => {
    render(<CampaignCard campaign={makeCampaign()} onSelect={() => {}} />);
    expect(screen.getByText(/3\.70/)).toBeTruthy();
  });

  it('uses a green pill class for Enabled status', () => {
    render(<CampaignCard campaign={makeCampaign({ status: 'Enabled' })} onSelect={() => {}} />);
    const pill = screen.getByText('Enabled');
    expect(pill.className).toMatch(/pill/);
    expect(pill.className).toMatch(/green/);
  });

  it('uses orange pill class for Paused status', () => {
    render(<CampaignCard campaign={makeCampaign({ status: 'Paused' })} onSelect={() => {}} />);
    const pill = screen.getByText('Paused');
    expect(pill.className).toMatch(/pill/);
    expect(pill.className).toMatch(/orange/);
  });
});

describe('CampaignCard - expandable secondary', () => {
  it('hides CPC / Orders / ACOS behind an expandable region', () => {
    render(<CampaignCard campaign={makeCampaign()} onSelect={() => {}} />);
    // ACOS = spend / sales * 100 = 27.02 (rounded to 2dp)
    expect(screen.queryByText(/ACOS/i)).toBeNull();
  });

  it('renders a toggle button with aria-expanded', () => {
    render(<CampaignCard campaign={makeCampaign()} onSelect={() => {}} />);
    const toggle = screen.getByRole('button', { name: /show details|hide details|details/i });
    expect(toggle.getAttribute('aria-expanded')).toBe('false');
  });

  it('reveals ACOS, CPC, Orders when expanded', async () => {
    const user = userEvent.setup();
    render(<CampaignCard campaign={makeCampaign()} onSelect={() => {}} />);
    const toggle = screen.getByRole('button', { name: /show details|hide details|details/i });
    await user.click(toggle);
    expect(toggle.getAttribute('aria-expanded')).toBe('true');
    expect(screen.getByText(/ACOS/i)).toBeTruthy();
    expect(screen.getByText(/CPC/i)).toBeTruthy();
    expect(screen.getByText(/Orders/i)).toBeTruthy();
  });

  it('exposes Pause and Archive action buttons when expanded', async () => {
    const user = userEvent.setup();
    render(<CampaignCard campaign={makeCampaign()} onSelect={() => {}} />);
    const toggle = screen.getByRole('button', { name: /show details|hide details|details/i });
    await user.click(toggle);
    expect(screen.getByRole('button', { name: /pause/i })).toBeTruthy();
    expect(screen.getByRole('button', { name: /archive/i })).toBeTruthy();
  });

  it('calls onToggleStatus with the campaign id when Pause is clicked', async () => {
    const user = userEvent.setup();
    const onToggleStatus = vi.fn();
    render(
      <CampaignCard
        campaign={makeCampaign()}
        onSelect={() => {}}
        onToggleStatus={onToggleStatus}
      />,
    );
    const toggle = screen.getByRole('button', { name: /show details|hide details|details/i });
    await user.click(toggle);
    await user.click(screen.getByRole('button', { name: /pause/i }));
    expect(onToggleStatus).toHaveBeenCalledWith('camp-test');
  });
});
