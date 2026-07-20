/**
 * Ad group CRUD operations.
 */
import type { Campaign, CampaignStatus, AdGroup } from '../types';
import { assertNonEmpty, assertFiniteNonNegative, ValidationError } from '../../../../lib/validation';
import { generateId } from './id';

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
