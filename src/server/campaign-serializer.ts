/**
 * Campaign ⇄ database row serialization.
 *
 * The engine's Campaign is a rich object graph; the Campaign table stores the
 * child collections as JSON columns. This module is the single place that
 * mapping lives, so every route round-trips the full engine shape.
 *
 * Deserialization is defensive: a corrupt JSON column falls back to a safe
 * default instead of throwing, and the result is passed through the engine's
 * normalizeCampaign so downstream code always sees a complete Campaign.
 */
import type { Campaign } from '@/engine/ad-console/core/types';
import { normalizeCampaign } from '@/engine/ad-console/core/engine';
import type { CampaignRecord, CampaignRowData } from './db';

/** Parse a JSON column, returning the fallback on null/empty/invalid content. */
function parseJson<T>(raw: string | null | undefined, fallback: T): T {
  if (raw == null || raw === '') return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

/** Serialize a value to a JSON column, storing null for null/undefined. */
function toJson(value: unknown): string | null {
  return value == null ? null : JSON.stringify(value);
}

/** Serialize an engine Campaign into row data for the given user. */
export function campaignToRow(userId: string, c: Campaign): CampaignRowData {
  return {
    userId,
    campaignId: c.id,
    type: c.type,
    name: c.name,
    portfolio: c.portfolio ?? null,
    portfolioId: c.portfolioId ?? null,
    status: c.status,
    dailyBudget: c.dailyBudget,
    defaultBid: c.defaultBid,
    startDate: c.startDate ?? null,
    endDate: c.endDate ?? null,
    targetingMode: c.targetingMode ?? null,
    adFormat: c.adFormat ?? null,
    campaignGoal: c.campaignGoal ?? null,
    bidStrategy: c.bidStrategy ?? null,
    creativeStatus: c.creativeStatus ?? null,
    creativeIssue: c.creativeIssue ?? null,
    createdBySimulator: c.createdBySimulator ?? false,
    placements: toJson(c.placements),
    products: toJson(c.products),
    creative: toJson(c.creative),
    metrics: toJson(c.metrics),
    adGroups: toJson(c.adGroups),
    targets: toJson(c.targets),
    searchTerms: toJson(c.searchTerms),
    negatives: toJson(c.negatives),
    budgetRules: toJson(c.budgetRules),
    productAds: toJson(c.productAds),
    ads: toJson(c.ads),
    history: toJson(c.history),
  };
}

/**
 * Deserialize a row back into a full engine Campaign.
 * Throws ValidationError (via normalizeCampaign) if type/status are invalid.
 */
export function rowToCampaign(row: CampaignRecord): Campaign {
  const partial: Partial<Campaign> = {
    id: row.campaignId,
    type: row.type as Campaign['type'],
    name: row.name,
    portfolio: row.portfolio ?? undefined,
    portfolioId: row.portfolioId ?? undefined,
    status: row.status as Campaign['status'],
    dailyBudget: row.dailyBudget,
    defaultBid: row.defaultBid,
    startDate: row.startDate ?? undefined,
    endDate: row.endDate,
    targetingMode: (row.targetingMode ?? undefined) as Campaign['targetingMode'],
    adFormat: (row.adFormat ?? undefined) as Campaign['adFormat'],
    campaignGoal: (row.campaignGoal ?? undefined) as Campaign['campaignGoal'],
    bidStrategy: (row.bidStrategy ?? undefined) as Campaign['bidStrategy'],
    creativeStatus: row.creativeStatus ?? undefined,
    creativeIssue: row.creativeIssue ?? undefined,
    createdBySimulator: row.createdBySimulator,
    placements: parseJson(row.placements, undefined as Campaign['placements'] | undefined),
    products: parseJson(row.products, []),
    creative: parseJson(row.creative, null),
    metrics: parseJson(row.metrics, undefined as Campaign['metrics'] | undefined),
    adGroups: parseJson(row.adGroups, []),
    targets: parseJson(row.targets, []),
    searchTerms: parseJson(row.searchTerms, []),
    negatives: parseJson(row.negatives, []),
    budgetRules: parseJson(row.budgetRules, []),
    productAds: parseJson(row.productAds, []),
    ads: parseJson(row.ads, []),
    history: parseJson(row.history, []),
  };
  return normalizeCampaign(partial);
}
