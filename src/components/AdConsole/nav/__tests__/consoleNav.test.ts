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

describe('getLeftRail tab mapping', () => {
  it('maps Ad groups to the adgroups tab', () => {
    const items = getLeftRail('campaigns');
    const ag = items.find((i) => i.label === 'Ad groups');
    expect(ag?.tab).toBe('adgroups');
  });

  it('maps Targeting to the targets tab', () => {
    const items = getLeftRail('campaigns');
    const tgt = items.find((i) => i.label === 'Targeting');
    expect(tgt?.tab).toBe('targets');
  });

  it('maps Search terms to the searchTerms tab', () => {
    const items = getLeftRail('campaigns');
    const st = items.find((i) => i.label === 'Search terms');
    expect(st?.tab).toBe('searchTerms');
  });

  it('maps Negative keywords to the negatives tab', () => {
    const items = getLeftRail('campaigns');
    const neg = items.find((i) => i.label === 'Negative keywords');
    expect(neg?.tab).toBe('negatives');
  });

  it('maps Budget rules to the budgetRules tab in portfolio section', () => {
    const items = getLeftRail('portfolio');
    const br = items.find((i) => i.label === 'Budget rules');
    expect(br?.tab).toBe('budgetRules');
  });

  it('does not have a tab on the Campaigns item (navigates to list)', () => {
    const items = getLeftRail('campaigns');
    const campaigns = items.find((i) => i.label === 'Campaigns');
    expect(campaigns?.tab).toBeUndefined();
  });
});

describe('resolveSidebarClick', () => {
  it('returns setTab when item has tab and user is in detail view', () => {
    const action = resolveSidebarClick({ view: 'campaigns', tab: 'adgroups' }, 'detail');
    expect(action).toEqual({ type: 'setTab', tab: 'adgroups' });
  });

  it('returns setTabAndView when item has tab and user is NOT in detail view', () => {
    const action = resolveSidebarClick({ view: 'campaigns', tab: 'targets' }, 'campaigns');
    expect(action).toEqual({ type: 'setTabAndView', tab: 'targets', view: 'campaigns' });
  });

  it('returns setView when item has no tab', () => {
    const action = resolveSidebarClick({ view: 'portfolio' }, 'campaigns');
    expect(action).toEqual({ type: 'setView', view: 'portfolio' });
  });

  it('returns setView for plain Campaigns item', () => {
    const action = resolveSidebarClick({ view: 'campaigns' }, 'detail');
    expect(action).toEqual({ type: 'setView', view: 'campaigns' });
  });
});
