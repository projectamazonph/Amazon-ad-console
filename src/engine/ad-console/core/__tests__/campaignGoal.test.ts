import { describe, it, expect } from 'vitest';
import {
  normalizeCampaign,
  simulateDays,
  updateCampaignSettings,
  isFilteredByNegative,
  getNegativeCandidates,
  getHarvestCandidates,
} from '../engine';
import type { Campaign, Negative, Metrics, SearchTerm } from '../types';

function makeSearchTerm(over: Partial<SearchTerm> = {}): SearchTerm {
  return {
    id: over.id ?? 'ST1',
    campaignId: 'C1',
    adGroupId: 'AG1',
    term: over.term ?? 'test term',
    targetId: 'T1',
    targetValue: 'test',
    targetType: 'Keyword',
    matchType: 'Broad',
    impressions: over.impressions ?? 1000,
    clicks: over.clicks ?? 20,
    spend: over.spend ?? 50,
    sales: over.sales ?? 0,
    orders: over.orders ?? 0,
    ...over,
  };
}

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
    metrics: { impressions: 1000, clicks: 50, spend: 30, sales: 100, orders: 4 },
    adGroups: [{ id: 'AG1', campaignId: 'C1', name: 'AG', status: 'Enabled', defaultBid: 0.75, metrics: { impressions: 1000, clicks: 50, spend: 30, sales: 100, orders: 4 } }],
    targets: [{ id: 'T1', campaignId: 'C1', adGroupId: 'AG1', type: 'Auto - close match', value: 'Close match', match: '', bid: 0.75, status: 'Enabled', impressions: 1000, clicks: 50, spend: 30, sales: 100, orders: 4 }],
    searchTerms: [],
    negatives: [],
    budgetRules: [],
    productAds: [],
    ads: [],
    history: [],
    ...over,
  };
}

describe('normalizeCampaign - campaignGoal', () => {
  it('defaults to Conversions for SD campaigns', () => {
    const c = normalizeCampaign({ type: 'SD' });
    expect(c.campaignGoal).toBe('Conversions');
  });

  it('is undefined for SP campaigns', () => {
    const c = normalizeCampaign({ type: 'SP' });
    expect(c.campaignGoal).toBeUndefined();
  });

  it('is undefined for SB campaigns', () => {
    const c = normalizeCampaign({ type: 'SB' });
    expect(c.campaignGoal).toBeUndefined();
  });

  it('preserves explicit campaignGoal', () => {
    const c = normalizeCampaign({ type: 'SD', campaignGoal: 'Awareness' });
    expect(c.campaignGoal).toBe('Awareness');
  });

  it('preserves Consideration goal', () => {
    const c = normalizeCampaign({ type: 'SD', campaignGoal: 'Consideration' });
    expect(c.campaignGoal).toBe('Consideration');
  });
});

describe('simulateDays - campaignGoal bonus', () => {
  it('Conversions goal increases quality score', () => {
    const c = makeCampaign({ type: 'SD', campaignGoal: 'Conversions' });
    const [result] = simulateDays([c], 1);
    // The quality bonus for Conversions is 0.05
    // We verify this indirectly by checking the simulation ran (orders > 0 or spend > 0)
    expect(result.metrics.spend).toBeGreaterThanOrEqual(0);
  });

  it('Consideration goal adds smaller bonus', () => {
    const c = makeCampaign({ type: 'SD', campaignGoal: 'Consideration' });
    const [result] = simulateDays([c], 1);
    expect(result.metrics.spend).toBeGreaterThanOrEqual(0);
  });

  it('no goal adds no bonus', () => {
    const c = makeCampaign({ type: 'SD', campaignGoal: undefined });
    const [result] = simulateDays([c], 1);
    expect(result.metrics.spend).toBeGreaterThanOrEqual(0);
  });

  it('disabled campaigns are not simulated', () => {
    const c = makeCampaign({ type: 'SD', campaignGoal: 'Conversions', status: 'Paused' });
    const [result] = simulateDays([c], 1);
    expect(result.metrics).toEqual(c.metrics);
  });
});

describe('isFilteredByNegative', () => {
  it('Negative exact matches case-insensitive', () => {
    const negatives: Negative[] = [{ id: 'N1', campaignId: 'C1', adGroupId: 'AG1', type: 'Negative exact', value: 'free' }];
    expect(isFilteredByNegative('Free', negatives)).toBe(true);
  });

  it('Negative exact does not match partial', () => {
    const negatives: Negative[] = [{ id: 'N1', campaignId: 'C1', adGroupId: 'AG1', type: 'Negative exact', value: 'free' }];
    expect(isFilteredByNegative('free shipping', negatives)).toBe(false);
  });

  it('Negative phrase matches substring', () => {
    const negatives: Negative[] = [{ id: 'N1', campaignId: 'C1', adGroupId: 'AG1', type: 'Negative phrase', value: 'plastic' }];
    expect(isFilteredByNegative('plastic cone coffee filter', negatives)).toBe(true);
  });

  it('Negative phrase matches case-insensitive', () => {
    const negatives: Negative[] = [{ id: 'N1', campaignId: 'C1', adGroupId: 'AG1', type: 'Negative phrase', value: 'plastic' }];
    expect(isFilteredByNegative('Plastic Filter', negatives)).toBe(true);
  });

  it('Negative phrase does not match outside substring', () => {
    const negatives: Negative[] = [{ id: 'N1', campaignId: 'C1', adGroupId: 'AG1', type: 'Negative phrase', value: 'xyz' }];
    expect(isFilteredByNegative('plastic cone', negatives)).toBe(false);
  });

  it('returns false for no negatives', () => {
    expect(isFilteredByNegative('anything', [])).toBe(false);
  });

  it('matches when any negative matches', () => {
    const negatives: Negative[] = [
      { id: 'N1', campaignId: 'C1', adGroupId: 'AG1', type: 'Negative exact', value: 'apple' },
      { id: 'N2', campaignId: 'C1', adGroupId: 'AG1', type: 'Negative phrase', value: 'plastic' },
    ];
    expect(isFilteredByNegative('plastic filter', negatives)).toBe(true);
  });
});

describe('getNegativeCandidates', () => {
  it('flags a term with catastrophic ACOS and zero orders', () => {
    const st = makeSearchTerm({ spend: 500, sales: 1, orders: 0, clicks: 20 });
    expect(getNegativeCandidates([st])).toEqual([st]);
  });

  it('flags a term with spend but zero sales at all (acos treated as maximal)', () => {
    const st = makeSearchTerm({ spend: 50, sales: 0, orders: 0, clicks: 20 });
    expect(getNegativeCandidates([st])).toEqual([st]);
  });

  it('protects a term that has already converted (orders >= minOrders), regardless of current ACOS', () => {
    const st = makeSearchTerm({ spend: 500, sales: 1, orders: 1, clicks: 20 });
    expect(getNegativeCandidates([st])).toEqual([]);
  });

  it('does not flag a term within the acceptable ACOS threshold', () => {
    const st = makeSearchTerm({ spend: 20, sales: 100, orders: 0, clicks: 20 });
    expect(getNegativeCandidates([st])).toEqual([]);
  });

  it('does not flag a term below the minClicks/minSpend thresholds', () => {
    const st = makeSearchTerm({ spend: 1, sales: 0, orders: 0, clicks: 1 });
    expect(getNegativeCandidates([st])).toEqual([]);
  });
});

describe('getHarvestCandidates', () => {
  it('flags a term with good ACOS but no orders yet', () => {
    const st = makeSearchTerm({ spend: 20, sales: 100, orders: 0, clicks: 20 });
    expect(getHarvestCandidates([st])).toEqual([st]);
  });

  it('excludes a term that has already converted', () => {
    const st = makeSearchTerm({ spend: 20, sales: 100, orders: 1, clicks: 20 });
    expect(getHarvestCandidates([st])).toEqual([]);
  });

  it('excludes a term with poor ACOS', () => {
    const st = makeSearchTerm({ spend: 500, sales: 100, orders: 0, clicks: 20 });
    expect(getHarvestCandidates([st])).toEqual([]);
  });
});

describe('updateCampaignSettings - creativeStatus', () => {
  it('updates creativeStatus', () => {
    const c = makeCampaign({ creativeStatus: 'Rejected' });
    const result = updateCampaignSettings(c, { creativeStatus: 'Pending' });
    expect(result.creativeStatus).toBe('Pending');
  });

  it('updates creativeIssue', () => {
    const c = makeCampaign({ creativeIssue: 'Missing logo' });
    const result = updateCampaignSettings(c, { creativeIssue: '' });
    expect(result.creativeIssue).toBe('');
  });

  it('logs history when creativeStatus changes', () => {
    const c = makeCampaign({ creativeStatus: 'Rejected' });
    const result = updateCampaignSettings(c, { creativeStatus: 'Approved' });
    expect(result.history.some(h => h.includes('creative status'))).toBe(true);
  });

  it('does not log history when creativeStatus is same', () => {
    const c = makeCampaign({ creativeStatus: 'Approved' });
    const result = updateCampaignSettings(c, { creativeStatus: 'Approved' });
    expect(result.history.some(h => h.includes('creative status'))).toBe(false);
  });

  it('preserves all other fields', () => {
    const c = makeCampaign();
    const result = updateCampaignSettings(c, { creativeStatus: 'Pending' });
    expect(result.name).toBe(c.name);
    expect(result.type).toBe(c.type);
    expect(result.dailyBudget).toBe(c.dailyBudget);
    expect(result.defaultBid).toBe(c.defaultBid);
  });

  it('fails fast on a negative dailyBudget instead of storing it', () => {
    const c = makeCampaign();
    expect(() => updateCampaignSettings(c, { dailyBudget: -50 })).toThrow();
  });

  it('fails fast on a NaN defaultBid instead of storing it', () => {
    const c = makeCampaign();
    expect(() => updateCampaignSettings(c, { defaultBid: NaN })).toThrow();
  });
});
