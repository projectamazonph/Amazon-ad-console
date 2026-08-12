/**
 * TDD tests for CampaignCard (mobile campaign list item).
 *
 * Per MOBILE_REDESIGN_PLAN Phase 1: at <768px, each campaign renders as a
 * full-width card instead of a row in a table. The card surfaces Name,
 * Type badge, Status badge, and primary spend/sales metrics on the
 * visible face; secondary metrics (CPC, Orders, ACOS) and quick actions
 * live behind an expandable section.
 */
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CampaignCard } from '../mobile/CampaignCard';
import type { Campaign } from '@/engine/ad-console/types';

const baseMetrics = {
  impressions: 10_000,
  clicks: 500,
  spend: 1_234.56,
  sales: 4_567.89,
  orders: 87,
};

function makeCampaign(overrides: Partial<Campaign> = {}): Campaign {
  return {
    id: 'camp-test',
    type: 'SP',
    name: 'Spring Sale \u2014 Auto',
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

describe('CampaignCard', () => {
  it('renders the campaign name', () => {
    render(<CampaignCard campaign={makeCampaign()} onSelect={() => {}} />);
    expect(screen.getByText(/Spring Sale/)).toBeTruthy();
  });

  it('renders the status as text', () => {
    render(<CampaignCard campaign={makeCampaign({ status: 'Enabled' })} onSelect={() => {}} />);
    expect(screen.getByText('Enabled')).toBeTruthy();
  });
});
