/**
 * Amazon Ad Console — pure business logic.
 *
 * All functions are stateless — they take state in and return new state.
 * Designed to work with any state management (Zustand, React context, etc.).
 */

import type {
  Campaign, CampaignType, CampaignStatus, CampaignDraft, MatchType, BudgetRule,
  Target, AdGroup, Metrics, DerivedMetrics,
  Campaign, CampaignType, CampaignStatus, CampaignDraft, MatchType,
  Target, AdGroup, Metrics, DerivedMetrics, Negative,
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

export function isFilteredByNegative(term: string, negatives: Negative[]): boolean {
  const termLower = term.toLowerCase();
  return negatives.some((n) => {
    const negLower = n.value.toLowerCase();
    if (n.type === 'Negative exact') return termLower === negLower;
    if (n.type === 'Negative phrase') return termLower.includes(negLower);
    return false;
  });
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
  adGroupId?: string,
): { campaign: Campaign; target: Target } {
  assertNonEmpty('keyword value', value);
  assertFiniteNonNegative('bid', bid);
  const agId = adGroupId ?? c.adGroups[0]?.id ?? generateId('AG');
  if (!c.adGroups.some((ag) => ag.id === agId)) {
    throw new ValidationError(`Unknown ad group: ${agId}`);
  }
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
      history: [...c.history, `Keyword "${value}" added to ad group (${match}, $${bid.toFixed(2)})`],
    },
    target,
  };
}

// ---------------------------------------------------------------------------
// Ad group operations
// ---------------------------------------------------------------------------

export function addAdGroup(c: Campaign, name: string): Campaign {
  assertNonEmpty('ad group name', name);
  const ag: AdGroup = {
    id: generateId('AG'),
    campaignId: c.id,
    name: name.trim(),
    status: 'Enabled',
    defaultBid: c.defaultBid ?? 0.75,
    metrics: { impressions: 0, clicks: 0, spend: 0, sales: 0, orders: 0 },
  };
  return {
    ...c,
    adGroups: [...c.adGroups, ag],
    history: [...c.history, `Ad group "${ag.name}" created`],
  };
}

export function renameAdGroup(c: Campaign, adGroupId: string, name: string): Campaign {
  assertNonEmpty('ad group name', name);
  const ag = c.adGroups.find((a) => a.id === adGroupId);
  if (!ag) throw new ValidationError(`Unknown ad group: ${adGroupId}`);
  return {
    ...c,
    adGroups: c.adGroups.map((a) => (a.id === adGroupId ? { ...a, name: name.trim() } : a)),
    history: [...c.history, `Ad group renamed to "${name.trim()}"`],
  };
}

export function setAdGroupStatus(c: Campaign, adGroupId: string, status: CampaignStatus): Campaign {
  const ag = c.adGroups.find((a) => a.id === adGroupId);
  if (!ag) throw new ValidationError(`Unknown ad group: ${adGroupId}`);
  return {
    ...c,
    adGroups: c.adGroups.map((a) => (a.id === adGroupId ? { ...a, status } : a)),
    targets: c.targets.map((t) => (t.adGroupId === adGroupId ? { ...t, status } : t)),
    history: [...c.history, `Ad group "${ag.name}" status -> ${status}`],
  };
}

export function setAdGroupDefaultBid(c: Campaign, adGroupId: string, defaultBid: number): Campaign {
  assertFiniteNonNegative('default bid', defaultBid);
  const ag = c.adGroups.find((a) => a.id === adGroupId);
  if (!ag) throw new ValidationError(`Unknown ad group: ${adGroupId}`);
  return {
    ...c,
    adGroups: c.adGroups.map((a) =>
      a.id === adGroupId ? { ...a, defaultBid: Math.max(0.02, defaultBid) } : a,
    ),
    history: [...c.history, `Ad group "${ag.name}" default bid -> $${Math.max(0.02, defaultBid).toFixed(2)}`],
  };
}

export function removeAdGroup(c: Campaign, adGroupId: string): Campaign {
  const ag = c.adGroups.find((a) => a.id === adGroupId);
  if (!ag) throw new ValidationError(`Unknown ad group: ${adGroupId}`);
  if (c.adGroups.length <= 1) {
    throw new ValidationError('A campaign must keep at least one ad group');
  }
  return {
    ...c,
    adGroups: c.adGroups.filter((a) => a.id !== adGroupId),
    targets: c.targets.filter((t) => t.adGroupId !== adGroupId),
    history: [...c.history, `Ad group "${ag.name}" removed`],
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


    // Generate search terms from keyword targets
    const generatedST: any[] = [];
    const matchGens: Record<string, (kw: string) => string[]> = {
      Exact: (kw: string) => [kw, kw.endsWith('s') ? kw.slice(0, -1) : kw + 's'],
      Phrase: (kw: string) => ['organic ' + kw, 'best ' + kw],
      Broad: (kw: string) => ['cheap ' + kw, kw + ' accessories', kw + ' deals'],
    };
    for (let si = 0; si < enabledTargets.length; si++) {
      const tgt = enabledTargets[si];
      if (tgt.type !== 'Keyword') continue;
      const genFn = matchGens[tgt.match];
      if (!genFn) continue;
      const generated = genFn(tgt.value);
      for (let gi = 0; gi < generated.length; gi++) {
        const gt = generated[gi];
        if (isFilteredByNegative(gt, c.negatives)) continue;
        let exists = false;
        for (let ei = 0; ei < generatedST.length; ei++) {
          if (generatedST[ei].term === gt) { exists = true; break; }
        }
        if (exists) continue;
        const termShare = 0.15 + Math.random() * 0.1;
        const termClicks = Math.max(1, Math.round(tgt.clicks * termShare));
        const termSpend = tgt.spend * termShare;
        const roasAdj = tgt.match === 'Exact' ? 4.0 : tgt.match === 'Phrase' ? 2.5 : 1.5;
        const termSales = termSpend * (roasAdj * (0.8 + Math.random() * 0.4));
        const rec = termSales > termSpend * 3
          ? 'Add as exact keyword'
          : termSales < termSpend ? 'Negate' : 'Review';
        generatedST.push({
          id: generateId('ST'),
          campaignId: c.id,
          adGroupId: tgt.adGroupId,
          term: gt,
          target: tgt.value,
          targetId: tgt.id,
          recommendation: rec,
          clicks: termClicks,
          spend: parseFloat(termSpend.toFixed(2)),
          sales: parseFloat(termSales.toFixed(2)),
          orders: Math.max(0, Math.round(termSales / 29.99)),
        });
      }
    }
    const allSearchTerms = c.searchTerms.concat(generatedST);
    return {
      ...c,
      metrics: newMetrics,
      targets: newTargets,
      adGroups: newAdGroups,
      searchTerms: allSearchTerms,
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
// Budget rule operations
// ---------------------------------------------------------------------------

const VALID_RULE_TYPES = ['Schedule', 'Performance'] as const;

export function addBudgetRule(
  c: Campaign,
  name: string,
  type: string,
  increase: number,
  condition: string,
): { campaign: Campaign; rule: BudgetRule } {
  assertNonEmpty('budget rule name', name);
  assertNonEmpty('budget rule condition', condition);
  if (!VALID_RULE_TYPES.includes(type as typeof VALID_RULE_TYPES[number])) {
    throw new ValidationError(`Invalid budget rule type: ${type}. Must be Schedule or Performance`);
  }
  if (!Number.isFinite(increase) || increase <= 0) {
    throw new ValidationError(`Budget rule increase must be a positive number, got ${increase}`);
  }
  const rule: BudgetRule = {
    id: generateId('BR'),
    campaignId: c.id,
    name: name.trim(),
    type,
    increase,
    condition: condition.trim(),
  };
  return {
    campaign: {
      ...c,
      budgetRules: [...c.budgetRules, rule],
      history: [...c.history, `Budget rule "${rule.name}" added (${type}, ${increase}x)`],
    },
    rule,
  };
}

export function removeBudgetRule(
  c: Campaign,
  ruleId: string,
): { campaign: Campaign; removed: boolean } {
  const idx = c.budgetRules.findIndex((r) => r.id === ruleId);
  if (idx === -1) return { campaign: c, removed: false };
  const removed = c.budgetRules[idx]!;
  return {
    campaign: {
      ...c,
      budgetRules: c.budgetRules.filter((r) => r.id !== ruleId),
      history: [...c.history, `Budget rule "${removed.name}" removed`],
    },
    removed: true,
  };
}

export function updateBudgetRule(
  c: Campaign,
  ruleId: string,
  updates: Partial<Pick<BudgetRule, 'name' | 'type' | 'increase' | 'condition'>>,
): { campaign: Campaign } {
  const idx = c.budgetRules.findIndex((r) => r.id === ruleId);
  if (idx === -1) throw new ValidationError(`Unknown budget rule: ${ruleId}`);
  if (updates.name !== undefined) assertNonEmpty('budget rule name', updates.name);
  if (updates.condition !== undefined) assertNonEmpty('budget rule condition', updates.condition);
  if (updates.type !== undefined && !VALID_RULE_TYPES.includes(updates.type as typeof VALID_RULE_TYPES[number])) {
    throw new ValidationError(`Invalid budget rule type: ${updates.type}`);
  }
  if (updates.increase !== undefined && (!Number.isFinite(updates.increase) || updates.increase <= 0)) {
    throw new ValidationError(`Budget rule increase must be a positive number, got ${updates.increase}`);
  }
  const rule = c.budgetRules[idx]!;
  const updated = { ...rule, ...updates };
  return {
    campaign: {
      ...c,
      budgetRules: c.budgetRules.map((r) => (r.id === ruleId ? updated : r)),
      history: [...c.history, `Budget rule "${updated.name}" updated`],
    },
  };
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Portfolio operations
// ---------------------------------------------------------------------------

export function createPortfolio(portfolios: string[], name: string): string[] {
  assertNonEmpty('portfolio name', name);
  const trimmed = name.trim();
  if (portfolios.includes(trimmed)) return portfolios;
  return [...portfolios, trimmed];
}

export function renamePortfolio(
  portfolios: string[],
  campaigns: Campaign[],
  oldName: string,
  newName: string,
): { portfolios: string[]; campaigns: Campaign[] } {
  assertNonEmpty('old portfolio name', oldName);
  assertNonEmpty('new portfolio name', newName);
  const trimmedOld = oldName.trim();
  const trimmedNew = newName.trim();
  if (!portfolios.includes(trimmedOld)) {
    throw new ValidationError(`Unknown portfolio: ${trimmedOld}`);
  }
  return {
    portfolios: portfolios.map((p) => (p === trimmedOld ? trimmedNew : p)),
    campaigns: campaigns.map((c) =>
      c.portfolio === trimmedOld ? { ...c, portfolio: trimmedNew } : c,
    ),
  };
}

export function deletePortfolio(
  portfolios: string[],
  campaigns: Campaign[],
  name: string,
): { portfolios: string[]; campaigns: Campaign[] } {
  assertNonEmpty('portfolio name', name);
  const trimmed = name.trim();
  if (!portfolios.includes(trimmed)) {
    throw new ValidationError(`Unknown portfolio: ${trimmed}`);
  }
  if (portfolios.length <= 1) {
    throw new ValidationError('Cannot delete the last portfolio');
  }
  return {
    portfolios: portfolios.filter((p) => p !== trimmed),
    campaigns: campaigns.map((c) =>
      c.portfolio === trimmed ? { ...c, portfolio: '' } : c,
    ),
  };
}

export function assignCampaignToPortfolio(
  campaigns: Campaign[],
  campaignId: string,
  portfolioName: string,
): Campaign[] {
  assertNonEmpty('portfolio name', portfolioName);
  const trimmed = portfolioName.trim();
  const idx = campaigns.findIndex((c) => c.id === campaignId);
  if (idx === -1) {
    throw new ValidationError(`Unknown campaign: ${campaignId}`);
  }
  return campaigns.map((c, i) =>
    i === idx ? { ...c, portfolio: trimmed, history: [...c.history, `Portfolio assigned to "${trimmed}"`] } : c,
  );
}

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

// ---------------------------------------------------------------------------
// Wizard helpers — product selection & keyword parsing
// ---------------------------------------------------------------------------

export function selectProduct(draft: CampaignDraft, asin: string): CampaignDraft {
  assertNonEmpty('product ASIN', asin);
  const trimmed = asin.trim();
  if (draft.products.includes(trimmed)) return draft;
  return { ...draft, products: [...draft.products, trimmed] };
}

export function removeProduct(draft: CampaignDraft, asin: string): CampaignDraft {
  assertNonEmpty('product ASIN', asin);
  const trimmed = asin.trim();
  if (!draft.products.includes(trimmed)) return draft;
  if (draft.products.length <= 1) {
    throw new ValidationError('A campaign must keep at least one product');
  }
  return { ...draft, products: draft.products.filter((p) => p !== trimmed) };
}

const MAX_KEYWORD_LENGTH = 200;

export function parseKeywords(raw: string): string[] {
  if (!raw || !raw.trim()) return [];
  return raw
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => {
      if (!line) return false;
      if (line.length > MAX_KEYWORD_LENGTH) {
        throw new ValidationError(`Keyword exceeds ${MAX_KEYWORD_LENGTH} characters`);
      }
      return true;
    });
}

// ---------------------------------------------------------------------------
// Responsive breakpoints & mobile menu state machine
// ---------------------------------------------------------------------------

export type Breakpoint = 'mobile' | 'tablet' | 'desktop';
export type MenuStatus = 'closed' | 'open' | 'closing';

export interface MobileMenuState {
  status: MenuStatus;
}

export type MobileMenuAction =
  | { type: 'INIT' }
  | { type: 'TOGGLE' }
  | { type: 'OPEN' }
  | { type: 'CLOSE' }
  | { type: 'ANIMATION_END' };

const MOBILE_BREAKPOINT = 768;
const TABLET_BREAKPOINT = 1100;

export function resolveBreakpoint(width: number): Breakpoint {
  if (width < MOBILE_BREAKPOINT) return 'mobile';
  if (width <= TABLET_BREAKPOINT) return 'tablet';
  return 'desktop';
}

export function mobileMenuReducer(
  state?: MobileMenuState,
  action?: MobileMenuAction,
): MobileMenuState {
  if (!state || action?.type === 'INIT') return { status: 'closed' };
  switch (action?.type) {
    case 'TOGGLE':
      if (state.status === 'closed') return { status: 'open' };
      if (state.status === 'open') return { status: 'closing' };
      return state;
    case 'OPEN':
      return { status: 'open' };
    case 'CLOSE':
      return { status: 'closing' };
    case 'ANIMATION_END':
      if (state.status === 'closing') return { status: 'closed' };
      return state;
    default:
      return state;
  }
}

export function isTouchViewport(hasTouch: boolean, width: number): boolean {
  return hasTouch && width <= TABLET_BREAKPOINT;
}
