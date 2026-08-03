import { NextResponse } from 'next/server';
import type { Prisma } from '@/generated/prisma/client';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { safeJsonParse } from '@/lib/json';

/**
 * Wire shape of a campaign as the browser sends it in the sync payload.
 * Defined locally so this file typechecks before `prisma generate` has run
 * (the generated client is gitignored). The Prisma layer is the source of
 * truth for what's actually persisted.
 */
type WireCampaign = { id?: unknown } & Record<string, unknown>;

// POST /api/sync - Sync all campaigns from local state to database
//
// Atomicity contract: either every campaign in `campaigns` is written and the
// user's previous cloud snapshot is fully replaced, or no write happens at all.
// On any failure inside the transaction (validation, DB error, partial insert)
// the original cloud state is preserved.
//
// Audit B-03 fix: previous implementation ran `deleteMany` followed by
// `createMany` outside a transaction, so a single bad record could leave the
// user with an empty cloud account while their previous data was already gone.
export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = session.user.id;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { campaigns } = (body ?? {}) as { campaigns?: unknown };
  if (!Array.isArray(campaigns)) {
    return NextResponse.json({ error: 'Invalid data' }, { status: 400 });
  }

  // Reject obviously malformed rows up front so we never enter the
  // transaction with input that cannot be written. Per-row validation stays
  // inside the transaction so we still benefit from atomic rollback if the
  // DB rejects something the JS layer can't catch.
  const rows: Prisma.CampaignCreateManyInput[] = [];
  for (const c of campaigns as any[]) {
    if (!c || typeof c !== 'object') {
      return NextResponse.json(
        { error: 'Invalid campaign record: expected object' },
        { status: 400 },
      );
    }
    const wire = c as WireCampaign;
    if (typeof wire.id !== 'string' || wire.id.length === 0) {
      return NextResponse.json(
        { error: 'Invalid campaign record: missing string id' },
        { status: 400 },
      );
    }
    rows.push({
      userId,
      campaignId: wire.id,
      type: c.type || 'SP',
      name: c.name || 'Untitled',
      portfolio: c.portfolio,
      status: c.status || 'Enabled',
      dailyBudget: c.dailyBudget ?? 25,
      defaultBid: c.defaultBid ?? 0.75,
      startDate: c.startDate,
      endDate: c.endDate,
      targetingMode: c.targetingMode,
      adFormat: c.adFormat,
      campaignGoal: c.campaignGoal,
      bidStrategy: c.bidStrategy,
      placements: c.placements ? JSON.stringify(c.placements) : null,
      products: c.products ? JSON.stringify(c.products) : null,
      creative: c.creative ? JSON.stringify(c.creative) : null,
      metrics: c.metrics ? JSON.stringify(c.metrics) : null,
      adGroups: c.adGroups ? JSON.stringify(c.adGroups) : null,
      targets: c.targets ? JSON.stringify(c.targets) : null,
      searchTerms: c.searchTerms ? JSON.stringify(c.searchTerms) : null,
      negatives: c.negatives ? JSON.stringify(c.negatives) : null,
      budgetRules: c.budgetRules ? JSON.stringify(c.budgetRules) : null,
      history: c.history ? JSON.stringify(c.history) : null,
    });
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      // Delete inside the transaction so the rollback path restores the
      // user's previous snapshot. We do NOT touch other users' data because
      // userId is in the where clause.
      await tx.campaign.deleteMany({ where: { userId } });

      // Empty payload is a valid "clear cloud" action: still atomic, still
      // inside the transaction, still scoped to this user.
      if (rows.length === 0) {
        return { synced: 0 };
      }

      const created = await tx.campaign.createMany({ data: rows });
      return { synced: created.count };
    });

    return NextResponse.json(result);
  } catch (err) {
    // Log on the server, do not leak DB internals to the client.
    console.error('[sync] atomic replace failed; user cloud state preserved', {
      userId,
      error: err instanceof Error ? err.message : String(err),
    });
    return NextResponse.json(
      { error: 'Sync failed; previous cloud data preserved' },
      { status: 500 },
    );
  }
}

// GET /api/sync - Load campaigns from database
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = session.user.id;

  const campaigns = await prisma.campaign.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  });

  // Parse JSON fields — a corrupted value in one row falls back to an
  // empty default instead of throwing and 500ing the entire list.
  const parsed = campaigns.map((c: any) => ({
    id: c.campaignId,
    type: c.type,
    name: c.name,
    portfolio: c.portfolio,
    status: c.status,
    dailyBudget: c.dailyBudget,
    defaultBid: c.defaultBid,
    startDate: c.startDate,
    endDate: c.endDate,
    targetingMode: c.targetingMode,
    adFormat: c.adFormat,
    campaignGoal: c.campaignGoal,
    bidStrategy: c.bidStrategy,
    placements: safeJsonParse(c.placements, { top: 0, product: 0, rest: 0 }),
    products: safeJsonParse(c.products, []),
    creative: safeJsonParse(c.creative, null),
    metrics: safeJsonParse(c.metrics, { impressions: 0, clicks: 0, spend: 0, sales: 0, orders: 0 }),
    adGroups: safeJsonParse(c.adGroups, []),
    targets: safeJsonParse(c.targets, []),
    searchTerms: safeJsonParse(c.searchTerms, []),
    negatives: safeJsonParse(c.negatives, []),
    budgetRules: safeJsonParse(c.budgetRules, []),
    history: safeJsonParse(c.history, []),
  }));

  return NextResponse.json(parsed);
}
