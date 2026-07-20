/**
 * Ad group CRUD operations.
 */
import type { Campaign, CampaignStatus, AdGroup, ProductAd, Ad } from '../types';
import { assertNonEmpty, ValidationError } from '../../../../lib/validation';
import { generateId } from './id';
import { clampBid } from './metrics';

export function addAdGroup(c: Campaign, name: string, defaultBid?: number): Campaign {
  assertNonEmpty('ad group name', name);
  const ag: AdGroup = {
    id: generateId('AG'),
    campaignId: c.id,
    name: name.trim(),
    status: 'Enabled',
    defaultBid: defaultBid ?? c.defaultBid ?? 0.75,
    metrics: { impressions: 0, clicks: 0, spend: 0, sales: 0, orders: 0 },
  };
  return {
    ...c,
    adGroups: [...c.adGroups, ag],
    history: [...c.history, `Ad group "${ag.name}" created`],
  };
}

export function addProductAd(c: Campaign, adGroupId: string, asin: string): Campaign {
  const ag = c.adGroups.find((a) => a.id === adGroupId);
  if (!ag) throw new ValidationError(`Unknown ad group: ${adGroupId}`);
  const pa: ProductAd = {
    id: generateId('PA'),
    campaignId: c.id,
    adGroupId,
    asin,
    status: 'Enabled',
    metrics: { impressions: 0, clicks: 0, spend: 0, sales: 0, orders: 0 },
  };
  return {
    ...c,
    productAds: [...c.productAds, pa],
    history: [...c.history, `Product ad ${asin} added to ad group "${ag.name}"`],
  };
}

export function addAd(c: Campaign, adGroupId: string, adFormat: Ad['adFormat'], creative: Ad['creative']): Campaign {
  const ag = c.adGroups.find((a) => a.id === adGroupId);
  if (!ag) throw new ValidationError(`Unknown ad group: ${adGroupId}`);
  const ad: Ad = {
    id: generateId('AD'),
    campaignId: c.id,
    adGroupId,
    adFormat,
    status: 'Enabled',
    creative,
    metrics: { impressions: 0, clicks: 0, spend: 0, sales: 0, orders: 0 },
  };
  return {
    ...c,
    ads: [...c.ads, ad],
    history: [...c.history, `Ad (${adFormat}) added to ad group "${ag.name}"`],
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
  const ag = c.adGroups.find((a) => a.id === adGroupId);
  if (!ag) throw new ValidationError(`Unknown ad group: ${adGroupId}`);
  const clamped = clampBid(defaultBid);
  return {
    ...c,
    adGroups: c.adGroups.map((a) =>
      a.id === adGroupId ? { ...a, defaultBid: clamped } : a,
    ),
    history: [...c.history, `Ad group "${ag.name}" default bid -> $${clamped.toFixed(2)}`],
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
    productAds: c.productAds.filter((pa) => pa.adGroupId !== adGroupId),
    ads: c.ads.filter((a) => a.adGroupId !== adGroupId),
    history: [...c.history, `Ad group "${ag.name}" removed`],
  };
}
