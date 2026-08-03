import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { safeJsonParse } from '@/lib/json';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const campaign = await prisma.campaign.findFirst({
    where: {
      id,
      userId: session.user.id,
    },
  });

  if (!campaign) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  // Parse JSON fields — a corrupted value falls back to an empty default
  // instead of throwing and 500ing the request.
  const parsed = {
    ...campaign,
    placements: safeJsonParse(campaign.placements, null),
    products: safeJsonParse(campaign.products, []),
    creative: safeJsonParse(campaign.creative, null),
    metrics: safeJsonParse(campaign.metrics, null),
    adGroups: safeJsonParse(campaign.adGroups, []),
    targets: safeJsonParse(campaign.targets, []),
    searchTerms: safeJsonParse(campaign.searchTerms, []),
    negatives: safeJsonParse(campaign.negatives, []),
    budgetRules: safeJsonParse(campaign.budgetRules, []),
    history: safeJsonParse(campaign.history, []),
  };

  return NextResponse.json(parsed);
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const data = await request.json();

  // Verify ownership
  const existing = await prisma.campaign.findFirst({
    where: {
      id,
      userId: session.user.id,
    },
  });

  if (!existing) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  // Update JSON fields
  const updateData: Record<string, unknown> = {};
  if (data.placements !== undefined) updateData.placements = JSON.stringify(data.placements);
  if (data.products !== undefined) updateData.products = JSON.stringify(data.products);
  if (data.creative !== undefined) updateData.creative = JSON.stringify(data.creative);
  if (data.metrics !== undefined) updateData.metrics = JSON.stringify(data.metrics);
  if (data.adGroups !== undefined) updateData.adGroups = JSON.stringify(data.adGroups);
  if (data.targets !== undefined) updateData.targets = JSON.stringify(data.targets);
  if (data.searchTerms !== undefined) updateData.searchTerms = JSON.stringify(data.searchTerms);
  if (data.negatives !== undefined) updateData.negatives = JSON.stringify(data.negatives);
  if (data.budgetRules !== undefined) updateData.budgetRules = JSON.stringify(data.budgetRules);
  if (data.history !== undefined) updateData.history = JSON.stringify(data.history);

  // Update scalar fields
  const scalarFields = ['type', 'name', 'portfolio', 'status', 'dailyBudget', 'defaultBid', 
    'startDate', 'endDate', 'targetingMode', 'adFormat', 'campaignGoal', 'bidStrategy'];
  for (const field of scalarFields) {
    if (data[field] !== undefined) updateData[field] = data[field];
  }

  const campaign = await prisma.campaign.update({
    where: { id, userId: session.user.id },
    data: updateData,
  });

  return NextResponse.json(campaign);
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Verify ownership
  const existing = await prisma.campaign.findFirst({
    where: {
      id,
      userId: session.user.id,
    },
  });

  if (!existing) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  await prisma.campaign.delete({
    where: { id, userId: session.user.id },
  });

  return NextResponse.json({ message: 'Deleted' });
}
