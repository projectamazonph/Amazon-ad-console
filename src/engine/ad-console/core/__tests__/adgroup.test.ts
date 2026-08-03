import { describe, it, expect } from 'vitest';
import {
  addAdGroup,
  renameAdGroup,
  setAdGroupStatus,
  setAdGroupDefaultBid,
  removeAdGroup,
  addTarget,
  addKeyword,
} from '../engine';
import type { Campaign, AdGroup } from '../types';

function makeCampaign(adGroups: { id?: string; name?: string; status?: AdGroup['status']; defaultBid?: number }[] = []): Campaign {
  const ags: AdGroup[] = (
    adGroups.length
      ? adGroups
      : [{ id: 'AG1', name: 'Default AG', status: 'Enabled', defaultBid: 0.75 }]
  ).map((ag, i) => ({
    id: ag.id ?? `AG${i + 1}`,
    campaignId: 'C1',
    name: ag.name ?? `Ad group ${i + 1}`,
    status: (ag.status ?? 'Enabled') as AdGroup['status'],
    defaultBid: ag.defaultBid ?? 0.75,
    metrics: { impressions: 0, clicks: 0, spend: 0, sales: 0, orders: 0 },
  }));
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
    adGroups: ags,
    targets: [],
    searchTerms: [],
    negatives: [],
    budgetRules: [],
    productAds: [],
    ads: [],
    history: [],
  };
}

describe('addAdGroup', () => {
  it('appends a new ad group to the campaign', () => {
    const c = makeCampaign();
    const next = addAdGroup(c, 'Manual keywords');
    expect(next.adGroups).toHaveLength(2);
    expect(next.adGroups[1]!.name).toBe('Manual keywords');
    expect(next.adGroups[1]!.status).toBe('Enabled');
  });

  it('fails fast on empty ad group name', () => {
    expect(() => addAdGroup(makeCampaign(), '   ')).toThrow();
  });
});

describe('renameAdGroup', () => {
  it('renames the matching ad group', () => {
    const c = makeCampaign();
    const next = renameAdGroup(c, 'AG1', 'Branded terms');
    expect(next.adGroups[0]!.name).toBe('Branded terms');
  });

  it('fails fast on unknown ad group id', () => {
    expect(() => renameAdGroup(makeCampaign(), 'NOPE', 'x')).toThrow();
  });

  it('fails fast on empty name', () => {
    expect(() => renameAdGroup(makeCampaign(), 'AG1', '')).toThrow();
  });
});

describe('setAdGroupStatus', () => {
  it('updates status and cascades to its targets', () => {
    let c = makeCampaign();
    const { campaign } = addKeyword(c, 'kw', 'Exact', 1, 'AG1');
    c = campaign;
    const next = setAdGroupStatus(c, 'AG1', 'Paused');
    expect(next.adGroups[0]!.status).toBe('Paused');
    expect(next.targets[0]!.status).toBe('Paused');
  });

  it('fails fast on unknown ad group id', () => {
    expect(() => setAdGroupStatus(makeCampaign(), 'NOPE', 'Paused')).toThrow();
  });
});

describe('setAdGroupDefaultBid', () => {
  it('sets the default bid', () => {
    const next = setAdGroupDefaultBid(makeCampaign(), 'AG1', 1.25);
    expect(next.adGroups[0]!.defaultBid).toBe(1.25);
  });

  it('fails fast on unknown ad group id', () => {
    expect(() => setAdGroupDefaultBid(makeCampaign(), 'NOPE', 1)).toThrow();
  });

  it('fails fast on a bid below the real minimum instead of silently substituting it', () => {
    // Previously: 0 and 0.01 passed the non-negative check and were then
    // silently rewritten to $0.02, discarding what the caller asked for.
    expect(() => setAdGroupDefaultBid(makeCampaign(), 'AG1', 0)).toThrow();
    expect(() => setAdGroupDefaultBid(makeCampaign(), 'AG1', 0.01)).toThrow();
  });

  it('fails fast on a negative or NaN default bid', () => {
    expect(() => setAdGroupDefaultBid(makeCampaign(), 'AG1', -1)).toThrow();
    expect(() => setAdGroupDefaultBid(makeCampaign(), 'AG1', NaN)).toThrow();
  });
});

describe('removeAdGroup', () => {
  it('removes the ad group and its targets', () => {
    let c = makeCampaign([
      { id: 'AG1', name: 'A' },
      { id: 'AG2', name: 'B' },
    ]);
    const { campaign } = addKeyword(c, 'kw', 'Exact', 1, 'AG2');
    c = campaign;
    const next = removeAdGroup(c, 'AG2');
    expect(next.adGroups.map((a) => a.id)).toEqual(['AG1']);
    expect(next.targets).toHaveLength(0);
  });

  it('refuses to remove the last ad group', () => {
    expect(() => removeAdGroup(makeCampaign(), 'AG1')).toThrow();
  });
});

describe('addTarget with ad group', () => {
  it('adds a keyword to the specified ad group', () => {
    const c = makeCampaign([
      { id: 'AG1', name: 'A' },
      { id: 'AG2', name: 'B' },
    ]);
    const { campaign, target } = addKeyword(c, 'running shoes', 'Broad', 1.5, 'AG2');
    expect(target.adGroupId).toBe('AG2');
    expect(campaign.targets).toHaveLength(1);
  });

  it('fails fast when the ad group does not exist', () => {
    expect(() => addKeyword(makeCampaign(), 'kw', 'Exact', 1, 'NOPE')).toThrow();
  });
});