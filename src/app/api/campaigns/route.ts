import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { safeJsonParse } from '@/lib/json';

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const campaigns = await prisma.campaign.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'desc' },
  });

  // Parse JSON fields — a corrupted value in one row falls back to an
  // empty default instead of throwing and 500ing the entire list.
  const parsed = campaigns.map((c: any) => ({
    ...c,
    placements: safeJsonParse(c.placements, null),
    products: safeJsonParse(c.products, []),
    creative: safeJsonParse(c.creative, null),
    metrics: safeJsonParse(c.metrics, null),
    adGroups: safeJsonParse(c.adGroups, []),
    targets: safeJsonParse(c.targets, []),
    searchTerms: safeJsonParse(c.searchTerms, []),
    negatives: safeJsonParse(c.negatives, []),
    budgetRules: safeJsonParse(c.budgetRules, []),
    history: safeJsonParse(c.history, []),
  }));

  return NextResponse.json(parsed);
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const data = await request.json();
  const { campaignId, ...rest } = data;

  const campaign = await prisma.campaign.create({
    data: {
      userId: session.user.id,
      campaignId,
      type: rest.type || 'SP',
      name: rest.name || 'Untitled Campaign',
      portfolio: rest.portfolio,
      status: rest.status || 'Enabled',
      dailyBudget: rest.dailyBudget || 25,
      defaultBid: rest.defaultBid || 0.75,
      startDate: rest.startDate,
      endDate: rest.endDate,
      targetingMode: rest.targetingMode,
      adFormat: rest.adFormat,
      campaignGoal: rest.campaignGoal,
      bidStrategy: rest.bidStrategy,
      placements: rest.placements ? JSON.stringify(rest.placements) : null,
      products: rest.products ? JSON.stringify(rest.products) : null,
      creative: rest.creative ? JSON.stringify(rest.creative) : null,
      metrics: rest.metrics ? JSON.stringify(rest.metrics) : null,
      adGroups: rest.adGroups ? JSON.stringify(rest.adGroups) : null,
      targets: rest.targets ? JSON.stringify(rest.targets) : null,
      searchTerms: rest.searchTerms ? JSON.stringify(rest.searchTerms) : null,
      negatives: rest.negatives ? JSON.stringify(rest.negatives) : null,
      budgetRules: rest.budgetRules ? JSON.stringify(rest.budgetRules) : null,
      history: rest.history ? JSON.stringify(rest.history) : null,
    },
  });

  return NextResponse.json(campaign, { status: 201 });
}
