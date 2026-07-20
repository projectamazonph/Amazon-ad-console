import { NextResponse } from 'next/server';
import { campaignDb, requireUserId, errorResponse } from '@/server/api-helpers';
import { listCampaigns, syncCampaigns } from '@/server/campaign-service';

// POST /api/sync — reconcile the client's account state with the server.
// Upserts every incoming campaign and prunes ones the client deleted, in one
// transaction (no destructive delete-all).
export async function POST(request: Request) {
  const userId = await requireUserId();
  if (userId instanceof NextResponse) return userId;

  try {
    const { campaigns } = await request.json();
    const result = await syncCampaigns(campaignDb, userId, campaigns);
    return NextResponse.json(result);
  } catch (error) {
    return errorResponse(error);
  }
}

// GET /api/sync — load the account's campaigns in engine shape
export async function GET() {
  const userId = await requireUserId();
  if (userId instanceof NextResponse) return userId;

  try {
    return NextResponse.json(await listCampaigns(campaignDb, userId));
  } catch (error) {
    return errorResponse(error);
  }
}
