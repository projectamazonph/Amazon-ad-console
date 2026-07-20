/**
 * Server-side campaign engine.
 *
 * The same pure engine that drives the browser (normalizeCampaign,
 * simulateDays) runs here against the database, so a signed-in user's account
 * behaves like the real Ads console: the server is the source of truth,
 * mutations are validated, and simulation can run (and is audited) server-side.
 */
import type { Campaign } from '@/engine/ad-console/core/types';
import { simulateDays, normalizeCampaign } from '@/engine/ad-console/core/engine';
import {
  ValidationError,
  assertCampaignType,
  assertCampaignStatus,
  assertNonEmpty,
} from '@/lib/validation';
import type { CampaignDb, CampaignRecord } from './db';
import { campaignToRow, rowToCampaign } from './campaign-serializer';

export class NotFoundError extends Error {
  constructor(message = 'Not found') {
    super(message);
    this.name = 'NotFoundError';
  }
}

export class ConflictError extends Error {
  constructor(message = 'Conflict') {
    super(message);
    this.name = 'ConflictError';
  }
}

export const MIN_DAILY_BUDGET = 1;
export const MIN_BID = 0.02;
export const MAX_SIMULATION_DAYS = 90;

/**
 * Validate client-supplied campaign fields. With partial=true only the fields
 * present are checked (PATCH semantics); otherwise required fields must exist.
 */
export function validateCampaignInput(
  input: Record<string, unknown>,
  { partial = false }: { partial?: boolean } = {},
): void {
  if (input == null || typeof input !== 'object') {
    throw new ValidationError('Request body must be an object');
  }
  if (!partial || input.name !== undefined) {
    assertNonEmpty('name', String(input.name ?? ''));
  }
  if (!partial || input.type !== undefined) {
    assertCampaignType(String(input.type ?? 'SP'));
  }
  if (input.status !== undefined) {
    assertCampaignStatus(String(input.status));
  }
  if (input.dailyBudget !== undefined) {
    const budget = Number(input.dailyBudget);
    if (!Number.isFinite(budget) || budget < MIN_DAILY_BUDGET) {
      throw new ValidationError(`dailyBudget must be at least $${MIN_DAILY_BUDGET}`);
    }
  }
  if (input.defaultBid !== undefined) {
    const bid = Number(input.defaultBid);
    if (!Number.isFinite(bid) || bid < MIN_BID) {
      throw new ValidationError(`defaultBid must be at least $${MIN_BID.toFixed(2)}`);
    }
  }
}

function safeRowToCampaign(row: CampaignRecord): Campaign | null {
  try {
    return rowToCampaign(row);
  } catch {
    // A corrupt row must not take down the whole account view.
    return null;
  }
}

export async function listCampaigns(db: CampaignDb, userId: string): Promise<Campaign[]> {
  const rows = await db.campaign.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  });
  return rows.map(safeRowToCampaign).filter((c): c is Campaign => c !== null);
}

export async function getCampaign(
  db: CampaignDb,
  userId: string,
  campaignId: string,
): Promise<Campaign> {
  const row = await db.campaign.findFirst({ where: { userId, campaignId } });
  if (!row) throw new NotFoundError(`Campaign ${campaignId} not found`);
  return rowToCampaign(row);
}

export async function createCampaign(
  db: CampaignDb,
  userId: string,
  input: Partial<Campaign>,
): Promise<Campaign> {
  validateCampaignInput(input as Record<string, unknown>);
  const campaign = normalizeCampaign(input);
  const existing = await db.campaign.findFirst({
    where: { userId, campaignId: campaign.id },
  });
  if (existing) throw new ConflictError(`Campaign ${campaign.id} already exists`);
  const row = await db.campaign.create({ data: campaignToRow(userId, campaign) });
  return rowToCampaign(row);
}

export async function updateCampaign(
  db: CampaignDb,
  userId: string,
  campaignId: string,
  patch: Partial<Campaign>,
): Promise<Campaign> {
  validateCampaignInput(patch as Record<string, unknown>, { partial: true });
  const row = await db.campaign.findFirst({ where: { userId, campaignId } });
  if (!row) throw new NotFoundError(`Campaign ${campaignId} not found`);

  const current = rowToCampaign(row);
  // Merge only known campaign fields; the id is immutable.
  const { id: _ignored, ...rest } = patch;
  const merged = normalizeCampaign({ ...current, ...rest, id: current.id });
  const updated = await db.campaign.update({
    where: { id: row.id },
    data: campaignToRow(userId, merged),
  });
  return rowToCampaign(updated);
}

export async function deleteCampaign(
  db: CampaignDb,
  userId: string,
  campaignId: string,
): Promise<void> {
  const row = await db.campaign.findFirst({ where: { userId, campaignId } });
  if (!row) throw new NotFoundError(`Campaign ${campaignId} not found`);
  await db.campaign.delete({ where: { id: row.id } });
}

/**
 * Full-account sync: upsert every incoming campaign and prune the ones the
 * client no longer has — transactionally, preserving row ids/createdAt.
 */
export async function syncCampaigns(
  db: CampaignDb,
  userId: string,
  incoming: unknown,
): Promise<{ synced: number; campaigns: Campaign[] }> {
  if (!Array.isArray(incoming)) {
    throw new ValidationError('campaigns must be an array');
  }
  const campaigns = incoming.map((c) => {
    try {
      return normalizeCampaign(c as Partial<Campaign>);
    } catch (e) {
      throw new ValidationError(
        `Invalid campaign payload: ${e instanceof Error ? e.message : String(e)}`,
      );
    }
  });

  await db.$transaction(async (tx) => {
    for (const campaign of campaigns) {
      const data = campaignToRow(userId, campaign);
      await tx.campaign.upsert({
        where: { userId_campaignId: { userId, campaignId: campaign.id } },
        create: data,
        update: data,
      });
    }
    await tx.campaign.deleteMany({
      where: { userId, campaignId: { notIn: campaigns.map((c) => c.id) } },
    });
  });

  return { synced: campaigns.length, campaigns: await listCampaigns(db, userId) };
}

/**
 * Run the engine's day simulation server-side over the user's account,
 * persist the results, and record an audit row in Simulation.
 */
export async function simulateAccount(
  db: CampaignDb,
  userId: string,
  days: number,
): Promise<{ days: number; campaigns: Campaign[] }> {
  const n = Number(days);
  if (!Number.isInteger(n) || n < 1 || n > MAX_SIMULATION_DAYS) {
    throw new ValidationError(`days must be an integer between 1 and ${MAX_SIMULATION_DAYS}`);
  }

  const rows = await db.campaign.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  });
  const pairs = rows
    .map((row) => ({ row, campaign: safeRowToCampaign(row) }))
    .filter((p): p is { row: CampaignRecord; campaign: Campaign } => p.campaign !== null);

  const simulated = simulateDays(pairs.map((p) => p.campaign), n);

  await db.$transaction(async (tx) => {
    for (let i = 0; i < pairs.length; i++) {
      await tx.campaign.update({
        where: { id: pairs[i].row.id },
        data: campaignToRow(userId, simulated[i]),
      });
    }
    await tx.simulation.create({
      data: {
        userId,
        days: n,
        results: JSON.stringify(
          simulated.map((c) => ({ id: c.id, name: c.name, metrics: c.metrics })),
        ),
      },
    });
  });

  return { days: n, campaigns: simulated };
}
