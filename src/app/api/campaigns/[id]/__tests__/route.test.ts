/**
 * Tests for /api/campaigns/[id] ownership scoping.
 *
 * PUT and DELETE verified ownership via a separate `findFirst({ id, userId })`
 * check, but the mutating `update`/`delete` calls used `where: { id }` alone —
 * a defense-in-depth gap where any future refactor that separates the check
 * from the mutation could let one user modify another user's campaign by id.
 * The fix scopes the mutation itself by `userId` too.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

const { prismaMock, authMock } = vi.hoisted(() => {
  const prismaMock = {
    campaign: {
      findFirst: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  };
  const authMock = vi.fn();
  return { prismaMock, authMock };
});

vi.mock('@/lib/prisma', () => ({
  prisma: prismaMock,
}));

vi.mock('@/lib/auth', () => ({
  auth: authMock,
}));

import { PUT, DELETE } from '../route';

const USER = { user: { id: 'user-1' } };
const params = Promise.resolve({ id: 'campaign-1' });

function putRequest(body: unknown): Request {
  return new Request('http://localhost/api/campaigns/campaign-1', {
    method: 'PUT',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  authMock.mockResolvedValue(USER);
  prismaMock.campaign.findFirst.mockResolvedValue({ id: 'campaign-1', userId: 'user-1' });
  prismaMock.campaign.update.mockResolvedValue({ id: 'campaign-1' });
  prismaMock.campaign.delete.mockResolvedValue({ id: 'campaign-1' });
});

describe('PUT /api/campaigns/[id]', () => {
  it('scopes the update to the authenticated user, not just the ownership check', async () => {
    await PUT(putRequest({ name: 'Renamed' }), { params });
    expect(prismaMock.campaign.update).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 'campaign-1', userId: 'user-1' } }),
    );
  });

  it('rejects unauthenticated requests with 401 and never touches the DB', async () => {
    authMock.mockResolvedValueOnce(null);
    const res = await PUT(putRequest({ name: 'x' }), { params });
    expect(res.status).toBe(401);
    expect(prismaMock.campaign.update).not.toHaveBeenCalled();
  });

  it('returns 404 when the campaign is not owned by the caller', async () => {
    prismaMock.campaign.findFirst.mockResolvedValueOnce(null);
    const res = await PUT(putRequest({ name: 'x' }), { params });
    expect(res.status).toBe(404);
    expect(prismaMock.campaign.update).not.toHaveBeenCalled();
  });
});

describe('DELETE /api/campaigns/[id]', () => {
  it('scopes the delete to the authenticated user, not just the ownership check', async () => {
    await DELETE(new Request('http://localhost/api/campaigns/campaign-1', { method: 'DELETE' }), { params });
    expect(prismaMock.campaign.delete).toHaveBeenCalledWith({ where: { id: 'campaign-1', userId: 'user-1' } });
  });

  it('returns 404 when the campaign is not owned by the caller', async () => {
    prismaMock.campaign.findFirst.mockResolvedValueOnce(null);
    const res = await DELETE(new Request('http://localhost/api/campaigns/campaign-1', { method: 'DELETE' }), { params });
    expect(res.status).toBe(404);
    expect(prismaMock.campaign.delete).not.toHaveBeenCalled();
  });
});
