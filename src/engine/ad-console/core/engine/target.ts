/**
 * Target/keyword operations — add, remove, bid, pause.
 */
import type { Campaign, CampaignStatus, MatchType, Target } from '../types';
import { assertNonEmpty, assertFiniteNonNegative, ValidationError } from '../../../../lib/validation';
import { generateId } from './id';

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
