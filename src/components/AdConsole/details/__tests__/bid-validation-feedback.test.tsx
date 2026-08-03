/**
 * Pins visible validation feedback for below-minimum bids in TargetsTab and
 * AdGroupsTab. Previously the "Set"/"Save default bid" buttons silently did
 * nothing when the typed value was below MIN_BID — no error state, no
 * indication anything was wrong (flagged in PR review).
 */
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TargetsTab } from '../TargetsTab';
import { AdGroupsTab } from '../AdGroupsTab';
import type { Campaign } from '@/engine/ad-console/types';

function makeCampaign(): Campaign {
  const agId = 'AG1';
  return {
    id: 'C1',
    type: 'SP',
    name: 'Test',
    portfolio: 'Training Portfolio',
    status: 'Enabled',
    dailyBudget: 10,
    defaultBid: 0.75,
    startDate: '2026-01-01',
    endDate: null,
    targetingMode: 'Manual keyword',
    adFormat: 'Standard',
    bidStrategy: 'Dynamic bids - down only',
    placements: { top: 0, product: 0, rest: 0 },
    products: ['B0TRAIN001'],
    creative: null,
    metrics: { impressions: 0, clicks: 0, spend: 0, sales: 0, orders: 0 },
    adGroups: [{ id: agId, campaignId: 'C1', name: 'AG', status: 'Enabled', defaultBid: 0.75, metrics: { impressions: 0, clicks: 0, spend: 0, sales: 0, orders: 0 } }],
    targets: [
      { id: 'T1', campaignId: 'C1', adGroupId: agId, type: 'Keyword', value: 'kw', match: 'Exact', bid: 0.75, status: 'Enabled', impressions: 0, clicks: 0, spend: 0, sales: 0, orders: 0 },
    ],
    searchTerms: [],
    negatives: [],
    budgetRules: [],
    productAds: [],
    ads: [],
    history: [],
  };
}

describe('TargetsTab — bid validation feedback', () => {
  it('marks the bid input invalid once it is typed below MIN_BID', () => {
    render(<TargetsTab campaign={makeCampaign()} />);
    const input = screen.getByLabelText('Bid for kw') as HTMLInputElement;

    expect(input.getAttribute('aria-invalid')).toBeNull();

    fireEvent.change(input, { target: { value: '0.01' } });

    expect(input.getAttribute('aria-invalid')).toBe('true');
    expect(input.title).toContain('Minimum bid is $0.02');
  });
});

describe('AdGroupsTab — bid validation feedback', () => {
  it('marks the default-bid NumberInput invalid once it is typed below its min (built into Astryx NumberInput via the min prop)', () => {
    render(<AdGroupsTab campaign={makeCampaign()} />);
    fireEvent.click(screen.getByRole('button', { name: /1 target/ }));

    const input = screen.getByLabelText('Default bid') as HTMLInputElement;
    expect(input.getAttribute('aria-invalid')).not.toBe('true');

    fireEvent.change(input, { target: { value: '0.01' } });

    expect(input.getAttribute('aria-invalid')).toBe('true');
  });
});
