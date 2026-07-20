/**
 * Shared plumbing for API route handlers: session guard + domain-error → HTTP
 * status mapping, so every route responds like a well-behaved REST API.
 */
import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { ValidationError } from '@/lib/validation';
import { NotFoundError, ConflictError } from './campaign-service';
import type { CampaignDb } from './db';
import { prisma } from '@/lib/prisma';

/** The shared PrismaClient viewed through the service layer's narrow contract. */
export const campaignDb = prisma as unknown as CampaignDb;

/** Resolve the signed-in user's id, or a 401 NextResponse the caller should return. */
export async function requireUserId(): Promise<string | NextResponse> {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  return session.user.id;
}

/** Map a domain/parse error to the right HTTP status (400/404/409), defaulting to 500. */
export function errorResponse(error: unknown): NextResponse {
  if (error instanceof ValidationError) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
  if (error instanceof NotFoundError) {
    return NextResponse.json({ error: error.message }, { status: 404 });
  }
  if (error instanceof ConflictError) {
    return NextResponse.json({ error: error.message }, { status: 409 });
  }
  if (error instanceof SyntaxError) {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }
  console.error('API error:', error);
  return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
}
