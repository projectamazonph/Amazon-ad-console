/**
 * Amazon Advertising Console — navigation + KPI model.
 *
 * Pure, framework-free data describing the real console structure:
 * the global nav sections, the contextual left rail, and the KPI tiles
 * shown on the home dashboard. Components stay thin and render from this.
 */

import { ValidationError } from '../../../lib/validation';
import { calc } from '../../../engine/ad-console/core/engine';

export type NavView =
  | 'dashboard'
  | 'campaigns'
  | 'portfolio'
  | 'create'
  | 'reports'
  | 'bulk'
  | 'integrity'
  | 'trainer'
  | 'missions'
  | 'drills';

export interface NavSection {
  /**
   * Section identity used to determine the active topbar/mobile-drawer tab.
   * For the Training section this is 'training' (a `RailSection`), even
   * though `view` is 'drills' (a `NavView`). The two diverge for training
   * because all 6 training views should highlight the same single tab.
   */
  key: RailSection;
  label: string;
  view: NavView;
}

export interface LeftRailItem {
  label: string;
  view: NavView;
  group: 'campaigns' | 'portfolios' | 'measurement' | 'training';
  tab?: string;
}

export interface KpiTile {
  key: string;
  label: string;
  value?: string;
  delta?: string;
}

export interface MetricsSnapshot {
  impressions: number;
  clicks: number;
  spend: number;
  sales: number;
  orders: number;
  units: number;
}

/** Top-level sections in the Amazon console global navigation bar. */
export const GLOBAL_NAV: NavSection[] = [
  { key: 'campaigns', label: 'Campaign Manager', view: 'campaigns' },
  { key: 'portfolio', label: 'Portfolios', view: 'portfolio' },
  { key: 'dashboard', label: 'Measurement', view: 'dashboard' },
  // Training is the entry point for the 6 training-product pages (Drills,
  // Missions, Reports, Bulk, Trainer, Integrity). Clicking it lands on the
  // drills view; the sidebar rail then exposes the other 5. `key` stays
  // 'training' so all 6 views highlight the same tab.
  { key: 'training', label: 'Training', view: 'drills' },
];

/**
 * The 6 training-product views. Single source of truth for "is this view
 * part of Training" — previously repeated as an identical `view === 'x' ||
 * ...` chain in three functions, which is exactly the kind of duplication
 * that caused audit H-03 (a training view silently falling through to the
 * wrong default because one of the three lists fell out of sync).
 */
const TRAINING_VIEWS: ReadonlySet<NavView> = new Set([
  'drills', 'missions', 'reports', 'bulk', 'trainer', 'integrity',
]);

/**
 * Rail items for the Training section. The order matches the typical
 * trainee journey: hands-on drills first, then missions, then reporting
 * and bulk ops, then trainer dashboard, then integrity checks.
 */
const TRAINING_RAIL: LeftRailItem[] = [
  { label: 'Drills',       view: 'drills',     group: 'training' },
  { label: 'Missions',     view: 'missions',   group: 'training' },
  { label: 'Reports',      view: 'reports',    group: 'training' },
  { label: 'Bulk ops',     view: 'bulk',       group: 'training' },
  { label: 'Trainer',      view: 'trainer',    group: 'training' },
  { label: 'Integrity',    view: 'integrity',  group: 'training' },
];

const LEFT_RAIL: Record<NavView, LeftRailItem[]> = {
  campaigns: [
    { label: 'Campaigns', view: 'campaigns', group: 'campaigns' },
    { label: 'Ad groups', view: 'campaigns', group: 'campaigns', tab: 'adgroups' },
    { label: 'Targeting', view: 'campaigns', group: 'campaigns', tab: 'targets' },
    { label: 'Search terms', view: 'campaigns', group: 'campaigns', tab: 'searchTerms' },
    { label: 'Negative keywords', view: 'campaigns', group: 'campaigns', tab: 'negatives' },
  ],
  portfolio: [
    { label: 'Portfolios', view: 'portfolio', group: 'portfolios' },
    { label: 'Budget rules', view: 'portfolio', group: 'portfolios', tab: 'budgetRules' },
  ],
  dashboard: [
    { label: 'Sponsored Products', view: 'dashboard', group: 'measurement' },
    { label: 'Sponsored Brands', view: 'dashboard', group: 'measurement' },
    { label: 'Sponsored Display', view: 'dashboard', group: 'measurement' },
    { label: 'Search catalog', view: 'dashboard', group: 'measurement' },
    { label: 'Search query performance', view: 'dashboard', group: 'measurement' },
  ],
  create: [],
  reports: TRAINING_RAIL,
  bulk: TRAINING_RAIL,
  integrity: TRAINING_RAIL,
  trainer: TRAINING_RAIL,
  missions: TRAINING_RAIL,
  drills: TRAINING_RAIL,
};

/**
 * Section keys for the sidebar rail. Distinct from `NavView` because the
 * Training section rolls up all 6 training views into a single rail
 * (audit H-03), so 'training' is a section that has no corresponding
 * single view.
 */
export type RailSection = 'campaigns' | 'portfolio' | 'dashboard' | 'training';

/** Returns the left-rail items for a global-nav section, defaulting to Campaign Manager. */
export function getLeftRail(section: NavView | RailSection): LeftRailItem[] {
  // The training rail is registered under each of the 6 training views
  // in LEFT_RAIL, so passing any of them returns the same training rail.
  if (section === 'training') return TRAINING_RAIL;
  if (TRAINING_VIEWS.has(section as NavView)) return TRAINING_RAIL;
  return LEFT_RAIL[section as NavView] ?? LEFT_RAIL.campaigns;
}

/**
 * Maps a topbar `view` to the global-nav section that should highlight.
 * Pulled out so the Topbar and Sidebar stay consistent and so it can be
 * unit-tested in isolation.
 *
 * Audit H-03 fix: any of the 6 training views highlights the Training
 * section, not the Campaign Manager fallback that was silently applied
 * before.
 */
export function activeTopbarSection(view: string): RailSection {
  if (view === 'portfolio') return 'portfolio';
  if (view === 'dashboard') return 'dashboard';
  if (TRAINING_VIEWS.has(view as NavView)) return 'training';
  return 'campaigns';
}

/**
 * Maps a topbar `view` to the section key used by `getLeftRail`. Training
 * views get the dedicated Training rail; everything else keeps the
 * Campaign Manager / Portfolios / Measurement mapping it had before.
 */
export function sidebarSectionForView(view: string): RailSection {
  if (view === 'portfolio') return 'portfolio';
  if (view === 'dashboard') return 'dashboard';
  if (TRAINING_VIEWS.has(view as NavView)) return 'training';
  return 'campaigns';
}

/** KPI tile definitions in Amazon console order. */
export const KPI_TILES: KpiTile[] = [
  { key: 'impressions', label: 'Impressions' },
  { key: 'clicks', label: 'Clicks' },
  { key: 'spend', label: 'Spend' },
  { key: 'sales', label: 'Sales' },
  { key: 'orders', label: 'Orders' },
  { key: 'units', label: 'Units' },
  { key: 'ctr', label: 'CTR' },
  { key: 'acos', label: 'ACoS' },
  { key: 'roas', label: 'RoAS' },
];

function money(n: number): string {
  return '$' + n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function whole(n: number): string {
  return n.toLocaleString();
}

function pct(n: number): string {
  return n.toFixed(2) + '%';
}

export interface SidebarClickAction {
  type: 'setView' | 'setTab' | 'setTabAndView';
  view?: NavView;
  tab?: string;
}

export function resolveSidebarClick(
  item: { view: NavView; tab?: string },
  currentView: string,
): SidebarClickAction {
  if (item.tab && currentView === 'detail') {
    return { type: 'setTab', tab: item.tab };
  }
  if (item.tab && currentView !== 'detail') {
    return { type: 'setTabAndView', tab: item.tab, view: item.view };
  }
  return { type: 'setView', view: item.view };
}

/**
 * Whether a left-rail item should render as the active nav entry.
 * Tab-bearing items (Ad groups, Targeting, ...) share one view with their
 * siblings, so they're only active when the selected tab actually matches —
 * otherwise every tab in the group would highlight at once.
 */
export function isSidebarItemActive(
  item: { view: NavView; tab?: string },
  currentView: string,
  selectedTab: string | undefined,
): boolean {
  if (item.tab) {
    return (currentView === 'detail' || currentView === item.view) && selectedTab === item.tab;
  }
  return currentView === item.view;
}

/** Builds the formatted KPI tiles from a metrics snapshot (fail-fast on missing fields). */
export function getKpiTiles(m: MetricsSnapshot): KpiTile[] {
  if (
    !Number.isFinite(m.impressions) ||
    !Number.isFinite(m.clicks) ||
    !Number.isFinite(m.spend) ||
    !Number.isFinite(m.sales) ||
    !Number.isFinite(m.orders) ||
    !Number.isFinite(m.units)
  ) {
    throw new ValidationError('MetricsSnapshot requires finite numeric fields');
  }
  const { ctr, acos, roas } = calc(m);
  return [
    { key: 'impressions', label: 'Impressions', value: whole(m.impressions) },
    { key: 'clicks', label: 'Clicks', value: whole(m.clicks) },
    { key: 'spend', label: 'Spend', value: money(m.spend) },
    { key: 'sales', label: 'Sales', value: money(m.sales) },
    { key: 'orders', label: 'Orders', value: whole(m.orders) },
    { key: 'units', label: 'Units', value: whole(m.units) },
    { key: 'ctr', label: 'CTR', value: pct(ctr) },
    { key: 'acos', label: 'ACoS', value: pct(acos) },
    { key: 'roas', label: 'RoAS', value: roas.toFixed(2) },
  ];
}
