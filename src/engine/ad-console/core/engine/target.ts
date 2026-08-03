/**
 * Target/keyword operations — add, remove, bid, pause.
 * Supports all target types: Keyword, ASIN, Category, Auto, Audience.
 */
import type {
  Campaign, CampaignStatus, MatchType, Target, TargetType
} from '../types';
import { assertNonEmpty, assertFiniteNonNegative, assertValidBid, ValidationError } from '../../../../lib/validation';
import { generateId } from './id';

export interface AddTargetOptions {
  campaign: Campaign;
  value: string;
  type: TargetType;
  match?: MatchType | string;
  bid: number;
  adGroupId?: string;
}

export function addTarget(opts: AddTargetOptions): { campaign: Campaign; target: Target } {
  const { campaign: c, value, type, match, bid, adGroupId } = opts;
  assertNonEmpty('target value', value);
  assertFiniteNonNegative('bid', bid);

  const agId = adGroupId ?? c.adGroups[0]?.id ?? generateId('AG');
  if (!c.adGroups.some((ag) => ag.id === agId)) {
    throw new ValidationError(`Unknown ad group: ${agId}`);
  }

  const target: Target = {
    id: generateId('T'),
    campaignId: c.id,
    adGroupId: agId,
    type,
    value,
    match: type === 'Keyword' ? (match ?? 'Exact') : '',
    bid: Math.max(0.02, bid),
    status: 'Enabled',
    impressions: 0, clicks: 0, spend: 0, sales: 0, orders: 0,
  };

  return {
    campaign: {
      ...c,
      targets: [...c.targets, target],
      history: [...c.history, `Target "${value}" (${type}) added to ad group (${match ?? 'N/A'}, $${Math.max(0.02, bid).toFixed(2)})`],
    },
    target,
  };
}

export function addKeyword(
  c: Campaign,
  keyword: string,
  match: MatchType,
  bid: number,
  adGroupId?: string,
): { campaign: Campaign; target: Target } {
  return addTarget({ campaign: c, value: keyword, type: 'Keyword', match, bid, adGroupId });
}

export function addAutoTarget(
  c: Campaign,
  autoType: 'close match' | 'loose match' | 'substitutes' | 'complements',
  bid: number,
  adGroupId?: string,
): { campaign: Campaign; target: Target } {
  const typeMap = {
    'close match': 'Auto - close match',
    'loose match': 'Auto - loose match',
    substitutes: 'Auto - substitutes',
    complements: 'Auto - complements',
  } as const;
  return addTarget({
    campaign: c,
    value: autoType,
    type: typeMap[autoType],
    bid,
    adGroupId,
  });
}

export function addAsinTarget(
  c: Campaign,
  asin: string,
  bid: number,
  adGroupId?: string,
  refinements?: Target['refinements'],
): { campaign: Campaign; target: Target } {
  const result = addTarget({
    campaign: c,
    value: asin,
    type: 'ASIN',
    bid,
    adGroupId,
  });
  if (refinements) {
    result.target.refinements = refinements;
  }
  return result;
}

export function addCategoryTarget(
  c: Campaign,
  categoryPath: string,
  bid: number,
  adGroupId?: string,
  refinements?: Target['refinements'],
): { campaign: Campaign; target: Target } {
  const result = addTarget({
    campaign: c,
    value: categoryPath,
    type: 'Category',
    bid,
    adGroupId,
  });
  if (refinements) {
    result.target.refinements = refinements;
  }
  return result;
}

export function removeTarget(c: Campaign, targetId: string): Campaign {
  const idx = c.targets.findIndex((t) => t.id === targetId);
  if (idx === -1) return c;
  const removed = c.targets[idx];
  return {
    ...c,
    targets: c.targets.filter((t) => t.id !== targetId),
    history: [...c.history, `Target "${removed.value}" (${removed.type}) removed`],
  };
}

export function setTargetBid(c: Campaign, targetId: string, newBid: number): Campaign {
  assertValidBid('bid', newBid);
  return {
    ...c,
    targets: c.targets.map((t) =>
      t.id === targetId
        ? { ...t, bid: newBid }
        : t,
    ),
    history: [
      ...c.history,
      (() => {
        const t = c.targets.find((x) => x.id === targetId);
        return t
          ? `Bid for "${t.value}" (${t.type}) changed from $${t.bid.toFixed(2)} to $${newBid.toFixed(2)}`
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
  const t = c.targets.find((x) => x.id === targetId);
  if (!t) return c;
  return {
    ...c,
    targets: c.targets.map((x) =>
      x.id === targetId
        ? { ...x, status: (x.status === 'Paused' ? 'Enabled' : 'Paused') as CampaignStatus }
        : x,
    ),
    history: [
      ...c.history,
      `Target "${t.value}" (${t.type}) ${t.status === 'Paused' ? 'enabled' : 'paused'}`,
    ],
  };
}

export function setTargetStatus(c: Campaign, targetId: string, status: CampaignStatus): Campaign {
  const t = c.targets.find((x) => x.id === targetId);
  if (!t) return c;
  return {
    ...c,
    targets: c.targets.map((x) => (x.id === targetId ? { ...x, status } : x)),
    history: [...c.history, `Target "${t.value}" status -> ${status}`],
  };
}