import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

// POST /api/sync - Sync all campaigns from local state to database
export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = session.user.id;
  const { campaigns } = await request.json();
  
  if (!Array.isArray(campaigns)) {
    return NextResponse.json({ error: 'Invalid data' }, { status: 400 });
  }

  // Delete existing campaigns for this user
  await prisma.campaign.deleteMany({
    where: { userId },
  });

  // Insert all campaigns
  const created = await prisma.campaign.createMany({
    data: campaigns.map((c: any) => ({
      userId,
      campaignId: c.id,
      type: c.type || 'SP',
      name: c.name || 'Untitled',
      portfolio: c.portfolio,
      status: c.status || 'Enabled',
      dailyBudget: c.dailyBudget || 25,
      defaultBid: c.defaultBid || 0.75,
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
    })),
  });

  return NextResponse.json({ synced: created.count });
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

  // Parse JSON fields
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
    placements: c.placements ? JSON.parse(c.placements) : { top: 0, product: 0, rest: 0 },
    products: c.products ? JSON.parse(c.products) : [],
    creative: c.creative ? JSON.parse(c.creative) : null,
    metrics: c.metrics ? JSON.parse(c.metrics) : { impressions: 0, clicks: 0, spend: 0, sales: 0, orders: 0 },
    adGroups: c.adGroups ? JSON.parse(c.adGroups) : [],
    targets: c.targets ? JSON.parse(c.targets) : [],
    searchTerms: c.searchTerms ? JSON.parse(c.searchTerms) : [],
    negatives: c.negatives ? JSON.parse(c.negatives) : [],
    budgetRules: c.budgetRules ? JSON.parse(c.budgetRules) : [],
    history: c.history ? JSON.parse(c.history) : [],
  }));

  return NextResponse.json(parsed);
}
