/**
 * Negative keyword/target operations and search term filtering.
 * Supports: Negative exact, Negative phrase, Negative ASIN, Negative category, Negative brand.
 * Can be applied at campaign level or ad group level.
 */
import type {
  Campaign, CampaignStatus, Negative, NegativeType, SearchTerm, Target
} from '../types';
import { generateId } from './id';

export function isFilteredByNegative(term: string, negatives: Negative[]): boolean {
  const termLower = term.toLowerCase();
  return negatives.some((n) => {
    // A disabled negative is kept on the campaign but stops filtering.
    if (n.status && n.status !== 'Enabled') return false;
    const negLower = n.value.toLowerCase();
    if (n.type === 'Negative exact') return termLower === negLower;
    if (n.type === 'Negative phrase') return termLower.includes(negLower);
    // ASIN/category/brand negatives don't filter search terms directly
    return false;
  });
}

export interface AddNegativeOptions {
  campaign: Campaign;
  value: string;
  type: NegativeType;
  adGroupId?: string; // optional = campaign-level negative
  sourceSearchTermId?: string;
}

export function addNegative(opts: AddNegativeOptions): Campaign {
  const { campaign: c, value, type, adGroupId, sourceSearchTermId } = opts;

  // Determine adGroupId: use provided, or first ad group for ad-group level, or null for campaign level
  let finalAdGroupId: string | null;
  if (adGroupId !== undefined) {
    finalAdGroupId = adGroupId;
  } else {
    finalAdGroupId = c.adGroups[0]?.id ?? null;
  }

  const existing = c.negatives.some(
    (n) => n.value.toLowerCase() === value.toLowerCase() && n.type === type && n.adGroupId === finalAdGroupId,
  );
  if (existing) return c;

  const level = finalAdGroupId ? 'ad group' : 'campaign';
  return {
    ...c,
    negatives: [
      ...c.negatives,
      {
        id: generateId('NEG'),
        campaignId: c.id,
        adGroupId: finalAdGroupId,
        type,
        value,
        status: 'Enabled',
        sourceSearchTermId,
      },
    ],
    history: [...c.history, `Negative ${type} "${value}" added at ${level} level`],
  };
}

export function addNegativeKeyword(
  c: Campaign,
  keyword: string,
  matchType: 'Negative exact' | 'Negative phrase',
  adGroupId?: string,
): Campaign {
  return addNegative({ campaign: c, value: keyword, type: matchType, adGroupId });
}

export function addNegativeAsin(
  c: Campaign,
  asin: string,
  adGroupId?: string,
): Campaign {
  return addNegative({ campaign: c, value: asin, type: 'Negative ASIN', adGroupId });
}

export function addNegativeCategory(
  c: Campaign,
  categoryId: string,
  adGroupId?: string,
): Campaign {
  return addNegative({ campaign: c, value: categoryId, type: 'Negative category', adGroupId });
}

export function removeNegative(c: Campaign, negativeId: string): Campaign {
  const idx = c.negatives.findIndex((n) => n.id === negativeId);
  if (idx === -1) return c;
  const removed = c.negatives[idx];
  return {
    ...c,
    negatives: c.negatives.filter((n) => n.id !== negativeId),
    history: [...c.history, `Negative "${removed.value}" (${removed.type}) removed`],
  };
}

export function setNegativeStatus(
  c: Campaign,
  negativeId: string,
  status: CampaignStatus,
): Campaign {
  const n = c.negatives.find((x) => x.id === negativeId);
  if (!n) return c;
  return {
    ...c,
    negatives: c.negatives.map((x) => (x.id === negativeId ? { ...x, status } : x)),
    history: [...c.history, `Negative "${n.value}" (${n.type}) ${status === 'Enabled' ? 'enabled' : status.toLowerCase()}`],
  };
}

/** Flip a negative between Enabled and Paused. */
export function toggleNegative(c: Campaign, negativeId: string): Campaign {
  const n = c.negatives.find((x) => x.id === negativeId);
  if (!n) return c;
  const next: CampaignStatus = (n.status ?? 'Enabled') === 'Enabled' ? 'Paused' : 'Enabled';
  return setNegativeStatus(c, negativeId, next);
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

  return {
    ...c,
    targets: [...c.targets, newTarget],
    searchTerms: c.searchTerms.map((st) =>
      st.term.toLowerCase() === term.toLowerCase()
        ? { ...st, targetId: newTarget.id, targetValue: term, target: term }
        : st,
    ),
    history: [...c.history, `Search term "${term}" harvested as exact keyword`],
  };
}

/**
 * Get search terms that are candidates for harvesting or negating
 * based on performance thresholds.
 */
export interface SearchTermFilterOptions {
  minSpend?: number;
  minClicks?: number;
  maxAcos?: number;
  minOrders?: number;
}

export function getHarvestCandidates(
  searchTerms: SearchTerm[],
  opts: SearchTermFilterOptions = {},
): SearchTerm[] {
  const { minSpend = 0, minClicks = 10, maxAcos = 30, minOrders = 1 } = opts;
  return searchTerms.filter((st) => {
    if (st.orders >= minOrders) return false; // Already converting
    if (st.clicks < minClicks) return false; // Not enough data
    if (st.spend < minSpend) return false;
    const acos = st.sales > 0 ? (st.spend / st.sales) * 100 : 100;
    return acos <= maxAcos; // Good ACoS but no orders yet
  });
}

export function getNegativeCandidates(
  searchTerms: SearchTerm[],
  opts: SearchTermFilterOptions = {},
): SearchTerm[] {
  const { minSpend = 10, minClicks = 5, maxAcos = 50, minOrders = 0 } = opts;
  return searchTerms.filter((st) => {
    if (st.orders >= minOrders && st.sales > 0) return false;
    if (st.clicks < minClicks) return false;
    if (st.spend < minSpend) return false;
    const acos = st.sales > 0 ? (st.spend / st.sales) * 100 : 100;
    return acos > maxAcos;
  });
}