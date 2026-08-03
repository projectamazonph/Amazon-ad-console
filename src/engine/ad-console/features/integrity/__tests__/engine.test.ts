import { describe, it, expect, vi } from 'vitest';
import { runIntegrityCheck } from '../engine';
import type { Campaign } from '../../../core/types';

function baseCampaign(over: Partial<Campaign> = {}): Campaign {
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

describe('runIntegrityCheck', () => {
  it('passes a clean campaign with a full score', () => {
    const report = runIntegrityCheck([baseCampaign()]);
    expect(report.issues).toHaveLength(0);
    expect(report.score).toBe(100);
    expect(report.passed).toBe(true);
  });

  it('flags an archived campaign with an active target as error', () => {
    const report = runIntegrityCheck([
      baseCampaign({
        status: 'Archived',
        targets: [{ id: 'T1', campaignId: 'C1', adGroupId: 'AG1', type: 'Keyword', value: 'kw', match: 'Exact', bid: 0.75, status: 'Enabled', impressions: 0, clicks: 0, spend: 0, sales: 0, orders: 0 }],
      }),
    ]);
    expect(report.issues.some((i) => i.severity === 'error' && i.entityType === 'target')).toBe(true);
    // one error penalties 15 -> score 85, still passing
    expect(report.passed).toBe(true);
  });

  it('fails when three archived-campaign errors drop the score below 70', () => {
    const report = runIntegrityCheck([
      baseCampaign({
        status: 'Archived',
        targets: [
          { id: 'T1', campaignId: 'C1', adGroupId: 'AG1', type: 'Keyword', value: 'a', match: 'Exact', bid: 0.75, status: 'Enabled', impressions: 0, clicks: 0, spend: 0, sales: 0, orders: 0 },
          { id: 'T2', campaignId: 'C1', adGroupId: 'AG1', type: 'Keyword', value: 'b', match: 'Exact', bid: 0.75, status: 'Enabled', impressions: 0, clicks: 0, spend: 0, sales: 0, orders: 0 },
          { id: 'T3', campaignId: 'C1', adGroupId: 'AG1', type: 'Keyword', value: 'c', match: 'Exact', bid: 0.75, status: 'Enabled', impressions: 0, clicks: 0, spend: 0, sales: 0, orders: 0 },
        ],
      }),
    ]);
    expect(report.issues.filter((i) => i.severity === 'error').length).toBe(3);
    // 3 errors * 15 penalty = 55, below the 70 pass threshold
    expect(report.passed).toBe(false);
  });

  it('flags duplicate target ids', () => {
    const report = runIntegrityCheck([
      baseCampaign({
        targets: [
          { id: 'T1', campaignId: 'C1', adGroupId: 'AG1', type: 'Keyword', value: 'a', match: 'Exact', bid: 0.75, status: 'Enabled', impressions: 0, clicks: 0, spend: 0, sales: 0, orders: 0 },
          { id: 'T1', campaignId: 'C1', adGroupId: 'AG1', type: 'Keyword', value: 'b', match: 'Exact', bid: 0.75, status: 'Enabled', impressions: 0, clicks: 0, spend: 0, sales: 0, orders: 0 },
        ],
      }),
    ]);
    expect(report.issues.some((i) => i.message.includes('Duplicate target ID'))).toBe(true);
  });

  it('flags orphaned search terms for non-SD campaigns', () => {
    const report = runIntegrityCheck([
      baseCampaign({
        searchTerms: [{ id: 'ST1', campaignId: 'C1', adGroupId: 'AG1', term: 'blue shoes', targetId: '', targetValue: '', targetType: 'Keyword', matchType: '', impressions: 0, clicks: 0, spend: 0, sales: 0, orders: 0 }],
      }),
    ]);
    expect(report.issues.some((i) => i.entityType === 'searchTerm')).toBe(true);
  });

  it('does not flag SD search terms (expected for SD)', () => {
    const report = runIntegrityCheck([
      baseCampaign({
        type: 'SD',
        searchTerms: [{ id: 'ST1', campaignId: 'C1', adGroupId: 'AG1', term: 'x', targetId: '', targetValue: '', targetType: 'Keyword', matchType: '', impressions: 0, clicks: 0, spend: 0, sales: 0, orders: 0 }],
      }),
    ]);
    expect(report.issues.some((i) => i.entityType === 'searchTerm')).toBe(false);
  });

  it('flags a rejected SB creative as error', () => {
    const report = runIntegrityCheck([
      baseCampaign({ type: 'SB', creativeStatus: 'Rejected', creativeIssue: 'blurry' }),
    ]);
    expect(report.issues.some((i) => i.severity === 'error' && i.message.includes('rejected creative'))).toBe(true);
  });

  it('warns on a known low-inventory product', () => {
    const report = runIntegrityCheck([baseCampaign({ products: ['B0TRAIN004'] })]);
    expect(report.issues.some((i) => i.message.includes('low-inventory'))).toBe(true);
  });

  it('fails fast when campaigns is not an array', () => {
    expect(() => runIntegrityCheck(null as unknown as Campaign[])).toThrow();
  });

  it('assigns unique issue ids even when generated within the same millisecond', () => {
    const nowSpy = vi.spyOn(Date, 'now').mockReturnValue(1700000000000);
    try {
      const report = runIntegrityCheck([
        baseCampaign({
          status: 'Archived',
          targets: [
            { id: 'T1', campaignId: 'C1', adGroupId: 'AG1', type: 'Keyword', value: 'a', match: 'Exact', bid: 0.75, status: 'Enabled', impressions: 0, clicks: 0, spend: 0, sales: 0, orders: 0 },
            { id: 'T2', campaignId: 'C1', adGroupId: 'AG1', type: 'Keyword', value: 'b', match: 'Exact', bid: 0.75, status: 'Enabled', impressions: 0, clicks: 0, spend: 0, sales: 0, orders: 0 },
            { id: 'T3', campaignId: 'C1', adGroupId: 'AG1', type: 'Keyword', value: 'c', match: 'Exact', bid: 0.75, status: 'Enabled', impressions: 0, clicks: 0, spend: 0, sales: 0, orders: 0 },
          ],
        }),
      ]);
      const ids = report.issues.map((i) => i.id);
      expect(ids.length).toBeGreaterThan(1);
      expect(new Set(ids).size).toBe(ids.length);
    } finally {
      nowSpy.mockRestore();
    }
  });
});
