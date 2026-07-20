import { describe, it, expect } from 'vitest';
import { selectProduct, removeProduct, parseKeywords, draftLaunchErrors, canLeaveWizardStep } from '../engine';
import type { CampaignDraft } from '../types';

function draft(over: Partial<CampaignDraft> = {}): CampaignDraft {
  return {
    type: 'SP', name: 'Test', portfolio: 'P', status: 'Enabled',
    dailyBudget: 25, defaultBid: 0.75,
    startDate: '2026-01-01', endDate: '',
    targetingMode: 'Automatic', adFormat: 'Standard',
    bidStrategy: 'Dynamic bids - down only',
    placements: { top: 0, product: 0, rest: 0 },
    products: ['B0TRAIN001'], creative: {},
    keywords: '',
    keywordMatchTypes: ['Exact'], asinTargets: '', categoryTargets: '', audienceLookback: '30',
    audienceTargets: '',
    autoTargets: {
      closeMatch: { enabled: true, bid: 0.75 },
      looseMatch: { enabled: true, bid: 0.75 },
      substitutes: { enabled: true, bid: 0.75 },
      complements: { enabled: true, bid: 0.75 },
    },
    ...over,
  };
}

// ── selectProduct ────────────────────────────────────────────────

describe('selectProduct', () => {
  it('adds an ASIN to the draft products list', () => {
    const d = draft({ products: [] });
    const next = selectProduct(d, 'B0TRAIN002');
    expect(next.products).toEqual(['B0TRAIN002']);
  });

  it('does not duplicate an existing ASIN', () => {
    const d = draft({ products: ['B0TRAIN001'] });
    const next = selectProduct(d, 'B0TRAIN001');
    expect(next.products).toEqual(['B0TRAIN001']);
  });

  it('fails fast on empty ASIN', () => {
    expect(() => selectProduct(draft(), '   ')).toThrow();
  });
});

// ── removeProduct ────────────────────────────────────────────────

describe('removeProduct', () => {
  it('removes the ASIN from the draft products list', () => {
    const d = draft({ products: ['B0TRAIN001', 'B0TRAIN002'] });
    const next = removeProduct(d, 'B0TRAIN001');
    expect(next.products).toEqual(['B0TRAIN002']);
  });

  it('is a no-op when ASIN is not present', () => {
    const d = draft({ products: ['B0TRAIN001'] });
    const next = removeProduct(d, 'B0TRAIN999');
    expect(next.products).toEqual(['B0TRAIN001']);
  });

  it('refuses to remove the last product', () => {
    expect(() => removeProduct(draft({ products: ['B0TRAIN001'] }), 'B0TRAIN001')).toThrow();
  });
});

// ── parseKeywords ────────────────────────────────────────────────

describe('parseKeywords', () => {
  it('parses one keyword per line into an array of trimmed values', () => {
    expect(parseKeywords('coffee filter\n  coffee cone filter \npaper filters')).toEqual([
      'coffee filter',
      'coffee cone filter',
      'paper filters',
    ]);
  });

  it('skips blank lines', () => {
    expect(parseKeywords('a\n\nb\n\n')).toEqual(['a', 'b']);
  });

  it('returns empty array for empty input', () => {
    expect(parseKeywords('')).toEqual([]);
    expect(parseKeywords('   ')).toEqual([]);
  });

  it('fails fast on extremely long keyword (>200 chars)', () => {
    const long = 'x'.repeat(201);
    expect(() => parseKeywords(long)).toThrow();
  });
});

// ── draft validation (wizard gating) ─────────────────────────────

describe('draftLaunchErrors', () => {
  it('passes a complete draft', () => {
    expect(draftLaunchErrors(draft())).toEqual([]);
  });

  it('flags a blank name', () => {
    expect(draftLaunchErrors(draft({ name: '   ' }))).toContain('Campaign name is required');
  });

  it('flags a budget below $1', () => {
    expect(draftLaunchErrors(draft({ dailyBudget: 0 }))).toContain('Daily budget must be at least $1');
    expect(draftLaunchErrors(draft({ dailyBudget: -100 }))).toContain('Daily budget must be at least $1');
  });

  it('flags having no products', () => {
    expect(draftLaunchErrors(draft({ products: [] }))).toContain('Select at least one product');
  });

  it('flags keyword targeting with keywords but no match type selected', () => {
    const d = draft({ targetingMode: 'Manual keyword', keywords: 'coffee', keywordMatchTypes: [] });
    expect(draftLaunchErrors(d)).toContain('Select at least one keyword match type');
  });

  it('does not flag empty match types when there are no keywords', () => {
    const d = draft({ targetingMode: 'Manual keyword', keywords: '', keywordMatchTypes: [] });
    expect(draftLaunchErrors(d)).not.toContain('Select at least one keyword match type');
  });

  it('does not flag empty match types for non-keyword modes', () => {
    const d = draft({ targetingMode: 'Automatic', keywords: 'coffee', keywordMatchTypes: [] });
    expect(draftLaunchErrors(d)).not.toContain('Select at least one keyword match type');
  });
});

describe('canLeaveWizardStep', () => {
  it('blocks leaving step 2 without a name or valid budget', () => {
    expect(canLeaveWizardStep(draft({ name: '' }), 2)).toBe(false);
    expect(canLeaveWizardStep(draft({ dailyBudget: 0 }), 2)).toBe(false);
    expect(canLeaveWizardStep(draft(), 2)).toBe(true);
  });

  it('blocks leaving step 3 with no products', () => {
    expect(canLeaveWizardStep(draft({ products: [] }), 3)).toBe(false);
    expect(canLeaveWizardStep(draft(), 3)).toBe(true);
  });

  it('does not gate steps 1, 5', () => {
    expect(canLeaveWizardStep(draft({ name: '' }), 1)).toBe(true);
    expect(canLeaveWizardStep(draft({ name: '' }), 5)).toBe(true);
  });

  it('blocks leaving step 4 when keywords are entered with no match type', () => {
    expect(canLeaveWizardStep(draft({ targetingMode: 'Manual keyword', keywords: 'coffee', keywordMatchTypes: [] }), 4)).toBe(false);
    expect(canLeaveWizardStep(draft({ targetingMode: 'Manual keyword', keywords: 'coffee', keywordMatchTypes: ['Exact'] }), 4)).toBe(true);
    expect(canLeaveWizardStep(draft({ targetingMode: 'Automatic', keywords: '', keywordMatchTypes: [] }), 4)).toBe(true);
  });
});
