import { describe, it, expect } from 'vitest';
import {
  GLOBAL_NAV,
  getLeftRail,
  isSidebarItemActive,
  activeTopbarSection,
  sidebarSectionForView,
  KPI_TILES,
  getKpiTiles,
  type NavSection,
  type LeftRailItem,
  type KpiTile,
} from '../consoleNav';

describe('GLOBAL_NAV', () => {
  it('lists the four Amazon console sections in order', () => {
    const labels = GLOBAL_NAV.map((s) => s.label);
    expect(labels).toEqual(['Campaign Manager', 'Portfolios', 'Measurement', 'Training']);
  });

  it('each section targets a valid view', () => {
    GLOBAL_NAV.forEach((s: NavSection) => {
      expect(typeof s.view).toBe('string');
      expect(s.label.length).toBeGreaterThan(0);
    });
  });

  it('includes a Training section that lands on the drills view by default', () => {
    const training = GLOBAL_NAV.find((s) => s.label === 'Training');
    expect(training).toBeDefined();
    expect(training?.view).toBe('drills');
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

describe('getLeftRail — training wiring (H-03)', () => {
  const TRAINING_VIEWS = [
    'drills',
    'missions',
    'reports',
    'bulk',
    'trainer',
    'integrity',
  ] as const;

  it('returns a non-empty rail for every training view', () => {
    for (const v of TRAINING_VIEWS) {
      const items = getLeftRail(v);
      expect(items.length, `getLeftRail(${v}) should be non-empty`).toBeGreaterThan(0);
    }
  });

  it('exposes every advertised training page as a rail item somewhere', () => {
    // Each of the 6 training views must be reachable from the training rail.
    // We collect views that appear in at least one training rail and check
    // that all 6 are present.
    const reachable = new Set<string>();
    for (const v of TRAINING_VIEWS) {
      for (const item of getLeftRail(v)) {
        reachable.add(item.view);
      }
    }
    for (const v of TRAINING_VIEWS) {
      expect(reachable.has(v), `${v} must appear in some training rail`).toBe(true);
    }
  });

  it('every training rail item targets a real NavView', () => {
    const validViews = new Set([
      'dashboard', 'campaigns', 'portfolio', 'create',
      'reports', 'bulk', 'integrity', 'trainer', 'missions', 'drills',
    ]);
    for (const v of TRAINING_VIEWS) {
      for (const item of getLeftRail(v)) {
        expect(validViews.has(item.view), `${v} rail item "${item.label}" targets invalid view ${item.view}`).toBe(true);
      }
    }
  });
});

/**
 * Audit H-03: maps a topbar `view` to the global-nav section that should
 * highlight. The Training section must light up for any of the 6 training
 * views so the trainee can tell where they are in the product.
 */
describe('activeTopbarSection (H-03)', () => {
  const TRAINING_VIEWS = ['drills', 'missions', 'reports', 'bulk', 'trainer', 'integrity'] as const;

  it('Training section highlights for every training view', () => {
    for (const v of TRAINING_VIEWS) {
      expect(activeTopbarSection(v), `${v} should map to training`).toBe('training');
    }
  });

  it('Campaign Manager highlights for campaigns, create, and detail', () => {
    expect(activeTopbarSection('campaigns')).toBe('campaigns');
    expect(activeTopbarSection('create')).toBe('campaigns');
    expect(activeTopbarSection('detail')).toBe('campaigns');
  });

  it('Portfolios highlights for portfolio', () => {
    expect(activeTopbarSection('portfolio')).toBe('portfolio');
  });

  it('Measurement highlights for dashboard', () => {
    expect(activeTopbarSection('dashboard')).toBe('dashboard');
  });
});

describe('sidebarSectionForView (H-03)', () => {
  it('training views resolve to the training rail', () => {
    expect(sidebarSectionForView('drills')).toBe('training');
    expect(sidebarSectionForView('missions')).toBe('training');
    expect(sidebarSectionForView('reports')).toBe('training');
    expect(sidebarSectionForView('bulk')).toBe('training');
    expect(sidebarSectionForView('trainer')).toBe('training');
    expect(sidebarSectionForView('integrity')).toBe('training');
  });

  it('non-training views keep their existing section mapping', () => {
    expect(sidebarSectionForView('dashboard')).toBe('dashboard');
    expect(sidebarSectionForView('portfolio')).toBe('portfolio');
    expect(sidebarSectionForView('campaigns')).toBe('campaigns');
    expect(sidebarSectionForView('detail')).toBe('campaigns');
    expect(sidebarSectionForView('create')).toBe('campaigns');
  });
});

describe('isSidebarItemActive', () => {
  const adGroups = getLeftRail('campaigns').find((i) => i.label === 'Ad groups')!;
  const targeting = getLeftRail('campaigns').find((i) => i.label === 'Targeting')!;
  const campaigns = getLeftRail('campaigns').find((i) => i.label === 'Campaigns')!;
  const budgetRules = getLeftRail('portfolio').find((i) => i.label === 'Budget rules')!;

  it('only the item matching the selected tab is active in detail view', () => {
    expect(isSidebarItemActive(adGroups, 'detail', 'adgroups')).toBe(true);
    expect(isSidebarItemActive(targeting, 'detail', 'adgroups')).toBe(false);
  });

  it('only the item matching the selected tab is active in the campaigns list view', () => {
    expect(isSidebarItemActive(adGroups, 'campaigns', 'adgroups')).toBe(true);
    expect(isSidebarItemActive(targeting, 'campaigns', 'adgroups')).toBe(false);
  });

  it('a tab item is not active when its view is not current', () => {
    expect(isSidebarItemActive(budgetRules, 'campaigns', 'budgetRules')).toBe(false);
  });

  it('a tab-less item is active purely by view match', () => {
    expect(isSidebarItemActive(campaigns, 'campaigns', 'adgroups')).toBe(true);
    expect(isSidebarItemActive(campaigns, 'detail', 'adgroups')).toBe(false);
  });
});

