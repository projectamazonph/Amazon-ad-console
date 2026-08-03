import { describe, it, expect } from 'vitest';
import {
  calc,
  formatMoney,
  formatWhole,
  formatPercent,
  formatBid,
  formatRoas,
  acosClass,
  toggleCampaignStatus,
  archiveCampaign,
  duplicateCampaign,
  addTarget,
  addKeyword,
  addAutoTarget,
  addAsinTarget,
  addCategoryTarget,
  removeTarget,
  setTargetBid,
  adjustTargetBid,
  pauseTarget,
  setTargetStatus,
  addNegative,
  harvestTerm,
  simulateDays,
  filteredCampaigns,
  campaignById,
  totalMetrics,
  normalizeCampaign,
} from '../engine';
import type { Campaign, CampaignType, CampaignStatus, Metrics, Target, SearchTerm, Negative } from '../types';

function makeCampaign(over: Partial<Campaign> = {}): Campaign {
  const base: Campaign = {
    id: over.id ?? 'C1',
    type: over.type ?? 'SP',
    name: over.name ?? 'Test',
    portfolio: over.portfolio ?? 'Training Portfolio',
    status: over.status ?? 'Enabled',
    dailyBudget: over.dailyBudget ?? 10,
    defaultBid: over.defaultBid ?? 0.75,
    startDate: over.startDate ?? '2026-01-01',
    endDate: over.endDate ?? null,
    targetingMode: over.targetingMode ?? 'Automatic',
    adFormat: over.adFormat ?? 'Standard',
    bidStrategy: over.bidStrategy ?? 'Dynamic bids - down only',
    placements: over.placements ?? { top: 0, product: 0, rest: 0 },
    products: over.products ?? ['B0TRAIN001'],
    creative: over.creative ?? null,
    metrics: over.metrics ?? { impressions: 0, clicks: 0, spend: 0, sales: 0, orders: 0 },
    adGroups: over.adGroups ?? [{ id: 'AG1', campaignId: 'C1', name: 'Default AG', status: 'Enabled', defaultBid: 0.75, metrics: { impressions: 0, clicks: 0, spend: 0, sales: 0, orders: 0 } }],
    targets: over.targets ?? [],
    searchTerms: over.searchTerms ?? [],
    negatives: over.negatives ?? [],
    budgetRules: over.budgetRules ?? [],
    productAds: over.productAds ?? [],
    ads: over.ads ?? [],
    history: over.history ?? [],
    createdBySimulator: true,
  };
  // Spread after to allow overriding computed fields
  return { ...base, ...over } as Campaign;
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
});

describe('format helpers', () => {
  it('formatMoney formats dollars', () => {
    expect(formatMoney(1234.567)).toBe('$1,234.57');
  });
  it('formatWhole formats integers', () => {
    expect(formatWhole(1234)).toBe('1,234');
  });
  it('formatPercent formats as percent with one decimal', () => {
    expect(formatPercent(25.5)).toBe('25.5%');
  });
  it('formatBid formats bid with two decimals', () => {
    expect(formatBid(1.234)).toBe('$1.23');
  });
  it('formatRoas formats roas with two decimals and x', () => {
    expect(formatRoas(3.5)).toBe('3.50x');
  });
  it('acosClass returns correct class', () => {
    expect(acosClass(10)).toBe('good');
    expect(acosClass(25)).toBe('warn');
    expect(acosClass(50)).toBe('bad');
  });
});

describe('campaign status toggling', () => {
  it('toggles Enabled to Paused and cascades to ad groups and targets', () => {
    const c = makeCampaign({ status: 'Enabled' });
    const next = toggleCampaignStatus(c);
    expect(next.status).toBe('Paused');
    expect(next.adGroups.every((ag) => ag.status === 'Paused')).toBe(true);
    expect(next.targets.every((t) => t.status === 'Paused')).toBe(true);
  });

  it('toggles Paused to Enabled', () => {
    const c = makeCampaign({ status: 'Paused' });
    const next = toggleCampaignStatus(c);
    expect(next.status).toBe('Enabled');
  });

  it('does nothing for Archived', () => {
    const c = makeCampaign({ status: 'Archived' });
    expect(toggleCampaignStatus(c).status).toBe('Archived');
  });

  it('archives a campaign and cascades', () => {
    const c = makeCampaign({ status: 'Enabled' });
    const next = archiveCampaign(c);
    expect(next.status).toBe('Archived');
    expect(next.adGroups[0]!.status).toBe('Archived');
    expect(next.targets[0]?.status ?? true).toBe(true); // no targets initially
  });

  it('duplicates a campaign with new ids and reset metrics', () => {
    const c = makeCampaign({ metrics: { impressions: 100, clicks: 10, spend: 5, sales: 20, orders: 2 } });
    const dup = duplicateCampaign(c);
    expect(dup.id).not.toBe(c.id);
    expect(dup.metrics.impressions).toBe(0);
    expect(dup.name).toContain('copy');
  });

  it('preserves per-ad-group target distribution when duplicating a multi-ad-group campaign', () => {
    const c = makeCampaign({
      adGroups: [
        { id: 'AG1', campaignId: 'C1', name: 'AG1', status: 'Enabled', defaultBid: 0.75, metrics: { impressions: 0, clicks: 0, spend: 0, sales: 0, orders: 0 } },
        { id: 'AG2', campaignId: 'C1', name: 'AG2', status: 'Enabled', defaultBid: 0.75, metrics: { impressions: 0, clicks: 0, spend: 0, sales: 0, orders: 0 } },
      ],
      targets: [
        { id: 'T1', campaignId: 'C1', adGroupId: 'AG1', type: 'Keyword', value: 'a', match: 'Exact', bid: 1, status: 'Enabled', impressions: 0, clicks: 0, spend: 0, sales: 0, orders: 0 },
        { id: 'T2', campaignId: 'C1', adGroupId: 'AG2', type: 'Keyword', value: 'b', match: 'Exact', bid: 1, status: 'Enabled', impressions: 0, clicks: 0, spend: 0, sales: 0, orders: 0 },
        { id: 'T3', campaignId: 'C1', adGroupId: 'AG2', type: 'Keyword', value: 'c', match: 'Exact', bid: 1, status: 'Enabled', impressions: 0, clicks: 0, spend: 0, sales: 0, orders: 0 },
      ],
    });
    const dup = duplicateCampaign(c);
    expect(dup.adGroups).toHaveLength(2);
    const [newAg1, newAg2] = dup.adGroups;
    const targetsByAg = (agId: string) => dup.targets.filter((t) => t.adGroupId === agId);
    expect(targetsByAg(newAg1.id)).toHaveLength(1);
    expect(targetsByAg(newAg2.id)).toHaveLength(2);
    expect(dup.targets.map((t) => t.value).sort()).toEqual(['a', 'b', 'c']);
  });
});

describe('target operations', () => {
  it('adds a keyword target', () => {
    const { campaign, target } = addKeyword(makeCampaign(), 'running shoes', 'Broad', 1.5);
    expect(campaign.targets).toHaveLength(1);
    expect(target.value).toBe('running shoes');
    expect(target.bid).toBe(1.5);
  });

  it('fails fast when adding a keyword with empty value', () => {
    expect(() => addKeyword(makeCampaign(), '   ', 'Exact', 1)).toThrow();
  });

  it('clamps bid to minimum 0.02', () => {
    const { target } = addKeyword(makeCampaign(), 'kw', 'Exact', 0.01);
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

  it('fails fast on a NaN bid instead of silently storing NaN', () => {
    const c = makeCampaign({ targets: [{ id: 'T1', campaignId: 'C1', adGroupId: 'AG1', type: 'Keyword', value: 'kw', match: 'Exact', bid: 0.75, status: 'Enabled', impressions: 0, clicks: 0, spend: 0, sales: 0, orders: 0 }] });
    expect(() => setTargetBid(c, 'T1', NaN)).toThrow();
  });

  it('fails fast on a negative bid', () => {
    const c = makeCampaign({ targets: [{ id: 'T1', campaignId: 'C1', adGroupId: 'AG1', type: 'Keyword', value: 'kw', match: 'Exact', bid: 0.75, status: 'Enabled', impressions: 0, clicks: 0, spend: 0, sales: 0, orders: 0 }] });
    expect(() => setTargetBid(c, 'T1', -5)).toThrow();
  });

  it('pauses then re-enables a target', () => {
    const c = makeCampaign({ targets: [{ id: 'T1', campaignId: 'C1', adGroupId: 'AG1', type: 'Keyword', value: 'kw', match: 'Exact', bid: 0.75, status: 'Enabled', impressions: 0, clicks: 0, spend: 0, sales: 0, orders: 0 }] });
    expect(pauseTarget(c, 'T1').targets[0]!.status).toBe('Paused');
  });

  it('pauseTarget is a no-op for an unknown target id (no blank history entry)', () => {
    const c = makeCampaign({ targets: [{ id: 'T1', campaignId: 'C1', adGroupId: 'AG1', type: 'Keyword', value: 'kw', match: 'Exact', bid: 0.75, status: 'Enabled', impressions: 0, clicks: 0, spend: 0, sales: 0, orders: 0 }] });
    const result = pauseTarget(c, 'does-not-exist');
    expect(result).toBe(c);
    expect(result.history).not.toContain('');
  });
});

describe('negatives and harvesting', () => {
  it('adds a negative keyword', () => {
    const c = addNegative({ campaign: makeCampaign(), value: 'free', type: 'Negative exact' });
    expect(c.negatives).toHaveLength(1);
  });

  it('does not duplicate an identical negative', () => {
    let c = addNegative({ campaign: makeCampaign(), value: 'free', type: 'Negative exact' });
    c = addNegative({ campaign: c, value: 'free', type: 'Negative exact' });
    expect(c.negatives).toHaveLength(1);
  });

  it('harvests a search term into a new exact keyword', () => {
    const c = makeCampaign({ searchTerms: [{ id: 'ST1', campaignId: 'C1', adGroupId: 'AG1', term: 'blue shoes', targetId: '', targetValue: '', targetType: 'Keyword', matchType: '', clicks: 5, spend: 2, sales: 10, orders: 1, impressions: 0 }] });
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
      filter: { type: 'SP' as CampaignType, status: 'Enabled' as CampaignStatus, portfolio: 'All', search: '' },
      selectedCampaignId: null,
      selectedTab: 'overview',
      simulationDays: 7,
      actionLog: [],
      portfolios: ['A', 'B'],
    };
    const filtered = filteredCampaigns(state);
    expect(filtered).toHaveLength(1);
    expect(filtered[0].type).toBe('SP');
  });

  it('finds campaign by id', () => {
    const c = makeCampaign({ id: 'C1' });
    const found = campaignById({ version: '3.6', campaigns: [c], filter: { type: 'All', status: 'All', portfolio: 'All', search: '' }, selectedCampaignId: null, selectedTab: 'overview', simulationDays: 7, actionLog: [], portfolios: [] }, 'C1');
    expect(found).toBe(c);
  });
});

describe('simulation', () => {
  it('runs a 7-day simulation and updates metrics', () => {
    const c = makeCampaign({ status: 'Enabled', targets: [{ id: 'T1', campaignId: 'C1', adGroupId: 'AG1', type: 'Keyword', value: 'kw', match: 'Exact', bid: 0.75, status: 'Enabled', impressions: 0, clicks: 0, spend: 0, sales: 0, orders: 0 }] });
    const [result] = simulateDays([c], 7);
    expect(result.metrics.impressions).toBeGreaterThan(0);
    expect(result.metrics.spend).toBeGreaterThan(0);
    expect(result.history[result.history.length - 1]).toContain('simulation');
  });

  it('does not simulate paused campaigns', () => {
    const c = makeCampaign({ status: 'Paused' });
    const [result] = simulateDays([c], 7);
    expect(result.metrics.impressions).toBe(0);
  });
});

describe('campaign creation flow', () => {
  it('normalizeCampaign builds a valid campaign from launch input', () => {
    const id = 'C-SP-test123';
    const agId = 'AG-C-SP-test123';
    const targets = [
      { id: 'T-test1', campaignId: id, adGroupId: agId, type: 'Keyword' as const, value: 'coffee filter', match: 'Exact' as const, bid: 0.75, status: 'Enabled' as CampaignStatus, impressions: 0, clicks: 0, spend: 0, sales: 0, orders: 0 },
    ];
    const campaign = normalizeCampaign({
      id, type: 'SP', name: 'Launch Test', portfolio: 'Test',
      status: 'Enabled', dailyBudget: 25, defaultBid: 0.75,
      bidStrategy: 'Dynamic bids - down only', targetingMode: 'Automatic',
      products: ['B0TRAIN001'],
      metrics: { impressions: 0, clicks: 0, spend: 0, sales: 0, orders: 0 },
      adGroups: [{ id: agId, campaignId: id, name: 'SP training ad group', status: 'Enabled', defaultBid: 0.75, metrics: { impressions: 0, clicks: 0, spend: 0, sales: 0, orders: 0 } }],
      targets, searchTerms: [], negatives: [], budgetRules: [],
      history: ['Campaign launched in simulator'],
    });
    expect(campaign.id).toBe(id);
    expect(campaign.name).toBe('Launch Test');
    expect(campaign.productAds).toEqual([]);
    expect(campaign.ads).toEqual([]);
    expect(campaign.targets).toHaveLength(1);
    expect(campaign.adGroups).toHaveLength(1);
    expect(campaign.history).toContain('Campaign launched in simulator');
  });

  it('launch handles keywords from draft text fields', () => {
    const id = 'C-SP-launch2';
    const agId = 'AG-C-SP-launch2';
    const targets = [
      { id: 'T-kw1', campaignId: id, adGroupId: agId, type: 'Keyword' as const, value: 'coffee filter', match: 'Exact' as const, bid: 0.75, status: 'Enabled' as CampaignStatus, impressions: 0, clicks: 0, spend: 0, sales: 0, orders: 0 },
      { id: 'T-kw2', campaignId: id, adGroupId: agId, type: 'Keyword' as const, value: 'coffee maker', match: 'Exact' as const, bid: 0.75, status: 'Enabled' as CampaignStatus, impressions: 0, clicks: 0, spend: 0, sales: 0, orders: 0 },
    ];
    const campaign = normalizeCampaign({
      id, type: 'SP', name: 'Keyword Test', portfolio: 'Test',
      status: 'Enabled', dailyBudget: 25, defaultBid: 0.75,
      bidStrategy: 'Dynamic bids - down only', targetingMode: 'Automatic',
      products: ['B0TRAIN001'],
      metrics: { impressions: 0, clicks: 0, spend: 0, sales: 0, orders: 0 },
      adGroups: [{ id: agId, campaignId: id, name: 'SP training ad group', status: 'Enabled', defaultBid: 0.75, metrics: { impressions: 0, clicks: 0, spend: 0, sales: 0, orders: 0 } }],
      targets, searchTerms: [], negatives: [], budgetRules: [],
      history: [],
    });
    expect(campaign.targets).toHaveLength(2);
    expect(campaign.targets[0].value).toBe('coffee filter');
    expect(campaign.targets[1].value).toBe('coffee maker');
  });
});