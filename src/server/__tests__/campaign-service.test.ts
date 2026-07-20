/**
 * Server campaign engine tests — run against an in-memory fake implementing
 * the CampaignDb contract, so no live database is needed.
 */
import { describe, it, expect } from 'vitest';
import { normalizeCampaign } from '@/engine/ad-console/core/engine';
import type { Campaign } from '@/engine/ad-console/core/types';
import { ValidationError } from '@/lib/validation';
import type { CampaignDb, CampaignRecord, CampaignRowData } from '../db';
import { campaignToRow, rowToCampaign } from '../campaign-serializer';
import {
  listCampaigns,
  getCampaign,
  createCampaign,
  updateCampaign,
  deleteCampaign,
  syncCampaigns,
  simulateAccount,
  NotFoundError,
  ConflictError,
} from '../campaign-service';

// ---------------------------------------------------------------------------
// In-memory fake db
// ---------------------------------------------------------------------------

interface FakeDb extends CampaignDb {
  rows: Map<string, CampaignRecord>;
  simulations: Array<{ userId: string; days: number; results: string | null }>;
}

function createFakeDb(): FakeDb {
  const rows = new Map<string, CampaignRecord>();
  const simulations: FakeDb['simulations'] = [];
  let seq = 0;

  const materialize = (data: CampaignRowData): CampaignRecord => ({
    ...data,
    id: `row-${++seq}`,
    createdAt: new Date(Date.now() + seq), // stable, strictly increasing
    updatedAt: new Date(),
  });

  const db: FakeDb = {
    rows,
    simulations,
    campaign: {
      async findMany({ where, orderBy }) {
        const list = [...rows.values()].filter((r) => r.userId === where.userId);
        if (orderBy?.createdAt === 'desc') {
          list.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
        }
        return list;
      },
      async findFirst({ where }) {
        return (
          [...rows.values()].find(
            (r) => r.userId === where.userId && r.campaignId === where.campaignId,
          ) ?? null
        );
      },
      async create({ data }) {
        const rec = materialize(data);
        rows.set(rec.id, rec);
        return rec;
      },
      async update({ where, data }) {
        const rec = rows.get(where.id);
        if (!rec) throw new Error(`No row ${where.id}`);
        Object.assign(rec, data, { updatedAt: new Date() });
        return rec;
      },
      async upsert({ where, create, update }) {
        const key = where.userId_campaignId;
        const existing = [...rows.values()].find(
          (r) => r.userId === key.userId && r.campaignId === key.campaignId,
        );
        if (existing) {
          Object.assign(existing, update, { updatedAt: new Date() });
          return existing;
        }
        const rec = materialize(create);
        rows.set(rec.id, rec);
        return rec;
      },
      async delete({ where }) {
        const rec = rows.get(where.id);
        if (!rec) throw new Error(`No row ${where.id}`);
        rows.delete(where.id);
        return rec;
      },
      async deleteMany({ where }) {
        let count = 0;
        for (const [id, r] of rows) {
          if (r.userId !== where.userId) continue;
          if (where.campaignId && where.campaignId.notIn.includes(r.campaignId)) continue;
          rows.delete(id);
          count++;
        }
        return { count };
      },
    },
    simulation: {
      async create({ data }) {
        simulations.push(data);
        return data;
      },
    },
    async $transaction(fn) {
      return fn(db);
    },
  };
  return db;
}

const USER = 'user-1';

function makeCampaign(overrides: Partial<Campaign> = {}): Campaign {
  return normalizeCampaign({
    id: 'C-SP-1',
    type: 'SP',
    name: 'Test campaign',
    status: 'Enabled',
    dailyBudget: 25,
    defaultBid: 0.75,
    ...overrides,
  });
}

// ---------------------------------------------------------------------------
// Serializer
// ---------------------------------------------------------------------------

describe('campaign serializer', () => {
  it('round-trips the full engine shape including productAds, ads, and creative status', () => {
    const campaign = makeCampaign({
      type: 'SB',
      creativeStatus: 'In review',
      creativeIssue: 'Logo too small',
      createdBySimulator: false,
    });
    const row: CampaignRecord = {
      ...campaignToRow(USER, campaign),
      id: 'row-1',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const restored = rowToCampaign(row);

    expect(restored.id).toBe(campaign.id);
    expect(restored.type).toBe('SB');
    expect(restored.adGroups).toEqual(campaign.adGroups);
    expect(restored.productAds).toEqual(campaign.productAds);
    expect(restored.ads).toEqual(campaign.ads);
    expect(restored.creativeStatus).toBe('In review');
    expect(restored.creativeIssue).toBe('Logo too small');
    expect(restored.createdBySimulator).toBe(false);
    expect(restored.metrics).toEqual(campaign.metrics);
  });

  it('tolerates corrupt JSON columns instead of throwing', () => {
    const campaign = makeCampaign();
    const row: CampaignRecord = {
      ...campaignToRow(USER, campaign),
      id: 'row-1',
      createdAt: new Date(),
      updatedAt: new Date(),
      targets: '{not json',
      metrics: 'also not json',
    };
    const restored = rowToCampaign(row);
    expect(restored.targets).toEqual([]);
    expect(restored.metrics).toEqual({ impressions: 0, clicks: 0, spend: 0, sales: 0, orders: 0 });
  });
});

// ---------------------------------------------------------------------------
// CRUD
// ---------------------------------------------------------------------------

describe('campaign service CRUD', () => {
  it('creates, gets, and lists campaigns addressed by engine campaign id', async () => {
    const db = createFakeDb();
    const created = await createCampaign(db, USER, makeCampaign());
    expect(created.id).toBe('C-SP-1');

    const fetched = await getCampaign(db, USER, 'C-SP-1');
    expect(fetched.name).toBe('Test campaign');

    const all = await listCampaigns(db, USER);
    expect(all).toHaveLength(1);
  });

  it('rejects a duplicate campaign id with ConflictError', async () => {
    const db = createFakeDb();
    await createCampaign(db, USER, makeCampaign());
    await expect(createCampaign(db, USER, makeCampaign())).rejects.toBeInstanceOf(ConflictError);
  });

  it('rejects invalid input with ValidationError', async () => {
    const db = createFakeDb();
    await expect(
      createCampaign(db, USER, { ...makeCampaign(), dailyBudget: 0.5 }),
    ).rejects.toBeInstanceOf(ValidationError);
    await expect(
      createCampaign(db, USER, { ...makeCampaign(), name: '  ' }),
    ).rejects.toBeInstanceOf(ValidationError);
    await expect(
      createCampaign(db, USER, { ...makeCampaign(), type: 'XX' as Campaign['type'] }),
    ).rejects.toBeInstanceOf(ValidationError);
  });

  it('patches a campaign and persists the merge', async () => {
    const db = createFakeDb();
    await createCampaign(db, USER, makeCampaign());
    const updated = await updateCampaign(db, USER, 'C-SP-1', {
      name: 'Renamed',
      dailyBudget: 50,
      status: 'Paused',
    });
    expect(updated.name).toBe('Renamed');
    expect(updated.dailyBudget).toBe(50);
    expect(updated.status).toBe('Paused');

    const reloaded = await getCampaign(db, USER, 'C-SP-1');
    expect(reloaded.name).toBe('Renamed');
  });

  it('rejects invalid patches and missing campaigns', async () => {
    const db = createFakeDb();
    await createCampaign(db, USER, makeCampaign());
    await expect(
      updateCampaign(db, USER, 'C-SP-1', { defaultBid: 0.01 }),
    ).rejects.toBeInstanceOf(ValidationError);
    await expect(
      updateCampaign(db, USER, 'C-MISSING', { name: 'x' }),
    ).rejects.toBeInstanceOf(NotFoundError);
  });

  it('deletes by engine id and 404s on unknown ids', async () => {
    const db = createFakeDb();
    await createCampaign(db, USER, makeCampaign());
    await deleteCampaign(db, USER, 'C-SP-1');
    expect(await listCampaigns(db, USER)).toHaveLength(0);
    await expect(deleteCampaign(db, USER, 'C-SP-1')).rejects.toBeInstanceOf(NotFoundError);
  });

  it('never leaks campaigns across users', async () => {
    const db = createFakeDb();
    await createCampaign(db, USER, makeCampaign());
    expect(await listCampaigns(db, 'someone-else')).toHaveLength(0);
    await expect(getCampaign(db, 'someone-else', 'C-SP-1')).rejects.toBeInstanceOf(NotFoundError);
  });

  it('skips corrupt rows in list instead of failing the account view', async () => {
    const db = createFakeDb();
    await createCampaign(db, USER, makeCampaign());
    const bad = await db.campaign.create({
      data: { ...campaignToRow(USER, makeCampaign({ id: 'C-SP-2' })), type: 'BOGUS' },
    });
    expect(bad.type).toBe('BOGUS');
    const list = await listCampaigns(db, USER);
    expect(list).toHaveLength(1);
    expect(list[0].id).toBe('C-SP-1');
  });
});

// ---------------------------------------------------------------------------
// Sync
// ---------------------------------------------------------------------------

describe('syncCampaigns', () => {
  it('upserts in place (preserving row ids) and prunes deleted campaigns', async () => {
    const db = createFakeDb();
    const a = makeCampaign({ id: 'C-SP-A', name: 'A' });
    const b = makeCampaign({ id: 'C-SP-B', name: 'B' });
    await syncCampaigns(db, USER, [a, b]);
    expect(db.rows.size).toBe(2);
    const rowIdForA = [...db.rows.values()].find((r) => r.campaignId === 'C-SP-A')!.id;

    // Second sync: A renamed, B gone
    const result = await syncCampaigns(db, USER, [{ ...a, name: 'A renamed' }]);
    expect(result.synced).toBe(1);
    expect(db.rows.size).toBe(1);
    const remaining = [...db.rows.values()][0];
    expect(remaining.id).toBe(rowIdForA); // updated, not delete-all + recreate
    expect(remaining.name).toBe('A renamed');
  });

  it('rejects a non-array payload', async () => {
    const db = createFakeDb();
    await expect(syncCampaigns(db, USER, { nope: true })).rejects.toBeInstanceOf(ValidationError);
  });

  it('does not prune other users campaigns', async () => {
    const db = createFakeDb();
    await syncCampaigns(db, 'other-user', [makeCampaign({ id: 'C-OTHER' })]);
    await syncCampaigns(db, USER, [makeCampaign({ id: 'C-MINE' })]);
    expect(await listCampaigns(db, 'other-user')).toHaveLength(1);
  });
});

// ---------------------------------------------------------------------------
// Server-side simulation
// ---------------------------------------------------------------------------

describe('simulateAccount', () => {
  it('runs the engine simulation, persists results, and records an audit row', async () => {
    const db = createFakeDb();
    await createCampaign(db, USER, makeCampaign({ status: 'Enabled', dailyBudget: 40 }));

    const { days, campaigns } = await simulateAccount(db, USER, 7);
    expect(days).toBe(7);
    expect(campaigns[0].metrics.spend).toBeGreaterThan(0);
    expect(campaigns[0].metrics.impressions).toBeGreaterThan(0);

    // persisted
    const reloaded = await getCampaign(db, USER, 'C-SP-1');
    expect(reloaded.metrics.spend).toBeCloseTo(campaigns[0].metrics.spend, 2);

    // audited
    expect(db.simulations).toHaveLength(1);
    expect(db.simulations[0].userId).toBe(USER);
    expect(db.simulations[0].days).toBe(7);
    expect(JSON.parse(db.simulations[0].results!)[0].id).toBe('C-SP-1');
  });

  it('leaves paused campaigns untouched', async () => {
    const db = createFakeDb();
    await createCampaign(db, USER, makeCampaign({ status: 'Paused' }));
    const { campaigns } = await simulateAccount(db, USER, 7);
    expect(campaigns[0].metrics.spend).toBe(0);
  });

  it('validates the day count', async () => {
    const db = createFakeDb();
    await expect(simulateAccount(db, USER, 0)).rejects.toBeInstanceOf(ValidationError);
    await expect(simulateAccount(db, USER, 91)).rejects.toBeInstanceOf(ValidationError);
    await expect(simulateAccount(db, USER, 2.5)).rejects.toBeInstanceOf(ValidationError);
  });
});
