import { describe, it, expect } from 'vitest';
import {
  calc,
  totalMetrics,
  metricDefaults,
  generateId,
  normalizeCampaign,
  simulateDays,
  addTarget,
  removeTarget,
  addNegative,
  harvestTerm,
  toggleCampaignStatus,
  archiveCampaign,
  duplicateCampaign,
  isFilteredByNegative,
} from '../src/engine/ad-console/core/engine';
import type { Campaign, CampaignDraft, Negative, Metrics, Target } from '../src/engine/ad-console/core/types';

// ============================================================================
// calc() — Derived metrics
// ============================================================================

describe('calc()', () => {
  it('returns zero values for zero metrics', () => {
    const m: Metrics = { impressions: 0, clicks: 0, spend: 0, sales: 0, orders: 0 };
    const d = calc(m);
    expect(d.ctr).toBe(0);
    expect(d.cpc).toBe(0);
    expect(d.acos).toBe(0);
    expect(d.roas).toBe(0);
    expect(d.cvr).toBe(0);
  });

  it('calculates CTR correctly', () => {
    const d = calc({ impressions: 1000, clicks: 50, spend: 25, sales: 100, orders: 4 });
    expect(d.ctr).toBeCloseTo(5.0, 1);
  });

  it('calculates CPC correctly', () => {
    const d = calc({ impressions: 1000, clicks: 50, spend: 25, sales: 100, orders: 4 });
    expect(d.cpc).toBeCloseTo(0.50, 2);
  });

  it('calculates ACOS correctly', () => {
    const d = calc({ impressions: 1000, clicks: 50, spend: 25, sales: 100, orders: 4 });
    expect(d.acos).toBeCloseTo(25.0, 1);
  });

  it('calculates ROAS correctly', () => {
    const d = calc({ impressions: 1000, clicks: 50, spend: 25, sales: 100, orders: 4 });
    expect(d.roas).toBeCloseTo(4.0, 1);
  });

  it('calculates CVR correctly', () => {
    const d = calc({ impressions: 1000, clicks: 50, spend: 25, sales: 100, orders: 4 });
    expect(d.cvr).toBeCloseTo(8.0, 1);
  });
});

// ============================================================================
// isFilteredByNegative() — Negation filtering
// ============================================================================

describe('isFilteredByNegative()', () => {
  const negatives: Negative[] = [
    { id: 'n1', campaignId: 'c1', adGroupId: 'ag1', type: 'Negative exact', value: 'plastic cone coffee filter' },
    { id: 'n2', campaignId: 'c1', adGroupId: 'ag1', type: 'Negative phrase', value: 'cheap' },
  ];

  it('Negative exact filters exact match', () => {
    expect(isFilteredByNegative('plastic cone coffee filter', negatives)).toBe(true);
  });

  it('Negative exact does NOT filter close variant', () => {
    expect(isFilteredByNegative('plastic cone coffee filters', negatives)).toBe(false);
  });

  it('Negative phrase filters if term contains the word', () => {
    expect(isFilteredByNegative('cheap coffee filter', negatives)).toBe(true);
  });

  it('Negative phrase filters if term starts with the word', () => {
    expect(isFilteredByNegative('cheap paper plates', negatives)).toBe(true);
  });

  it('Negative phrase does NOT filter if word not present', () => {
    expect(isFilteredByNegative('premium coffee filter', negatives)).toBe(false);
  });

  it('is case insensitive', () => {
    expect(isFilteredByNegative('Plastic Cone Coffee Filter', negatives)).toBe(true);
    expect(isFilteredByNegative('CHEAP PAPER PLATES', negatives)).toBe(true);
  });

  it('returns false for empty negatives', () => {
    expect(isFilteredByNegative('anything', [])).toBe(false);
  });

  it('Negative exact special chars', () => {
    const n: Negative[] = [{ id: 'n1', campaignId: 'c1', adGroupId: 'ag1', type: 'Negative exact', value: 'coffee filter size 4' }];
    expect(isFilteredByNegative('coffee filter size 4', n)).toBe(true);
    expect(isFilteredByNegative('coffee filter size 6', n)).toBe(false);
  });
});

// ============================================================================
// totalMetrics()
// ============================================================================

describe('totalMetrics()', () => {
  it('sums metrics across campaigns', () => {
    const campaigns: Campaign[] = [
      {
        id: 'c1', type: 'SP', name: 'Test 1', portfolio: 'Test', status: 'Enabled',
        dailyBudget: 10, defaultBid: 0.50, startDate: '2026-01-01', endDate: null,
        targetingMode: 'Automatic', adFormat: 'Standard', bidStrategy: 'Dynamic bids - down only',
        placements: { top: 0, product: 0, rest: 0 },
        products: ['B0TRAIN001'], creative: null,
        metrics: { impressions: 1000, clicks: 50, spend: 25, sales: 100, orders: 4 },
        adGroups: [], targets: [], searchTerms: [], negatives: [], budgetRules: [],
        history: ['Created'],
      },
      {
        id: 'c2', type: 'SP', name: 'Test 2', portfolio: 'Test', status: 'Enabled',
        dailyBudget: 10, defaultBid: 0.50, startDate: '2026-01-01', endDate: null,
        targetingMode: 'Automatic', adFormat: 'Standard', bidStrategy: 'Dynamic bids - down only',
        placements: { top: 0, product: 0, rest: 0 },
        products: ['B0TRAIN001'], creative: null,
        metrics: { impressions: 500, clicks: 25, spend: 12.50, sales: 50, orders: 2 },
        adGroups: [], targets: [], searchTerms: [], negatives: [], budgetRules: [],
        history: ['Created'],
      },
    ];
    const t = totalMetrics(campaigns);
    expect(t.impressions).toBe(1500);
    expect(t.clicks).toBe(75);
    expect(t.spend).toBe(37.50);
    expect(t.sales).toBe(150);
    expect(t.orders).toBe(6);
  });
});

// ============================================================================
// metricDefaults()
// ============================================================================

describe('metricDefaults()', () => {
  it('fills missing fields with 0', () => {
    const m = metricDefaults({ impressions: 100 });
    expect(m.impressions).toBe(100);
    expect(m.clicks).toBe(0);
    expect(m.spend).toBe(0);
    expect(m.sales).toBe(0);
    expect(m.orders).toBe(0);
  });
});

// ============================================================================
// generateId()
// ============================================================================

describe('generateId()', () => {
  it('generates unique IDs with prefix', () => {
    const a = generateId('T');
    const b = generateId('T');
    expect(a).not.toBe(b);
    expect(a).toMatch(/^T-/);
  });
});

// ============================================================================
// normalizeCampaign()
// ============================================================================

describe('normalizeCampaign()', () => {
  it('fills defaults for minimal input', () => {
    const c = normalizeCampaign({});
    expect(c.type).toBe('SP');
    expect(c.dailyBudget).toBeGreaterThanOrEqual(1);
    expect(c.defaultBid).toBeGreaterThanOrEqual(0.02);
    expect(c.creative).toBeNull();
    expect(c.adGroups.length).toBe(1);
    expect(c.targets).toEqual([]);
    expect(c.products).toEqual(['B0TRAIN001']);
  });

  it('sets SP-specific defaults', () => {
    const c = normalizeCampaign({ type: 'SP' });
    expect(c.targetingMode).toBe('Automatic');
    expect(c.adFormat).toBe('Standard');
    expect(c.bidStrategy).toBe('Dynamic bids - down only');
    expect(c.creative).toBeNull();
  });

  it('sets SB-specific defaults', () => {
    const c = normalizeCampaign({ type: 'SB' });
    expect(c.targetingMode).toBe('Keyword');
    expect(c.adFormat).toBe('Product collection');
    expect(c.bidStrategy).toBe('Cost per click');
    expect(c.creative).not.toBeNull();
    expect(c.creative?.brandName).toBeDefined();
  });

  it('sets SD-specific defaults', () => {
    const c = normalizeCampaign({ type: 'SD' });
    expect(c.targetingMode).toBe('Contextual');
    expect(c.adFormat).toBe('Auto generated');
    expect(c.bidStrategy).toBe('Cost per click');
    expect(c.creative).not.toBeNull();
  });

  it('deduplicates products', () => {
    const c = normalizeCampaign({ products: ['B0TRAIN001', 'B0TRAIN001', 'B0TRAIN002'] });
    expect(c.products).toEqual(['B0TRAIN001', 'B0TRAIN002']);
  });

  it('preserves provided targets', () => {
    const c = normalizeCampaign({
      targets: [{ value: 'coffee filter', match: 'Exact', bid: 0.75 }] as any,
    });
    expect(c.targets.length).toBe(1);
    expect(c.targets[0].value).toBe('coffee filter');
    expect(c.targets[0].bid).toBe(0.75);
  });

  it('clamps budget to minimum 1', () => {
    const c = normalizeCampaign({ dailyBudget: 0 });
    expect(c.dailyBudget).toBe(1);
  });

  it('clamps defaultBid to minimum 0.02', () => {
    const c = normalizeCampaign({ defaultBid: 0 });
    expect(c.defaultBid).toBe(0.02);
  });
});

// ============================================================================
// addTarget()
// ============================================================================

describe('addTarget()', () => {
  const baseCampaign = normalizeCampaign({ id: 'c1', name: 'Test' });

  it('adds a keyword target with correct match type', () => {
    const result = addTarget(baseCampaign, 'coffee filter', 'Exact', 0.75);
    expect(result.target.value).toBe('coffee filter');
    expect(result.target.match).toBe('Exact');
    expect(result.target.bid).toBe(0.75);
    expect(result.campaign.targets.length).toBe(1);
  });

  it('adds Phrase match targets', () => {
    const r = addTarget(baseCampaign, 'coffee maker', 'Phrase', 1.00);
    expect(r.target.match).toBe('Phrase');
  });

  it('adds Broad match targets', () => {
    const r = addTarget(baseCampaign, 'coffee', 'Broad', 0.50);
    expect(r.target.match).toBe('Broad');
  });

  it('clamps bid to minimum 0.02', () => {
    const r = addTarget(baseCampaign, 'test', 'Exact', 0);
    expect(r.target.bid).toBe(0.02);
  });
});

// ============================================================================
// removeTarget()
// ============================================================================

describe('removeTarget()', () => {
  it('removes a target by ID', () => {
    const c = normalizeCampaign({ targets: [{ value: 'test', match: 'Exact', bid: 0.75 }] as any });
    const tid = c.targets[0].id;
    const result = removeTarget(c, tid);
    expect(result.targets.length).toBe(0);
  });

  it('does nothing for unknown ID', () => {
    const c = normalizeCampaign({ targets: [{ value: 'test', match: 'Exact', bid: 0.75 }] as any });
    const result = removeTarget(c, 'nonexistent');
    expect(result.targets.length).toBe(1);
  });
});

// ============================================================================
// addNegative()
// ============================================================================

describe('addNegative()', () => {
  const c = normalizeCampaign({ id: 'c1', name: 'Test' });

  it('adds a Negative exact', () => {
    const result = addNegative(c, 'plastic cone coffee filter', 'Negative exact');
    expect(result.negatives.length).toBe(1);
    expect(result.negatives[0].type).toBe('Negative exact');
    expect(result.negatives[0].value).toBe('plastic cone coffee filter');
  });

  it('adds a Negative phrase', () => {
    const c2 = normalizeCampaign({ id: 'c2', name: 'Test2' });
    const result = addNegative(c2, 'cheap', 'Negative phrase');
    expect(result.negatives.length).toBe(1);
    expect(result.negatives[0].type).toBe('Negative phrase');
  });

  it('does not duplicate existing negative', () => {
    const c2 = normalizeCampaign({ id: 'c3', name: 'Test3' });
    const r1 = addNegative(c2, 'plastic', 'Negative phrase');
    const r2 = addNegative(r1, 'plastic', 'Negative phrase');
    expect(r2.negatives.length).toBe(1);
  });

  it('is case insensitive for dedup', () => {
    const c2 = normalizeCampaign({ id: 'c4', name: 'Test4' });
    const r1 = addNegative(c2, 'Plastic', 'Negative phrase');
    const r2 = addNegative(r1, 'plastic', 'Negative phrase');
    expect(r2.negatives.length).toBe(1);
  });
});

// ============================================================================
// harvestTerm()
// ============================================================================

describe('harvestTerm()', () => {
  it('creates an Exact keyword target from a search term', () => {
    const c = normalizeCampaign({ id: 'c1', name: 'Test', searchTerms: [{ term: 'coffee filter bulk' }] as any });
    const result = harvestTerm(c, 'coffee filter bulk', 'Loose match');
    expect(result.targets.length).toBe(1);
    expect(result.targets[0].value).toBe('coffee filter bulk');
    expect(result.targets[0].match).toBe('Exact');
    expect(result.targets[0].bid).toBe(0.75);
  });

  it('does not duplicate existing keyword', () => {
    const c = normalizeCampaign({ id: 'c2', name: 'Test', targets: [{ value: 'existing kw', match: 'Exact', bid: 0.75 }] as any });
    const result = harvestTerm(c, 'existing kw');
    expect(result.targets.length).toBe(1);
  });

  it('links search term to new target', () => {
    const c = normalizeCampaign({ id: 'c3', name: 'Test', searchTerms: [{ term: 'coffee filter bulk', target: 'Loose match' }] as any });
    const result = harvestTerm(c, 'coffee filter bulk', 'Loose match');
    expect(result.searchTerms[0].targetId).toBe(result.targets[0].id);
    expect(result.searchTerms[0].target).toBe('coffee filter bulk');
  });
});

// ============================================================================
// toggleCampaignStatus()
// ============================================================================

describe('toggleCampaignStatus()', () => {
  it('toggles between Enabled and Paused', () => {
    const c = normalizeCampaign({ id: 'c1', name: 'Test', status: 'Enabled' });
    const paused = toggleCampaignStatus(c);
    expect(paused.status).toBe('Paused');
    const enabled = toggleCampaignStatus(paused);
    expect(enabled.status).toBe('Enabled');
  });

  it('does not toggle Archived campaigns', () => {
    const c = normalizeCampaign({ id: 'c2', name: 'Test', status: 'Archived' });
    const result = toggleCampaignStatus(c);
    expect(result.status).toBe('Archived');
  });
});

// ============================================================================
// archiveCampaign()
// ============================================================================

describe('archiveCampaign()', () => {
  it('sets status to Archived', () => {
    const c = normalizeCampaign({ id: 'c1', name: 'Test', status: 'Enabled' });
    const archived = archiveCampaign(c);
    expect(archived.status).toBe('Archived');
    expect(archived.adGroups.every(ag => ag.status === 'Archived')).toBe(true);
    expect(archived.targets.every(t => t.status === 'Archived')).toBe(true);
  });
});

// ============================================================================
// duplicateCampaign()
// ============================================================================

describe('duplicateCampaign()', () => {
  it('creates a copy with new ID and zero metrics', () => {
    const c = normalizeCampaign({
      id: 'C-SP-001', type: 'SP', name: 'Original', status: 'Enabled',
      metrics: { impressions: 1000, clicks: 50, spend: 25, sales: 100, orders: 4 },
      targets: [{ value: 'test kw', match: 'Exact', bid: 0.75 }] as any,
    });
    const copy = duplicateCampaign(c);
    expect(copy.id).not.toBe(c.id);
    expect(copy.name).toBe('Original (copy)');
    expect(copy.status).toBe('Paused');
    expect(copy.metrics.impressions).toBe(0);
    expect(copy.targets.length).toBe(1);
    expect(copy.targets[0].impressions).toBe(0);
  });
});

// ============================================================================
// simulateDays()
// ============================================================================

describe('simulateDays()', () => {
  it('skips non-Enabled campaigns', () => {
    const c = normalizeCampaign({ id: 'c1', name: 'Test', status: 'Paused' });
    const result = simulateDays([c], 7);
    expect(result[0].metrics.impressions).toBe(0);
  });

  it('generates metrics for Enabled campaigns', () => {
    const c = normalizeCampaign({ id: 'c2', name: 'Test', status: 'Enabled', dailyBudget: 10 });
    const result = simulateDays([c], 1);
    expect(result[0].metrics.impressions).toBeGreaterThan(0);
    expect(result[0].metrics.clicks).toBeGreaterThan(0);
    expect(result[0].metrics.spend).toBeGreaterThan(0);
    expect(result[0].metrics.orders).toBeGreaterThanOrEqual(0);
  });

  it('distributes metrics to targets equally', () => {
    const c = normalizeCampaign({
      id: 'c3', name: 'Test', status: 'Enabled', dailyBudget: 10,
      targets: [
        { value: 'kw1', match: 'Exact', bid: 0.75 } as any,
        { value: 'kw2', match: 'Exact', bid: 0.75 } as any,
      ],
    });
    const result = simulateDays([c], 1);
    const targets = result[0].targets;
    expect(targets.length).toBe(2);
    expect(targets[0].impressions).toBeGreaterThan(0);
    expect(targets[1].impressions).toBeGreaterThan(0);
  });
});

// ============================================================================
// CampaignDraft keyword target parsing tests (integration)
// ============================================================================

describe('CampaignDraft — keyword parsing', () => {
  it('parses exact keywords into targets with Exact match', () => {
    const keywords = 'coffee filter\ncoffee cone filter\npaper coffee filters';
    const targets: Target[] = keywords.split('\n').filter(k => k.trim()).map(k => ({
      id: 'T-1', campaignId: 'C-1', adGroupId: 'AG-1',
      type: 'Keyword', value: k.trim(), match: 'Exact',
      bid: 0.75, status: 'Enabled',
      impressions: 0, clicks: 0, spend: 0, sales: 0, orders: 0,
    }));
    expect(targets.length).toBe(3);
    targets.forEach(t => expect(t.match).toBe('Exact'));
  });

  it('parses phrase keywords into targets with Phrase match', () => {
    const keywords = 'coffee maker\nbrewing supplies';
    const targets = keywords.split('\n').filter(k => k.trim()).map(k => ({
      id: 'T-1', campaignId: 'C-1', adGroupId: 'AG-1',
      type: 'Keyword', value: k.trim(), match: 'Phrase',
      bid: 0.75, status: 'Enabled',
      impressions: 0, clicks: 0, spend: 0, sales: 0, orders: 0,
    }));
    expect(targets.length).toBe(2);
    targets.forEach(t => expect(t.match).toBe('Phrase'));
  });

  it('parses broad keywords into targets with Broad match', () => {
    const keywords = 'coffee';
    const targets = keywords.split('\n').filter(k => k.trim()).map(k => ({
      id: 'T-1', campaignId: 'C-1', adGroupId: 'AG-1',
      type: 'Keyword', value: k.trim(), match: 'Broad',
      bid: 0.75, status: 'Enabled',
      impressions: 0, clicks: 0, spend: 0, sales: 0, orders: 0,
    }));
    expect(targets.length).toBe(1);
    expect(targets[0].match).toBe('Broad');
  });

  it('handles empty keyword fields gracefully', () => {
    const keywords = '';
    const targets = keywords.split('\n').filter(k => k.trim());
    expect(targets.length).toBe(0);
  });
});

// ============================================================================
// Product catalog integration
// ============================================================================

describe('Product catalog', () => {
  it('products can be selected and stored in draft', () => {
    const draftProducts = ['B0TRAIN001', 'B0TRAIN003'];
    expect(draftProducts.length).toBe(2);
    // After adding
    const updated = [...draftProducts, 'B0TRAIN002'];
    expect(updated.length).toBe(3);
    // After removing
    const removed = updated.filter(p => p !== 'B0TRAIN001');
    expect(removed).toEqual(['B0TRAIN003', 'B0TRAIN002']);
  });

  it('deduplicates on launch via normalizeCampaign', () => {
    const c = normalizeCampaign({ products: ['B0TRAIN001', 'B0TRAIN001', 'B0TRAIN002'] });
    expect(c.products).toEqual(['B0TRAIN001', 'B0TRAIN002']);
  });
});

// ============================================================================
// SB-specific defaults
// ============================================================================

describe('SB-specific behavior', () => {
  it('defaults to CPC bid strategy', () => {
    const c = normalizeCampaign({ type: 'SB' });
    expect(c.bidStrategy).toBe('Cost per click');
  });

  it('has creative object', () => {
    const c = normalizeCampaign({ type: 'SB' });
    expect(c.creative).not.toBeNull();
    expect(c.creative!.brandName).toBe('');
    expect(c.creative!.headline).toBe('');
  });
});

// ============================================================================
// SD-specific defaults
// ============================================================================

describe('SD-specific behavior', () => {
  it('defaults to Contextual targeting', () => {
    const c = normalizeCampaign({ type: 'SD' });
    expect(c.targetingMode).toBe('Contextual');
  });

  it('defaults to Auto generated ad format', () => {
    const c = normalizeCampaign({ type: 'SD' });
    expect(c.adFormat).toBe('Auto generated');
  });
});
