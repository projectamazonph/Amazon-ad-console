import { describe, it, expect } from 'vitest';
import {
  createPortfolio,
  renamePortfolio,
  deletePortfolio,
  assignCampaignToPortfolio,
} from '../engine';
import type { Campaign } from '../types';

function makeCampaign(over: Partial<Campaign> = {}): Campaign {
  return {
    id: 'C1',
    type: 'SP',
    name: 'Test',
    portfolio: 'Default',
    status: 'Enabled',
    dailyBudget: 10,
    defaultBid: 0.75,
    startDate: '2026-01-01',
    endDate: null,
    targetingMode: 'Automatic',
    adFormat: 'Standard',
    bidStrategy: 'Dynamic bids - down only',
    placements: { top: 0, product: 0, rest: 0 },
    products: ['B0TRAIN001'],
    creative: null,
    metrics: { impressions: 0, clicks: 0, spend: 0, sales: 0, orders: 0 },
    adGroups: [{ id: 'AG1', campaignId: 'C1', name: 'AG', status: 'Enabled', defaultBid: 0.75, metrics: { impressions: 0, clicks: 0, spend: 0, sales: 0, orders: 0 } }],
    targets: [],
    searchTerms: [],
    negatives: [],
    budgetRules: [],
    history: [],
    ...over,
  };
}

describe('createPortfolio', () => {
  it('appends a new portfolio name to the list', () => {
    const result = createPortfolio(['Default'], 'Brand Campaigns');
    expect(result).toEqual(['Default', 'Brand Campaigns']);
  });

  it('starts a list when there are none', () => {
    const result = createPortfolio([], 'First Portfolio');
    expect(result).toEqual(['First Portfolio']);
  });

  it('fails fast on empty name', () => {
    expect(() => createPortfolio([], '   ')).toThrow();
  });

  it('does not duplicate an existing name', () => {
    const result = createPortfolio(['Default', 'Brand'], 'Brand');
    expect(result).toEqual(['Default', 'Brand']);
  });
});

describe('renamePortfolio', () => {
  it('renames in the portfolio list and in all campaigns using the old name', () => {
    const campaigns = [
      makeCampaign({ id: 'C1', portfolio: 'Old Name' }),
      makeCampaign({ id: 'C2', portfolio: 'Old Name' }),
      makeCampaign({ id: 'C3', portfolio: 'Other' }),
    ];
    const { portfolios, campaigns: updated } = renamePortfolio(
      ['Old Name', 'Other'],
      campaigns,
      'Old Name',
      'New Name',
    );
    expect(portfolios).toEqual(['New Name', 'Other']);
    expect(updated[0]!.portfolio).toBe('New Name');
    expect(updated[1]!.portfolio).toBe('New Name');
    expect(updated[2]!.portfolio).toBe('Other');
  });

  it('fails fast on unknown old name', () => {
    expect(() => renamePortfolio(['A', 'B'], [], 'Unknown', 'X')).toThrow();
  });

  it('fails fast on empty new name', () => {
    expect(() => renamePortfolio(['A'], [], 'A', '   ')).toThrow();
  });
});

describe('deletePortfolio', () => {
  it('removes from the list and unassigns campaigns using it', () => {
    const campaigns = [
      makeCampaign({ id: 'C1', portfolio: 'To Delete' }),
      makeCampaign({ id: 'C2', portfolio: 'Keep' }),
    ];
    const { portfolios, campaigns: updated } = deletePortfolio(
      ['To Delete', 'Keep'],
      campaigns,
      'To Delete',
    );
    expect(portfolios).toEqual(['Keep']);
    expect(updated[0]!.portfolio).toBe('');
    expect(updated[1]!.portfolio).toBe('Keep');
  });

  it('fails fast on unknown portfolio name', () => {
    expect(() => deletePortfolio(['A'], [], 'Unknown')).toThrow();
  });

  it('does not remove the last portfolio', () => {
    expect(() => deletePortfolio(['Last'], [makeCampaign()], 'Last')).toThrow();
  });
});

describe('assignCampaignToPortfolio', () => {
  it('assigns an existing campaign to a portfolio', () => {
    const campaigns = [
      makeCampaign({ id: 'C1', portfolio: 'Default' }),
      makeCampaign({ id: 'C2', portfolio: 'Default' }),
    ];
    const updated = assignCampaignToPortfolio(campaigns, 'C2', 'Premium');
    expect(updated[1]!.portfolio).toBe('Premium');
    expect(updated[0]!.portfolio).toBe('Default');
  });

  it('fails fast on unknown campaign id', () => {
    expect(() => assignCampaignToPortfolio([makeCampaign()], 'NOPE', 'X')).toThrow();
  });

  it('fails fast on empty portfolio name', () => {
    expect(() => assignCampaignToPortfolio([makeCampaign()], 'C1', '')).toThrow();
  });
});
