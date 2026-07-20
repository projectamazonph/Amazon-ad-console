/**
 * Amazon Advertising Console — navigation + KPI model.
 *
 * Pure, framework-free data describing the real console structure:
 * the global nav sections, the contextual left rail, and the KPI tiles
 * shown on the home dashboard. Components stay thin and render from this.
 */

import { ValidationError } from '../../../lib/validation';
import type { CampaignType } from '../../../engine/ad-console/core/types';

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
  label: string;
  view: NavView;
}

export interface LeftRailItem {
  label: string;
  view: NavView;
  group: 'campaigns' | 'portfolios' | 'measurement' | 'tools';
  tab?: string;
  /** When set, clicking filters Campaign Manager to this ad-product type. */
  filterType?: CampaignType;
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
  { label: 'Campaign Manager', view: 'campaigns' },
  { label: 'Portfolios', view: 'portfolio' },
  { label: 'Measurement', view: 'dashboard' },
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
    { label: 'Sponsored Products', view: 'campaigns', group: 'measurement', filterType: 'SP' },
    { label: 'Sponsored Brands', view: 'campaigns', group: 'measurement', filterType: 'SB' },
    { label: 'Sponsored Display', view: 'campaigns', group: 'measurement', filterType: 'SD' },
    { label: 'Search catalog', view: 'campaigns', group: 'measurement' },
    { label: 'Search query performance', view: 'campaigns', group: 'measurement', tab: 'searchTerms' },
  ],
  create: [],
  reports: [],
  bulk: [],
  integrity: [],
  trainer: [],
  missions: [],
  drills: [],
};

/** Returns the left-rail items for a global-nav section, defaulting to Campaign Manager. */
export function getLeftRail(section: NavView): LeftRailItem[] {
  return LEFT_RAIL[section] ?? LEFT_RAIL.campaigns;
}

/**
 * Training-tools rail — the feature pages that are built into the engine but
 * were previously unreachable from any nav link. Rendered persistently in the
 * sidebar so every module is one click away.
 */
export const TOOLS_RAIL: LeftRailItem[] = [
  { label: 'Drills', view: 'drills', group: 'tools' },
  { label: 'Missions', view: 'missions', group: 'tools' },
  { label: 'Reports', view: 'reports', group: 'tools' },
  { label: 'Bulk operations', view: 'bulk', group: 'tools' },
  { label: 'Trainer', view: 'trainer', group: 'tools' },
  { label: 'Integrity', view: 'integrity', group: 'tools' },
];

/** Returns the always-available training-tools rail items. */
export function getToolsRail(): LeftRailItem[] {
  return TOOLS_RAIL;
}

/** KPI tile definitions in Amazon console order. */
export const KPI_TILES: KpiTile[] = [
  { key: 'impressions', label: 'Impressions' },
  { key: 'clicks', label: 'Clicks' },
  { key: 'cpc', label: 'CPC' },
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
  type: 'setView' | 'setTab' | 'setTabAndView' | 'filterAndView';
  view?: NavView;
  tab?: string;
  filterType?: CampaignType;
}

/** Translate a left-rail click into the store action(s) the sidebar should dispatch. */
export function resolveSidebarClick(
  item: { view: NavView; tab?: string; filterType?: CampaignType },
  currentView: string,
): SidebarClickAction {
  if (item.filterType) {
    return { type: 'filterAndView', view: item.view, filterType: item.filterType };
  }
  if (item.tab && currentView === 'detail') {
    return { type: 'setTab', tab: item.tab };
  }
  if (item.tab && currentView !== 'detail') {
    return { type: 'setTabAndView', tab: item.tab, view: item.view };
  }
  return { type: 'setView', view: item.view };
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
  const ctr = m.impressions ? (m.clicks / m.impressions) * 100 : 0;
  const acos = m.sales ? (m.spend / m.sales) * 100 : 0;
  const roas = m.spend ? m.sales / m.spend : 0;
  const cpc = m.clicks ? m.spend / m.clicks : 0;
  return [
    { key: 'impressions', label: 'Impressions', value: whole(m.impressions) },
    { key: 'clicks', label: 'Clicks', value: whole(m.clicks) },
    { key: 'cpc', label: 'CPC', value: money(cpc) },
    { key: 'spend', label: 'Spend', value: money(m.spend) },
    { key: 'sales', label: 'Sales', value: money(m.sales) },
    { key: 'orders', label: 'Orders', value: whole(m.orders) },
    { key: 'units', label: 'Units', value: whole(m.units) },
    { key: 'ctr', label: 'CTR', value: pct(ctr) },
    { key: 'acos', label: 'ACoS', value: pct(acos) },
    { key: 'roas', label: 'RoAS', value: roas.toFixed(2) },
  ];
}
