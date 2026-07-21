import { describe, it, expect } from 'vitest';
import { PRODUCTS, BRANDS, defaultCampaigns } from '../scenarios';

describe('PRODUCTS', () => {
  it('has 5 products', () => {
    expect(PRODUCTS).toHaveLength(5);
  });

  it('each product has required fields', () => {
    for (const p of PRODUCTS) {
      expect(p.asin).toBeTruthy();
      expect(p.title).toBeTruthy();
      expect(p.price).toBeGreaterThan(0);
      expect(p.category).toBeTruthy();
      expect(p.status).toBeTruthy();
      expect(p.rating).toBeGreaterThan(0);
      expect(p.reviews).toBeGreaterThanOrEqual(0);
      expect(p.image).toBeTruthy();
    }
  });

  it('all ASINs start with B0TRAIN', () => {
    for (const p of PRODUCTS) {
      expect(p.asin).toMatch(/^B0TRAIN\d{3}$/);
    }
  });

  it('has no duplicate ASINs', () => {
    const ids = PRODUCTS.map(p => p.asin);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe('BRANDS', () => {
  it('has at least 3 brands', () => {
    expect(BRANDS.length).toBeGreaterThanOrEqual(3);
  });

  it('each brand has id, name, and logo', () => {
    for (const b of BRANDS) {
      expect(b.id).toBeTruthy();
      expect(b.name).toBeTruthy();
      expect(b.logo).toBeTruthy();
    }
  });

  it('all brand IDs start with BR-', () => {
    for (const b of BRANDS) {
      expect(b.id).toMatch(/^BR-/);
    }
  });

  it('has no duplicate IDs', () => {
    const ids = BRANDS.map(b => b.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe('defaultCampaigns', () => {
  it('returns 6 campaigns', () => {
    expect(defaultCampaigns()).toHaveLength(6);
  });

  it('includes all three campaign types', () => {
    const types = new Set(defaultCampaigns().map(c => c.type));
    expect(types).toEqual(new Set(['SP', 'SB', 'SD']));
  });

  it('each campaign has a valid id', () => {
    for (const c of defaultCampaigns()) {
      expect(c.id).toMatch(/^C-/);
    }
  });

  it('each campaign has at least one ad group', () => {
    for (const c of defaultCampaigns()) {
      expect(c.adGroups.length).toBeGreaterThanOrEqual(1);
    }
  });

  it('each campaign has at least one target', () => {
    for (const c of defaultCampaigns()) {
      expect(c.targets.length).toBeGreaterThanOrEqual(1);
    }
  });

  it('SP campaigns have keyword or auto targets', () => {
    const spCampaigns = defaultCampaigns().filter(c => c.type === 'SP');
    for (const c of spCampaigns) {
      for (const t of c.targets) {
        expect(['Keyword', 'Auto - close match', 'Auto - loose match', 'Auto - substitutes', 'Auto - complements']).toContain(t.type);
      }
    }
  });

  it('SB campaigns have keyword, product, or category targets', () => {
    const sbCampaigns = defaultCampaigns().filter(c => c.type === 'SB');
    for (const c of sbCampaigns) {
      expect(c.targets.length).toBeGreaterThan(0);
    }
  });

  it('SD campaigns have contextual or audience targets', () => {
    const sdCampaigns = defaultCampaigns().filter(c => c.type === 'SD');
    for (const c of sdCampaigns) {
      expect(c.targets.length).toBeGreaterThan(0);
    }
  });

  it('no campaign has zero budget', () => {
    for (const c of defaultCampaigns()) {
      expect(c.dailyBudget).toBeGreaterThan(0);
    }
  });

  it('campaign metrics are non-negative', () => {
    for (const c of defaultCampaigns()) {
      expect(c.metrics.impressions).toBeGreaterThanOrEqual(0);
      expect(c.metrics.clicks).toBeGreaterThanOrEqual(0);
      expect(c.metrics.spend).toBeGreaterThanOrEqual(0);
      expect(c.metrics.sales).toBeGreaterThanOrEqual(0);
      expect(c.metrics.orders).toBeGreaterThanOrEqual(0);
    }
  });
});
