/**
 * Amazon Ad Console — pure business logic.
 *
 * All functions are stateless — they take state in and return new state.
 * Designed to work with any state management (Zustand, React context, etc.).
 */

import type {
  Campaign, CampaignType, CampaignStatus, CampaignDraft, MatchType,
  Target, AdGroup, Metrics, DerivedMetrics,
  AdConsoleState, FilterState, ActionLogEntry,
} from './types';
import {
  assertFiniteNonNegative,
  assertNonEmpty,
  assertCampaignType,
  assertCampaignStatus,
  ValidationError,
} from '../../../lib/validation';

// ---------------------------------------------------------------------------
// ID generation
// ---------------------------------------------------------------------------
let _counter = 0;
export function generateId(prefix: string = 'C'): string {
  _counter++;
  return `${prefix}-${Date.now().toString(36)}-${_counter}`;
}

// ---------------------------------------------------------------------------
// Metrics helpers
// ---------------------------------------------------------------------------

export function calc(metrics: Metrics): DerivedMetrics {
  assertFiniteNonNegative('impressions', metrics.impressions);
  assertFiniteNonNegative('clicks', metrics.clicks);
  assertFiniteNonNegative('spend', metrics.spend);
  assertFiniteNonNegative('sales', metrics.sales);
  assertFiniteNonNegative('orders', metrics.orders);
  const ctr = metrics.impressions ? (metrics.clicks / metrics.impressions) * 100 : 0;
  const cpc = metrics.clicks ? metrics.spend / metrics.clicks : 0;
  const acos = metrics.sales ? (metrics.spend / metrics.sales) * 100 : 0;
  const roas = metrics.spend ? metrics.sales / metrics.spend : 0;
  const cvr = metrics.clicks ? (metrics.orders / metrics.clicks) * 100 : 0;
  return { ctr, cpc, acos, roas, cvr };
}

export function totalMetrics(campaigns: Campaign[]): Metrics {
  return campaigns.reduce(
    (acc, c) => {
      acc.impressions += c.metrics.impressions;
      acc.clicks += c.metrics.clicks;
      acc.spend += c.metrics.spend;
      acc.sales += c.metrics.sales;
      acc.orders += c.metrics.orders;
      return acc;
    },
    { impressions: 0, clicks: 0, spend: 0, sales: 0, orders: 0 },
  );
}

export function metricDefaults(m: Partial<Metrics>): Metrics {
  return {
    impressions: m.impressions ?? 0,
    clicks: m.clicks ?? 0,
    spend: m.spend ?? 0,
    sales: m.sales ?? 0,
    orders: m.orders ?? 0,
  };
}

// ---------------------------------------------------------------------------
// Campaign normalization
// ---------------------------------------------------------------------------

export function normalizeCampaign(c: Partial<Campaign>): Campaign {
  assertCampaignType(c.type ?? 'SP');
  const type = c.type as CampaignType;
  assertCampaignStatus(c.status ?? 'Paused');
  const id = c.id ?? generateId('C-' + type);
  const primaryAg: AdGroup = {
    id: c.adGroups?.[0]?.id ?? generateId('AG'),
    campaignId: id,
    name: c.adGroups?.[0]?.name ?? `${type} default ad group`,
    status: c.adGroups?.[0]?.status ?? 'Enabled',
    defaultBid: c.adGroups?.[0]?.defaultBid ?? c.defaultBid ?? 0.75,
    metrics: metricDefaults(c.adGroups?.[0]?.metrics ?? {}),
  };

  return {
    id,
    type,
    name: c.name ?? `${type} | Training campaign`,
    portfolio: c.portfolio ?? 'Training Portfolio',
    status: ['Enabled', 'Paused', 'Archived', 'Draft'].includes(c.status ?? '') ? c.status! as CampaignStatus : 'Paused',
    dailyBudget: Math.max(1, c.dailyBudget ?? 1),
    defaultBid: Math.max(0.02, c.defaultBid ?? 0.75),
    startDate: c.startDate ?? new Date().toISOString().slice(0, 10),
    endDate: c.endDate ?? null,
    targetingMode: (c.targetingMode ?? (type === 'SP' ? 'Automatic' : type === 'SB' ? 'Keyword' : 'Contextual')) as any,
    adFormat: (c.adFormat ?? (type === 'SB' ? 'Product collection' : type === 'SD' ? 'Auto generated' : 'Standard')) as any,
    bidStrategy: (c.bidStrategy ?? (type === 'SP' ? 'Dynamic bids - down only' : 'Cost per click')) as any,
    placements: { top: 0, product: 0, rest: 0, ...(c.placements ?? {}) },
    products: c.products?.length ? [...new Set(c.products)] : ['B0TRAIN001'],
    creative: type === 'SP' ? null : {
      brandName: '',
      logo: '',
      headline: '',
      destination: 'Product detail page',
      video: '',
      image: 'Auto generated',
      ...(c.creative ?? {}),
    },
    creativeStatus: c.creativeStatus ?? 'Approved',
    creativeIssue: c.creativeIssue ?? '',
    metrics: metricDefaults(c.metrics ?? {}),
    adGroups: c.adGroups?.length ? c.adGroups.map((ag) => ({
      ...primaryAg,
      ...ag,
      metrics: metricDefaults(ag.metrics ?? {}),
    })) : [primaryAg],
    targets: (c.targets ?? []).map((t) => normalizeTarget(t, id, primaryAg.id)),
    searchTerms: (c.searchTerms ?? []).map((st) => ({
      id: st.id ?? generateId('ST'),
      campaignId: st.campaignId ?? id,
      adGroupId: st.adGroupId ?? primaryAg.id,
      term: st.term ?? '',
      target: st.target ?? '',
      targetId: st.targetId,
      recommendation: st.recommendation ?? 'Review',
      clicks: st.clicks ?? 0,
      spend: st.spend ?? 0,
      sales: st.sales ?? 0,
      orders: st.orders ?? 0,
    })),
    negatives: (c.negatives ?? []).filter((n) => n.value).map((n) => ({
      id: n.id ?? generateId('NEG'),
      campaignId: n.campaignId ?? id,
      adGroupId: n.adGroupId ?? primaryAg.id,
      type: n.type ?? 'Negative exact',
      value: n.value,
      sourceSearchTermId: n.sourceSearchTermId,
    })),
    budgetRules: (c.budgetRules ?? []).map((r, i) => ({
      id: r.id ?? generateId('BR'),
      campaignId: r.campaignId ?? id,
      name: r.name ?? `Budget rule ${i + 1}`,
      type: r.type ?? 'Schedule',
      increase: Math.max(1, r.increase ?? 1),
      condition: r.condition ?? 'Training condition',
    })),
    history: [...(c.history ?? [])],
    createdBySimulator: c.createdBySimulator ?? true,
  };
}

function normalizeTarget(
  t: Partial<Target>,
  campaignId: string,
  adGroupId: string,
): Target {
  return {
    id: t.id ?? generateId('T'),
    campaignId: t.campaignId ?? campaignId,
    adGroupId: t.adGroupId ?? adGroupId,
    type: t.type ?? 'Keyword',
    value: t.value ?? 'training target',
    match: t.match ?? 'Exact',
    bid: Math.max(0.02, t.bid ?? 0.75),
    status: ['Enabled', 'Paused', 'Archived', 'Draft'].includes(t.status ?? '')
      ? (t.status! as CampaignStatus)
      : 'Enabled',
    impressions: t.impressions ?? 0,
    clicks: t.clicks ?? 0,
    spend: t.spend ?? 0,
    sales: t.sales ?? 0,
    orders: t.orders ?? 0,
  };
}

// ---------------------------------------------------------------------------
// Campaign operations
// ---------------------------------------------------------------------------

export function toggleCampaignStatus(c: Campaign): Campaign {
  if (c.status === 'Archived') return c;
  const next: CampaignStatus = c.status === 'Enabled' ? 'Paused' : 'Enabled';
  return {
    ...c,
    status: next,
    adGroups: c.adGroups.map((ag) => ({ ...ag, status: next })),
    targets: c.targets.map((t) => ({ ...t, status: next })),
    history: [...c.history, `Status changed to ${next}`],
  };
}

export function archiveCampaign(c: Campaign): Campaign {
  return {
    ...c,
    status: 'Archived',
    adGroups: c.adGroups.map((ag) => ({ ...ag, status: 'Archived' })),
    targets: c.targets.map((t) => ({ ...t, status: 'Archived' })),
    history: [...c.history, 'Campaign archived'],
  };
}

export function duplicateCampaign(c: Campaign): Campaign {
  const newId = generateId('C-' + c.type);
  const newAgId = generateId('AG');
  return normalizeCampaign({
    ...c,
    id: newId,
    name: c.name + ' (copy)',
    status: 'Paused' as CampaignStatus,
    metrics: metricDefaults({}),
    history: [],
    adGroups: c.adGroups.map((ag) => ({
      ...ag,
      id: ag.id === c.adGroups[0]?.id ? newAgId : generateId('AG'),
      campaignId: newId,
    })),
    targets: c.targets.map((t) => ({
      ...t,
      id: generateId('T'),
      campaignId: newId,
      adGroupId: newAgId,
      impressions: 0, clicks: 0, spend: 0, sales: 0, orders: 0,
    })),
    searchTerms: [],
    negatives: c.negatives.map((n) => ({
      ...n,
      id: generateId('NEG'),
      campaignId: newId,
      adGroupId: newAgId,
    })),
    budgetRules: c.budgetRules.map((r) => ({
      ...r,
      id: generateId('BR'),
      campaignId: newId,
    })),
  });
}

// ---------------------------------------------------------------------------
// Target/keyword operations
// ---------------------------------------------------------------------------

export function addTarget(
  c: Campaign,
  value: string,
  match: MatchType | string,
  bid: number,
): { campaign: Campaign; target: Target } {
  assertNonEmpty('keyword value', value);
  assertFiniteNonNegative('bid', bid);
  const agId = c.adGroups[0]?.id ?? generateId('AG');
  const target: Target = {
    id: generateId('T'),
    campaignId: c.id,
    adGroupId: agId,
    type: 'Keyword',
    value,
    match,
    bid: Math.max(0.02, bid),
    status: 'Enabled',
    impressions: 0, clicks: 0, spend: 0, sales: 0, orders: 0,
  };
  return {
    campaign: {
      ...c,
      targets: [...c.targets, target],
      history: [...c.history, `Keyword "${value}" added (${match}, $${bid.toFixed(2)})`],
    },
    target,
  };
}

export function removeTarget(c: Campaign, targetId: string): Campaign {
  const idx = c.targets.findIndex((t) => t.id === targetId);
  if (idx === -1) return c;
  const removed = c.targets[idx];
  return {
    ...c,
    targets: c.targets.filter((t) => t.id !== targetId),
    history: [...c.history, `Target "${removed.value}" removed`],
  };
}

export function setTargetBid(c: Campaign, targetId: string, newBid: number): Campaign {
  return {
    ...c,
    targets: c.targets.map((t) =>
      t.id === targetId
        ? { ...t, bid: Math.max(0.02, newBid) }
        : t,
    ),
    history: [
      ...c.history,
      (() => {
        const t = c.targets.find((x) => x.id === targetId);
        return t
          ? `Bid for "${t.value}" changed from $${t.bid.toFixed(2)} to $${Math.max(0.02, newBid).toFixed(2)}`
          : `Bid updated for target ${targetId}`;
      })(),
    ],
  };
}

export function adjustTargetBid(c: Campaign, targetId: string, multiplier: number): Campaign {
  const t = c.targets.find((x) => x.id === targetId);
  if (!t) return c;
  return setTargetBid(c, targetId, t.bid * multiplier);
}

export function pauseTarget(c: Campaign, targetId: string): Campaign {
  return {
    ...c,
    targets: c.targets.map((t) =>
      t.id === targetId
        ? { ...t, status: (t.status === 'Paused' ? 'Enabled' : 'Paused') as CampaignStatus }
        : t,
    ),
    history: [
      ...c.history,
      (() => {
        const t = c.targets.find((x) => x.id === targetId);
        return t ? `Target "${t.value}" ${t.status === 'Paused' ? 'paused' : 'enabled'}` : '';
      })(),
    ],
  };
}

// ---------------------------------------------------------------------------
// Search term operations
// ---------------------------------------------------------------------------

export function addNegative(
  c: Campaign,
  term: string,
  type: string = 'Negative exact',
): Campaign {
  const agId = c.adGroups[0]?.id ?? generateId('AG');
  const existing = c.negatives.some(
    (n) => n.value.toLowerCase() === term.toLowerCase() && n.type === type,
  );
  if (existing) return c;
  return {
    ...c,
    negatives: [
      ...c.negatives,
      {
        id: generateId('NEG'),
        campaignId: c.id,
        adGroupId: agId,
        type,
        value: term,
      },
    ],
    history: [...c.history, `Negative "${type}" added for "${term}"`],
  };
}

export function harvestTerm(c: Campaign, term: string, targetValue?: string): Campaign {
  const agId = c.adGroups[0]?.id ?? generateId('AG');
  const existing = c.targets.some(
    (t) => t.value.toLowerCase() === term.toLowerCase() && t.type === 'Keyword',
  );
  if (existing) return c;
  const newTarget: Target = {
    id: generateId('T'),
    campaignId: c.id,
    adGroupId: agId,
    type: 'Keyword',
    value: term,
    match: 'Exact',
    bid: 0.75,
    status: 'Enabled',
    impressions: 0, clicks: 0, spend: 0, sales: 0, orders: 0,
  };
  // Link search term to new target
  return {
    ...c,
    targets: [...c.targets, newTarget],
    searchTerms: c.searchTerms.map((st) =>
      st.term.toLowerCase() === term.toLowerCase()
        ? { ...st, targetId: newTarget.id, target: term }
        : st,
    ),
    history: [...c.history, `Search term "${term}" harvested as exact keyword`],
  };
}

// ---------------------------------------------------------------------------
// Simulation
// ---------------------------------------------------------------------------

export function simulateDays(
  campaigns: Campaign[],
  days: number = 7,
): Campaign[] {
  const avgPrice = 29.99; // Default average price
  return campaigns.map((c) => {
    if (c.status !== 'Enabled') return c;

    const quality =
      c.negatives.length * 0.03 +
      c.budgetRules.length * 0.02 +
      (c.placements.top > 30 ? 0.04 : 0) +
      (c.type === 'SD' && c.targetingMode.includes('Remarketing') ? 0.05 : 0);
    const spend = Math.min(
      c.dailyBudget * days * (0.72 + Math.random() * 0.25),
      c.dailyBudget * days,
    );
    const roasBase = c.type === 'SP' ? 3.2 : c.type === 'SB' ? 2.7 : 3.5;
    const sales = spend * (roasBase + quality + (Math.random() - 0.4));
    const clicks = Math.round(
      spend / Math.max(0.35, c.defaultBid * (0.85 + Math.random() * 0.35)),
    );
    const impressions = Math.round(clicks / (0.006 + Math.random() * 0.012));
    const orders = Math.max(0, Math.round(sales / avgPrice));

    const newMetrics: Metrics = {
      impressions: c.metrics.impressions + impressions,
      clicks: c.metrics.clicks + clicks,
      spend: c.metrics.spend + spend,
      sales: c.metrics.sales + Math.max(0, sales),
      orders: c.metrics.orders + orders,
    };

    // Distribute to targets
    const enabledTargets = c.targets.filter((t) => t.status === 'Enabled');
    const share = 1 / Math.max(1, enabledTargets.length);
    const newTargets = c.targets.map((t) => {
      if (t.status !== 'Enabled') return t;
      return {
        ...t,
        impressions: t.impressions + Math.round(impressions * share),
        clicks: t.clicks + Math.round(clicks * share),
        spend: t.spend + spend * share,
        sales: t.sales + Math.max(0, sales * share * (0.8 + Math.random() * 0.4)),
        orders: t.orders + Math.round(orders * share),
      };
    });

    // Compute ad group metrics from targets
    const newAdGroups = c.adGroups.map((ag) => {
      const tgts = enabledTargets.filter((t) => t.adGroupId === ag.id);
      if (tgts.length) {
        const agMetrics = tgts.reduce(
          (s, t) => ({
            impressions: s.impressions + t.impressions,
            clicks: s.clicks + t.clicks,
            spend: s.spend + t.spend,
            sales: s.sales + t.sales,
            orders: s.orders + t.orders,
          }),
          { impressions: 0, clicks: 0, spend: 0, sales: 0, orders: 0 },
        );
        return { ...ag, metrics: agMetrics };
      }
      return { ...ag, metrics: metricDefaults({}) };
    });

    return {
      ...c,
      metrics: newMetrics,
      targets: newTargets,
      adGroups: newAdGroups,
      history: [...c.history, `${days}-day simulation: $${spend.toFixed(2)} spend, ${orders} orders`],
    };
  });
}

// ---------------------------------------------------------------------------
// Settings
// ---------------------------------------------------------------------------

export function updateCampaignSettings(
  c: Campaign,
  updates: Partial<Pick<Campaign, 'dailyBudget' | 'defaultBid' | 'bidStrategy' | 'status'>>,
): Campaign {
  const changes: string[] = [];
  if (updates.dailyBudget !== undefined && updates.dailyBudget !== c.dailyBudget) {
    changes.push(`budget $${c.dailyBudget.toFixed(2)} → $${updates.dailyBudget.toFixed(2)}`);
  }
  if (updates.defaultBid !== undefined && updates.defaultBid !== c.defaultBid) {
    changes.push(`default bid $${c.defaultBid.toFixed(2)} → $${updates.defaultBid.toFixed(2)}`);
  }
  if (updates.bidStrategy !== undefined && updates.bidStrategy !== c.bidStrategy) {
    changes.push(`bid strategy: ${c.bidStrategy} → ${updates.bidStrategy}`);
  }
  if (updates.status !== undefined && updates.status !== c.status) {
    changes.push(`status: ${c.status} → ${updates.status}`);
  }
  return {
    ...c,
    ...updates,
    history: [
      ...c.history,
      changes.length ? `Settings saved: ${changes.join(', ')}` : 'Settings saved (no changes)',
    ],
  };
}

// ---------------------------------------------------------------------------
// Placements
// ---------------------------------------------------------------------------

export function savePlacements(
  c: Campaign,
  placements: { top: number; product: number; rest: number },
): Campaign {
  const old = c.placements;
  const changes: string[] = [];
  if (placements.top !== old.top) changes.push(`Top of Search: ${old.top}% → ${placements.top}%`);
  if (placements.product !== old.product) changes.push(`Product pages: ${old.product}% → ${placements.product}%`);
  if (placements.rest !== old.rest) changes.push(`Rest of Search: ${old.rest}% → ${placements.rest}%`);
  return {
    ...c,
    placements,
    history: [...c.history, changes.length ? `Placements updated: ${changes.join(', ')}` : 'Placements saved (no changes)'],
  };
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

export function campaignById(state: AdConsoleState, id: string): Campaign | undefined {
  return state.campaigns.find((c) => c.id === id);
}

export function filteredCampaigns(state: AdConsoleState): Campaign[] {
  return state.campaigns.filter((c) => {
    const typeOk = state.filter.type === 'All' || c.type === state.filter.type;
    const statusOk = state.filter.status === 'All' || c.status === state.filter.status;
    const portfolioOk = state.filter.portfolio === 'All' || c.portfolio === state.filter.portfolio;
    const q = state.filter.search.toLowerCase();
    const text = `${c.name} ${c.type} ${c.targetingMode} ${c.portfolio} ${c.adFormat}`.toLowerCase();
    return typeOk && statusOk && portfolioOk && (!q || text.includes(q));
  });
}

export function portfolioNames(campaigns: Campaign[]): string[] {
  const names = new Set(campaigns.map((c) => c.portfolio).filter(Boolean));
  return ['All', ...Array.from(names).sort()];
}

export function formatMoney(n: number): string {
  return '$' + n.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function formatWhole(n: number): string {
  return n.toLocaleString();
}

export function formatBid(n: number): string {
  return '$' + n.toFixed(2);
}

export function formatPercent(n: number): string {
  return n.toFixed(2) + '%';
}

export function formatRoas(n: number): string {
  return n.toFixed(2);
}

export function acosClass(acos: number): string {
  if (acos <= 30) return 'good';
  if (acos <= 50) return 'warn';
  return 'bad';
}
