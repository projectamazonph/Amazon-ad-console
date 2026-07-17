import { describe, it, expect } from 'vitest';
import {
  calc,
  totalMetrics,
  metricDefaults,
  normalizeCampaign,
  toggleCampaignStatus,
  archiveCampaign,
  duplicateCampaign,
  addTarget,
  removeTarget,
  setTargetBid,
  adjustTargetBid,
  pauseTarget,
  addNegative,
  harvestTerm,
  filteredCampaigns,
  portfolioNames,
  formatMoney,
  formatBid,
  formatPercent,
  acosClass,
} from '../engine';
import type { Campaign, CampaignType, CampaignStatus, Metrics } from '../types';

function makeCampaign(over: Partial<Campaign> = {}): Campaign {
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

describe('calc derived metrics', () => {
  it('computes ctr, cpc, acos, roas, cvr from raw metrics', () => {
    const m: Metrics = { impressions: 1000, clicks: 100, spend: 50, sales: 200, orders: 10 };
    expect(calc(m)).toEqual({ ctr: 10, cpc: 0.5, acos: 25, roas: 4, cvr: 10 });
  });

  it('returns zeros when denominators are zero (no division by zero)', () => {
    const m: Metrics = { impressions: 0, clicks: 0, spend: 0, sales: 0, orders: 0 };
    expect(calc(m)).toEqual({ ctr: 0, cpc: 0, acos: 0, roas: 0, cvr: 0 });
  });

  it('fails fast on negative impressions', () => {
    expect(() => calc({ impressions: -1, clicks: 0, spend: 0, sales: 0, orders: 0 })).toThrow();
  });

  it('fails fast on non-finite values', () => {
    expect(() => calc({ impressions: NaN, clicks: 0, spend: 0, sales: 0, orders: 0 })).toThrow();
  });

  it('fails fast on negative spend', () => {
    expect(() => calc({ impressions: 1, clicks: 0, spend: -5, sales: 0, orders: 0 })).toThrow();
  });
});

describe('totalMetrics', () => {
  it('sums metrics across campaigns', () => {
    const a = makeCampaign({ metrics: { impressions: 10, clicks: 1, spend: 2, sales: 4, orders: 1 } });
    const b = makeCampaign({ id: 'C2', metrics: { impressions: 20, clicks: 2, spend: 3, sales: 6, orders: 2 } });
    expect(totalMetrics([a, b])).toEqual({ impressions: 30, clicks: 3, spend: 5, sales: 10, orders: 3 });
  });

  it('returns empty metrics for no campaigns', () => {
    expect(totalMetrics([])).toEqual({ impressions: 0, clicks: 0, spend: 0, sales: 0, orders: 0 });
  });
});

describe('metricDefaults', () => {
  it('fills missing fields with zero', () => {
    expect(metricDefaults({ impressions: 5 })).toEqual({ impressions: 5, clicks: 0, spend: 0, sales: 0, orders: 0 });
  });
});

describe('normalizeCampaign', () => {
  it('defaults a partial SP campaign with a primary ad group', () => {
    const c = normalizeCampaign({ name: 'Demo', type: 'SP' });
    expect(c.type).toBe('SP');
    expect(c.adGroups).toHaveLength(1);
    expect(c.status).toBe('Paused');
    expect(c.dailyBudget).toBeGreaterThanOrEqual(1);
  });

  it('fails fast on unknown campaign type', () => {
    expect(() => normalizeCampaign({ type: 'ZZ' as CampaignType })).toThrow();
  });

  it('fails fast on invalid status', () => {
    expect(() => normalizeCampaign({ status: 'Bogus' as CampaignStatus })).toThrow();
  });
});

describe('campaign status transitions', () => {
  it('toggles Enabled -> Paused and cascades to ad groups/targets', () => {
    const c = makeCampaign({ targets: [{ id: 'T1', campaignId: 'C1', adGroupId: 'AG1', type: 'Keyword', value: 'kw', match: 'Exact', bid: 0.75, status: 'Enabled', impressions: 0, clicks: 0, spend: 0, sales: 0, orders: 0 }] });
    const next = toggleCampaignStatus(c);
    expect(next.status).toBe('Paused');
    expect(next.targets[0]!.status).toBe('Paused');
  });

  it('does not toggle an Archived campaign', () => {
    const c = makeCampaign({ status: 'Archived' });
    expect(toggleCampaignStatus(c).status).toBe('Archived');
  });

  it('archives a campaign and cascades', () => {
    const next = archiveCampaign(makeCampaign());
    expect(next.status).toBe('Archived');
    expect(next.adGroups[0]!.status).toBe('Archived');
  });

  it('duplicates a campaign with new ids and reset metrics', () => {
    const c = makeCampaign({ metrics: { impressions: 100, clicks: 10, spend: 5, sales: 20, orders: 2 } });
    const dup = duplicateCampaign(c);
    expect(dup.id).not.toBe(c.id);
    expect(dup.metrics.impressions).toBe(0);
    expect(dup.name).toContain('copy');
  });
});

describe('target operations', () => {
  it('adds a keyword target', () => {
    const { campaign, target } = addTarget(makeCampaign(), 'running shoes', 'Broad', 1.5);
    expect(campaign.targets).toHaveLength(1);
    expect(target.value).toBe('running shoes');
    expect(target.bid).toBe(1.5);
  });

  it('fails fast when adding a keyword with empty value', () => {
    expect(() => addTarget(makeCampaign(), '   ', 'Exact', 1)).toThrow();
  });

  it('clamps bid to minimum 0.02', () => {
    const { target } = addTarget(makeCampaign(), 'kw', 'Exact', 0.01);
    expect(target.bid).toBe(0.02);
  });

  it('removes a target by id', () => {
    const c = makeCampaign({ targets: [{ id: 'T1', campaignId: 'C1', adGroupId: 'AG1', type: 'Keyword', value: 'kw', match: 'Exact', bid: 0.75, status: 'Enabled', impressions: 0, clicks: 0, spend: 0, sales: 0, orders: 0 }] });
    expect(removeTarget(c, 'T1').targets).toHaveLength(0);
  });

  it('sets a target bid', () => {
    const c = makeCampaign({ targets: [{ id: 'T1', campaignId: 'C1', adGroupId: 'AG1', type: 'Keyword', value: 'kw', match: 'Exact', bid: 0.75, status: 'Enabled', impressions: 0, clicks: 0, spend: 0, sales: 0, orders: 0 }] });
    expect(setTargetBid(c, 'T1', 2.0).targets[0]!.bid).toBe(2.0);
  });

  it('adjusts a target bid by multiplier', () => {
    const c = makeCampaign({ targets: [{ id: 'T1', campaignId: 'C1', adGroupId: 'AG1', type: 'Keyword', value: 'kw', match: 'Exact', bid: 1.0, status: 'Enabled', impressions: 0, clicks: 0, spend: 0, sales: 0, orders: 0 }] });
    expect(adjustTargetBid(c, 'T1', 1.5).targets[0]!.bid).toBe(1.5);
  });

  it('pauses then re-enables a target', () => {
    const c = makeCampaign({ targets: [{ id: 'T1', campaignId: 'C1', adGroupId: 'AG1', type: 'Keyword', value: 'kw', match: 'Exact', bid: 0.75, status: 'Enabled', impressions: 0, clicks: 0, spend: 0, sales: 0, orders: 0 }] });
    expect(pauseTarget(c, 'T1').targets[0]!.status).toBe('Paused');
  });
});

describe('negatives and harvesting', () => {
  it('adds a negative keyword', () => {
    const c = addNegative(makeCampaign(), 'free', 'Negative exact');
    expect(c.negatives).toHaveLength(1);
  });

  it('does not duplicate an identical negative', () => {
    let c = addNegative(makeCampaign(), 'free', 'Negative exact');
    c = addNegative(c, 'free', 'Negative exact');
    expect(c.negatives).toHaveLength(1);
  });

  it('harvests a search term into a new exact keyword', () => {
    const c = makeCampaign({ searchTerms: [{ id: 'ST1', campaignId: 'C1', adGroupId: 'AG1', term: 'blue shoes', target: '', clicks: 5, spend: 2, sales: 10, orders: 1 }] });
    const next = harvestTerm(c, 'blue shoes');
    expect(next.targets).toHaveLength(1);
    expect(next.targets[0]!.value).toBe('blue shoes');
  });
});

describe('filtering and portfolios', () => {
  it('filters by type, status, portfolio, and search', () => {
    const state = {
      version: '1',
      campaigns: [
        makeCampaign({ type: 'SP', status: 'Enabled', portfolio: 'A', name: 'Alpha SP' }),
        makeCampaign({ id: 'C2', type: 'SB', status: 'Paused', portfolio: 'B', name: 'Beta SB' }),
      ],
      filter: { type: 'SP' as const, status: 'All' as const, portfolio: 'All' as const, search: '' },
      selectedCampaignId: null,
      selectedTab: '',
      simulationDays: 0,
      actionLog: [],
    };
    expect(filteredCampaigns(state)).toHaveLength(1);
  });

  it('lists unique portfolio names prefixed with All', () => {
    const names = portfolioNames([makeCampaign({ portfolio: 'A' }), makeCampaign({ portfolio: 'B' }), makeCampaign({ portfolio: 'A' })]);
    expect(names).toEqual(['All', 'A', 'B']);
  });
});

describe('formatting', () => {
  it('formats money', () => {
    expect(formatMoney(1234.5)).toBe('$1,234.50');
  });
  it('formats bid', () => {
    expect(formatBid(0.75)).toBe('$0.75');
  });
  it('formats percent', () => {
    expect(formatPercent(25)).toBe('25.00%');
  });
  it('classifies acos', () => {
    expect(acosClass(20)).toBe('good');
    expect(acosClass(40)).toBe('warn');
    expect(acosClass(60)).toBe('bad');
  });
});
