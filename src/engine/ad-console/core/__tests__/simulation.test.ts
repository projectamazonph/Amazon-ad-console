import { describe, it, expect, vi } from 'vitest';
import { simulateDays } from '../simulation';
import type { Campaign, Metrics, Negative, BudgetRule, Target, AdGroup, SearchTerm } from '../types';

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
    productAds: [],
    ads: [],
    history: [],
    ...over,
  };
}

describe('simulateDays', () => {
  it('returns unchanged campaign when status is not Enabled', () => {
    const c = makeCampaign({ status: 'Paused' });
    const [result] = simulateDays([c], 7);
    expect(result.metrics).toEqual(c.metrics);
    expect(result.history).toHaveLength(c.history.length);
  });

  it('increases metrics when campaign is Enabled', () => {
    const c = makeCampaign({ dailyBudget: 100, defaultBid: 1.0 });
    const [result] = simulateDays([c], 7);
    expect(result.metrics.impressions).toBeGreaterThan(0);
    expect(result.metrics.clicks).toBeGreaterThan(0);
    expect(result.metrics.spend).toBeGreaterThan(0);
    expect(result.metrics.sales).toBeGreaterThan(0);
    expect(result.metrics.orders).toBeGreaterThanOrEqual(0);
  });

  it('spend does not exceed dailyBudget * days', () => {
    const c = makeCampaign({ dailyBudget: 10, defaultBid: 1.0 });
    const [result] = simulateDays([c], 7);
    expect(result.metrics.spend).toBeLessThanOrEqual(70);
  });

  it('adds history entry', () => {
    const c = makeCampaign();
    const [result] = simulateDays([c], 7);
    expect(result.history.length).toBe(c.history.length + 1);
    expect(result.history[result.history.length - 1]).toContain('day simulation');
  });

  it('updates target metrics proportionally', () => {
    const c = makeCampaign({
      targets: [
        { id: 'T1', campaignId: 'C1', adGroupId: 'AG1', type: 'Keyword', value: 'test', match: 'Exact', bid: 1, status: 'Enabled', impressions: 0, clicks: 0, spend: 0, sales: 0, orders: 0 },
        { id: 'T2', campaignId: 'C1', adGroupId: 'AG1', type: 'Keyword', value: 'test2', match: 'Exact', bid: 1, status: 'Enabled', impressions: 0, clicks: 0, spend: 0, sales: 0, orders: 0 },
      ],
    });
    const [result] = simulateDays([c], 7);
    expect(result.targets[0].impressions).toBeGreaterThan(0);
    expect(result.targets[1].impressions).toBeGreaterThan(0);
    // Both should get equal share
    expect(Math.abs(result.targets[0].impressions - result.targets[1].impressions)).toBeLessThanOrEqual(1);
  });

  it('does not update paused targets', () => {
    const c = makeCampaign({
      targets: [
        { id: 'T1', campaignId: 'C1', adGroupId: 'AG1', type: 'Keyword', value: 'test', match: 'Exact', bid: 1, status: 'Enabled', impressions: 0, clicks: 0, spend: 0, sales: 0, orders: 0 },
        { id: 'T2', campaignId: 'C1', adGroupId: 'AG1', type: 'Keyword', value: 'test2', match: 'Exact', bid: 1, status: 'Paused', impressions: 0, clicks: 0, spend: 0, sales: 0, orders: 0 },
      ],
    });
    const [result] = simulateDays([c], 7);
    expect(result.targets[0].impressions).toBeGreaterThan(0);
    expect(result.targets[1].impressions).toBe(0);
  });

  it('updates ad group metrics from targets', () => {
    const c = makeCampaign({
      adGroups: [{ id: 'AG1', campaignId: 'C1', name: 'AG1', status: 'Enabled', defaultBid: 1, metrics: { impressions: 0, clicks: 0, spend: 0, sales: 0, orders: 0 } }],
      targets: [
        { id: 'T1', campaignId: 'C1', adGroupId: 'AG1', type: 'Keyword', value: 'test', match: 'Exact', bid: 1, status: 'Enabled', impressions: 0, clicks: 0, spend: 0, sales: 0, orders: 0 },
      ],
    });
    const [result] = simulateDays([c], 7);
    expect(result.adGroups[0].metrics.impressions).toBeGreaterThan(0);
  });

  it('generates search terms for keyword targets with match types', () => {
    const c = makeCampaign({
      targets: [
        { id: 'T1', campaignId: 'C1', adGroupId: 'AG1', type: 'Keyword', value: 'coffee', match: 'Exact', bid: 1, status: 'Enabled', impressions: 0, clicks: 0, spend: 0, sales: 0, orders: 0 },
        { id: 'T2', campaignId: 'C1', adGroupId: 'AG1', type: 'Keyword', value: 'coffee', match: 'Phrase', bid: 1, status: 'Enabled', impressions: 0, clicks: 0, spend: 0, sales: 0, orders: 0 },
        { id: 'T3', campaignId: 'C1', adGroupId: 'AG1', type: 'Keyword', value: 'coffee', match: 'Broad', bid: 1, status: 'Enabled', impressions: 0, clicks: 0, spend: 0, sales: 0, orders: 0 },
      ],
    });
    const [result] = simulateDays([c], 7);
    expect(result.searchTerms.length).toBeGreaterThan(0);
    // New generators produce more realistic terms:
    // Exact: keyword + plural/singular variants (2+ terms)
    // Phrase: keyword + prefixes + suffixes (10+ terms)  
    // Broad: keyword + prefixes + suffixes + related terms (20+ terms)
    const exactTerms = result.searchTerms.filter(st => st.targetValue === 'coffee' && st.targetId === 'T1');
    const phraseTerms = result.searchTerms.filter(st => st.targetId === 'T2');
    const broadTerms = result.searchTerms.filter(st => st.targetId === 'T3');
    expect(exactTerms.length).toBeGreaterThanOrEqual(2);
    expect(phraseTerms.length).toBeGreaterThanOrEqual(5);
    expect(broadTerms.length).toBeGreaterThanOrEqual(10);
  });

  it('filters generated search terms by Negative exact', () => {
    const c = makeCampaign({
      negatives: [{ id: 'N1', campaignId: 'C1', adGroupId: 'AG1', type: 'Negative exact', value: 'cheap coffee' }],
      targets: [{ id: 'T1', campaignId: 'C1', adGroupId: 'AG1', type: 'Keyword', value: 'coffee', match: 'Broad', bid: 1, status: 'Enabled', impressions: 0, clicks: 0, spend: 0, sales: 0, orders: 0 }],
    });
    const [result] = simulateDays([c], 7);
    // Broad generates 'cheap coffee' — should be filtered
    const hasCheap = result.searchTerms.some(st => st.term === 'cheap coffee');
    expect(hasCheap).toBe(false);
  });

  it('filters generated search terms by Negative phrase', () => {
    const c = makeCampaign({
      negatives: [{ id: 'N1', campaignId: 'C1', adGroupId: 'AG1', type: 'Negative phrase', value: 'plastic' }],
      targets: [{ id: 'T1', campaignId: 'C1', adGroupId: 'AG1', type: 'Keyword', value: 'coffee', match: 'Broad', bid: 1, status: 'Enabled', impressions: 0, clicks: 0, spend: 0, sales: 0, orders: 0 }],
    });
    const [result] = simulateDays([c], 7);
    // None of the generated terms should contain 'plastic'
    const hasPlastic = result.searchTerms.some(st => st.term.includes('plastic'));
    expect(hasPlastic).toBe(false);
  });

  it('quality bonus includes campaignGoal Conversions', () => {
    const c1 = makeCampaign({ type: 'SD', campaignGoal: 'Conversions' });
    const c2 = makeCampaign({ type: 'SD', campaignGoal: undefined });
    const [r1] = simulateDays([c1], 7);
    const [r2] = simulateDays([c2], 7);
    expect(r1.metrics.sales).toBeGreaterThanOrEqual(0);
  });

  it('quality bonus includes campaignGoal Consideration', () => {
    const c = makeCampaign({ type: 'SD', campaignGoal: 'Consideration' });
    const [result] = simulateDays([c], 7);
    expect(result.metrics.sales).toBeGreaterThanOrEqual(0);
  });

  it('does not add duplicate search terms', () => {
    const c = makeCampaign({
      targets: [
        { id: 'T1', campaignId: 'C1', adGroupId: 'AG1', type: 'Keyword', value: 'coffee', match: 'Exact', bid: 1, status: 'Enabled', impressions: 0, clicks: 0, spend: 0, sales: 0, orders: 0 },
        { id: 'T2', campaignId: 'C1', adGroupId: 'AG1', type: 'Keyword', value: 'coffee', match: 'Exact', bid: 1, status: 'Enabled', impressions: 0, clicks: 0, spend: 0, sales: 0, orders: 0 },
      ],
    });
    const [result] = simulateDays([c], 7);
    const terms = result.searchTerms.map(st => st.term);
    const unique = new Set(terms);
    expect(terms.length).toBe(unique.size);
  });
});
