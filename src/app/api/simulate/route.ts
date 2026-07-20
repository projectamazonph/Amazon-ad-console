import { NextResponse } from 'next/server';
import { campaignDb, requireUserId, errorResponse } from '@/server/api-helpers';
import { simulateAccount } from '@/server/campaign-service';

// POST /api/simulate { days } — run the engine's day simulation server-side
// over the signed-in user's account, persist results, and record an audit row.
export async function POST(request: Request) {
  const userId = await requireUserId();
  if (userId instanceof NextResponse) return userId;

  try {
    const body = await request.json().catch(() => ({}));
    const days = body?.days ?? 7;
    const result = await simulateAccount(campaignDb, userId, days);
    return NextResponse.json(result);
  } catch (error) {
    return errorResponse(error);
  }
}
