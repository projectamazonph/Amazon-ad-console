import { NextResponse } from 'next/server';
import { campaignDb, requireUserId, errorResponse } from '@/server/api-helpers';
import {
  getCampaign,
  updateCampaign,
  deleteCampaign,
} from '@/server/campaign-service';

type Params = { params: Promise<{ id: string }> };

// The [id] segment is the engine campaign id (e.g. "C-SP-1"), the same id the
// UI shows — not the internal database row id.

export async function GET(_request: Request, { params }: Params) {
  const { id } = await params;
  const userId = await requireUserId();
  if (userId instanceof NextResponse) return userId;

  try {
    return NextResponse.json(await getCampaign(campaignDb, userId, id));
  } catch (error) {
    return errorResponse(error);
  }
}

export async function PATCH(request: Request, { params }: Params) {
  const { id } = await params;
  const userId = await requireUserId();
  if (userId instanceof NextResponse) return userId;

  try {
    const patch = await request.json();
    return NextResponse.json(await updateCampaign(campaignDb, userId, id, patch));
  } catch (error) {
    return errorResponse(error);
  }
}

// PUT kept as an alias for older clients.
export const PUT = PATCH;

export async function DELETE(_request: Request, { params }: Params) {
  const { id } = await params;
  const userId = await requireUserId();
  if (userId instanceof NextResponse) return userId;

  try {
    await deleteCampaign(campaignDb, userId, id);
    return NextResponse.json({ message: 'Deleted' });
  } catch (error) {
    return errorResponse(error);
  }
}
