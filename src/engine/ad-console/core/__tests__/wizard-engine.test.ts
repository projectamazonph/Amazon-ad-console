import { describe, it, expect } from 'vitest';
import { selectProduct, removeProduct, parseKeywords } from '../engine';
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
    phraseKeywords: '',
    broadKeywords: '',
    exactKeywords: '', asinTargets: '', categoryTargets: '', audienceLookback: '30',
    audienceTargets: '',
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
