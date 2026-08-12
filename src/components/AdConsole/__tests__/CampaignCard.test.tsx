/**
 * TDD tests for CampaignCard (mobile campaign list item).
 *
 * Per MOBILE_REDESIGN_PLAN Phase 1: at <768px, each campaign renders as
 * a full-width card instead of a row in a table. Primary face shows
 * Name + Type + Status; secondary metrics expand on demand.
 *
 * Money is rendered with thousand separators and 2dp; ROAS is shown
 * to 2dp. Status uses the existing pill color system (green / orange).
 */
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
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
    // sales=4567.89 / spend=1234.56 = 3.6999... -> "3.70"
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
