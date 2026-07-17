import { describe, it, expect } from 'vitest';
import {
  GLOBAL_NAV,
  getLeftRail,
  KPI_TILES,
  getKpiTiles,
  type NavSection,
  type LeftRailItem,
  type KpiTile,
} from '../consoleNav';

describe('GLOBAL_NAV', () => {
  it('lists the three primary Amazon console sections in order', () => {
    const labels = GLOBAL_NAV.map((s) => s.label);
    expect(labels).toEqual(['Campaign Manager', 'Portfolios', 'Measurement']);
  });

  it('each section targets a valid view', () => {
    GLOBAL_NAV.forEach((s: NavSection) => {
      expect(typeof s.view).toBe('string');
      expect(s.label.length).toBeGreaterThan(0);
    });
  });
});

describe('getLeftRail', () => {
  it('returns Campaign Manager items for the campaign-manager section', () => {
    const items = getLeftRail('campaigns');
    expect(items.length).toBeGreaterThan(0);
    expect(items.every((i: LeftRailItem) => Boolean(i.view) && Boolean(i.label))).toBe(true);
  });

  it('returns Portfolios items for the portfolio section', () => {
    const items = getLeftRail('portfolio');
    expect(items.some((i) => /portfolio/i.test(i.label))).toBe(true);
  });

  it('defaults to the campaign-manager rail when section is unknown', () => {
    const items = getLeftRail('nope' as never);
    expect(items[0]!.view).toBe('campaigns');
  });
});

describe('KPI tiles', () => {
  it('defines the 8 Amazon console KPI tiles', () => {
    expect(KPI_TILES.map((t: KpiTile) => t.key)).toEqual([
      'impressions',
      'clicks',
      'spend',
      'sales',
      'orders',
      'units',
      'ctr',
      'acos',
      'roas',
    ]);
  });

  it('getKpiTiles formats values from a metrics snapshot', () => {
    const tiles = getKpiTiles({
      impressions: 1000,
      clicks: 50,
      spend: 25,
      sales: 100,
      orders: 5,
      units: 6,
    });
    const byKey = Object.fromEntries(tiles.map((t) => [t.key, t.value]));
    expect(byKey.impressions).toBe('1,000');
    expect(byKey.clicks).toBe('50');
    expect(byKey.spend).toBe('$25.00');
    expect(byKey.sales).toBe('$100.00');
    expect(byKey.orders).toBe('5');
    expect(byKey.units).toBe('6');
    expect(byKey.ctr).toBe('5.00%');
    expect(byKey.acos).toBe('25.00%');
    expect(byKey.roas).toBe('4.00');
  });

  it('fails fast when metrics snapshot is missing required fields', () => {
    expect(() => getKpiTiles({ impressions: 1 } as never)).toThrow();
  });
});
