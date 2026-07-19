import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const campaign = await prisma.campaign.findFirst({
    where: {
      id: params.id,
      userId: session.user.id,
    },
  });

  if (!campaign) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  // Parse JSON fields
  const parsed = {
    ...campaign,
    placements: campaign.placements ? JSON.parse(campaign.placements) : null,
    products: campaign.products ? JSON.parse(campaign.products) : [],
    creative: campaign.creative ? JSON.parse(campaign.creative) : null,
    metrics: campaign.metrics ? JSON.parse(campaign.metrics) : null,
    adGroups: campaign.adGroups ? JSON.parse(campaign.adGroups) : [],
    targets: campaign.targets ? JSON.parse(campaign.targets) : [],
    searchTerms: campaign.searchTerms ? JSON.parse(campaign.searchTerms) : [],
    negatives: campaign.negatives ? JSON.parse(campaign.negatives) : [],
    budgetRules: campaign.budgetRules ? JSON.parse(campaign.budgetRules) : [],
    history: campaign.history ? JSON.parse(campaign.history) : [],
  };

  return NextResponse.json(parsed);
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const data = await request.json();

  // Verify ownership
  const existing = await prisma.campaign.findFirst({
    where: {
      id: params.id,
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
    where: { id: params.id },
    data: updateData,
  });

  return NextResponse.json(campaign);
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Verify ownership
  const existing = await prisma.campaign.findFirst({
    where: {
      id: params.id,
      userId: session.user.id,
    },
  });

  if (!existing) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  await prisma.campaign.delete({
    where: { id: params.id },
  });

  return NextResponse.json({ message: 'Deleted' });
}
