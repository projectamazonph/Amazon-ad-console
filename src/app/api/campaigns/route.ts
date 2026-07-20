import { NextResponse } from 'next/server';
import { campaignDb, requireUserId, errorResponse } from '@/server/api-helpers';
import { listCampaigns, createCampaign } from '@/server/campaign-service';

// GET /api/campaigns — the user's campaigns in full engine shape
export async function GET() {
  const userId = await requireUserId();
  if (userId instanceof NextResponse) return userId;

  try {
    return NextResponse.json(await listCampaigns(campaignDb, userId));
  } catch (error) {
    return errorResponse(error);
  }
}

// POST /api/campaigns — create one campaign (validated, 409 on duplicate id)
export async function POST(request: Request) {
  const userId = await requireUserId();
  if (userId instanceof NextResponse) return userId;

  try {
    const body = await request.json();
    const campaign = await createCampaign(campaignDb, userId, body);
    return NextResponse.json(campaign, { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}
