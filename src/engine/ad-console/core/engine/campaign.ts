/**
 * Campaign normalization and lifecycle operations.
 */
import type {
  Campaign, CampaignType, CampaignStatus,
  Target, AdGroup, ProductAd, Ad,
} from '../types';
import { assertCampaignType, assertCampaignStatus } from '../../../../lib/validation';
import { generateId } from './id';
import { metricDefaults, clampBid } from './metrics';

/** Fill a partial target with defaults and clamp its bid to the $0.02 minimum. */
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
    bid: clampBid(t.bid ?? 0.75),
    status: ['Enabled', 'Paused', 'Archived', 'Draft'].includes(t.status ?? '')
      ? (t.status! as CampaignStatus)
      : 'Enabled',
    impressions: t.impressions ?? 0,
    clicks: t.clicks ?? 0,
    spend: t.spend ?? 0,
    sales: t.sales ?? 0,
    orders: t.orders ?? 0,
    refinements: t.refinements,
  };
}

/** Fill a partial product ad with defaults (ASIN, status, zeroed metrics). */
function normalizeProductAd(
  pa: Partial<ProductAd>,
  campaignId: string,
  adGroupId: string,
): ProductAd {
  return {
    id: pa.id ?? generateId('PA'),
    campaignId: pa.campaignId ?? campaignId,
    adGroupId: pa.adGroupId ?? adGroupId,
    asin: pa.asin ?? 'B0TRAIN001',
    status: ['Enabled', 'Paused', 'Archived', 'Draft'].includes(pa.status ?? '')
      ? (pa.status! as CampaignStatus)
      : 'Enabled',
    metrics: metricDefaults(pa.metrics ?? {}),
  };
}

/** Fill a partial SB/SD ad with defaults (format, status, creative, metrics). */
function normalizeAd(
  a: Partial<Ad>,
  campaignId: string,
  adGroupId: string,
): Ad {
  return {
    id: a.id ?? generateId('AD'),
    campaignId: a.campaignId ?? campaignId,
    adGroupId: a.adGroupId ?? adGroupId,
    adFormat: a.adFormat ?? 'Product collection',
    status: ['Enabled', 'Paused', 'Archived', 'Draft'].includes(a.status ?? '')
      ? (a.status! as CampaignStatus)
      : 'Enabled',
    creative: a.creative ?? {
      brandName: '',
      logo: '',
      headline: '',
      destination: 'Product detail page',
      video: '',
      image: 'Auto generated',
    },
    metrics: metricDefaults(a.metrics ?? {}),
  };
}

/**
 * Fill a partial campaign into a complete, valid Campaign: applies type-aware
 * defaults, clamps budget/bid to minimums, ensures a primary ad group, and
 * normalizes every child collection (targets, negatives, search terms, etc.).
 * Throws ValidationError on an invalid type/status.
 */
export function normalizeCampaign(c: Partial<Campaign>): Campaign {
  assertCampaignType(c.type ?? 'SP');
  const type: CampaignType = c.type ?? 'SP';
  assertCampaignStatus(c.status ?? 'Paused');
  const id = c.id ?? generateId('C-' + type);
  const primaryAg: AdGroup = {
    id: c.adGroups?.[0]?.id ?? generateId('AG'),
    campaignId: id,
    name: c.adGroups?.[0]?.name ?? `${type} default ad group`,
    status: c.adGroups?.[0]?.status ?? 'Enabled',
    defaultBid: clampBid(c.adGroups?.[0]?.defaultBid ?? c.defaultBid ?? 0.75),
    metrics: metricDefaults(c.adGroups?.[0]?.metrics ?? {}),
  };

  const adGroups = c.adGroups?.length
    ? c.adGroups.map((ag) => ({
        ...primaryAg,
        ...ag,
        defaultBid: clampBid(ag.defaultBid ?? primaryAg.defaultBid),
        metrics: metricDefaults(ag.metrics ?? {}),
      }))
    : [primaryAg];

  const primaryAgId = adGroups[0].id;

  return {
    id,
    type,
    name: c.name ?? `${type} | Training campaign`,
    portfolio: c.portfolio ?? 'Training Portfolio',
    portfolioId: c.portfolioId,
    status: ['Enabled', 'Paused', 'Archived', 'Draft'].includes(c.status ?? '')
      ? c.status! as CampaignStatus
      : 'Paused',
    dailyBudget: Math.max(1, c.dailyBudget ?? 1),
    defaultBid: clampBid(c.defaultBid ?? 0.75),
    startDate: c.startDate ?? new Date().toISOString().slice(0, 10),
    endDate: c.endDate ?? null,
    targetingMode: c.targetingMode ?? (type === 'SP' ? 'Automatic' : type === 'SB' ? 'Keyword' : 'Contextual'),
    adFormat: c.adFormat ?? (type === 'SB' ? 'Product collection' : type === 'SD' ? 'Auto generated' : 'Standard'),
    campaignGoal: c.campaignGoal ?? (type === 'SD' ? 'Conversions' : undefined),
    bidStrategy: c.bidStrategy ?? (type === 'SP' ? 'Dynamic bids - down only' : 'Cost per click'),
    placements: { top: 0, product: 0, rest: 0, ...(c.placements ?? {}) },
    products: c.products?.length ? [...Array.from(new Set(c.products))] : ['B0TRAIN001'],
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
    adGroups,
    targets: (c.targets ?? []).map((t) => normalizeTarget(t, id, primaryAgId)),
    searchTerms: (c.searchTerms ?? []).map((st) => ({
      id: st.id ?? generateId('ST'),
      campaignId: st.campaignId ?? id,
      adGroupId: st.adGroupId ?? primaryAgId,
      term: st.term ?? '',
      targetId: st.targetId ?? '',
      targetValue: st.targetValue ?? '',
      targetType: st.targetType ?? 'Keyword',
      matchType: st.matchType ?? '',
      recommendation: st.recommendation ?? 'Review',
      clicks: st.clicks ?? 0,
      spend: st.spend ?? 0,
      sales: st.sales ?? 0,
      orders: st.orders ?? 0,
      impressions: st.impressions ?? 0,
    })),
    negatives: (c.negatives ?? []).filter((n) => n.value).map((n) => ({
      id: n.id ?? generateId('NEG'),
      campaignId: n.campaignId ?? id,
      adGroupId: n.adGroupId ?? primaryAgId ?? null,
      type: n.type ?? 'Negative exact',
      value: n.value,
      status: n.status ?? 'Enabled',
      sourceSearchTermId: n.sourceSearchTermId,
    })),
    budgetRules: (c.budgetRules ?? []).map((r, i) => ({
      id: r.id ?? generateId('BR'),
      campaignId: r.campaignId ?? id,
      name: r.name ?? `Budget rule ${i + 1}`,
      type: r.type ?? 'Schedule',
      increase: Math.max(1, r.increase ?? 1),
      condition: r.condition ?? 'Training condition',
      startDate: r.startDate,
      endDate: r.endDate,
      scheduleType: r.scheduleType,
      daysOfWeek: r.daysOfWeek,
    })),
    productAds: (c.productAds ?? []).map((pa) => normalizeProductAd(pa, id, primaryAgId)),
    ads: (c.ads ?? []).map((a) => normalizeAd(a, id, primaryAgId)),
    history: [...(c.history ?? [])],
    createdBySimulator: c.createdBySimulator ?? true,
  };
}

/** Flip a campaign Enabled↔Paused, cascading the status to its child entities. Archived campaigns are unchanged. */
export function toggleCampaignStatus(c: Campaign): Campaign {
  if (c.status === 'Archived') return c;
  const next: CampaignStatus = c.status === 'Enabled' ? 'Paused' : 'Enabled';
  return {
    ...c,
    status: next,
    adGroups: c.adGroups.map((ag) => ({ ...ag, status: next })),
    targets: c.targets.map((t) => ({ ...t, status: next })),
    productAds: c.productAds.map((pa) => ({ ...pa, status: next })),
    ads: c.ads.map((a) => ({ ...a, status: next })),
    history: [...c.history, `Status changed to ${next}`],
  };
}

/** Archive a campaign and all of its child entities. */
export function archiveCampaign(c: Campaign): Campaign {
  return {
    ...c,
    status: 'Archived',
    adGroups: c.adGroups.map((ag) => ({ ...ag, status: 'Archived' })),
    targets: c.targets.map((t) => ({ ...t, status: 'Archived' })),
    productAds: c.productAds.map((pa) => ({ ...pa, status: 'Archived' })),
    ads: c.ads.map((a) => ({ ...a, status: 'Archived' })),
    history: [...c.history, 'Campaign archived'],
  };
}

/** Deep-copy a campaign into a new Paused draft: fresh ids, zeroed metrics, no search terms. */
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
    productAds: c.productAds.map((pa) => ({
      ...pa,
      id: generateId('PA'),
      campaignId: newId,
      adGroupId: newAgId,
      metrics: metricDefaults({}),
    })),
    ads: c.ads.map((a) => ({
      ...a,
      id: generateId('AD'),
      campaignId: newId,
      adGroupId: newAgId,
      metrics: metricDefaults({}),
    })),
  });
}

/** Apply editable campaign-level settings (budget, bid, strategy, status, creative) and log the diff to history. */
export function updateCampaignSettings(
  c: Campaign,
  updates: Partial<Pick<Campaign, 'dailyBudget' | 'defaultBid' | 'bidStrategy' | 'status' | 'creativeStatus' | 'creativeIssue'>>,
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
  if (updates.creativeStatus !== undefined && updates.creativeStatus !== c.creativeStatus) {
    changes.push(`creative status: ${c.creativeStatus || 'none'} → ${updates.creativeStatus}`);
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

/** Save placement bid adjustments (top of search / product pages / rest of search) and log changes. */
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