/**
 * Tests for /api/auth/register input validation.
 *
 * The route previously accepted any non-empty password (even 1 character)
 * and any string containing '@' as an "email", with no format check.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

const { prismaMock, bcryptMock } = vi.hoisted(() => ({
  prismaMock: {
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
  },
  bcryptMock: {
    hash: vi.fn(),
  },
}));

vi.mock('@/lib/prisma', () => ({
  prisma: prismaMock,
}));

vi.mock('bcryptjs', () => ({
  default: bcryptMock,
}));

import { POST } from '../route';

function makeRequest(body: unknown): Request {
  return new Request('http://localhost/api/auth/register', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  prismaMock.user.findUnique.mockResolvedValue(null);
  prismaMock.user.create.mockResolvedValue({ id: 'user-1' });
  bcryptMock.hash.mockResolvedValue('hashed');
});

describe('POST /api/auth/register', () => {
  it('rejects a password shorter than 8 characters', async () => {
    const res = await POST(makeRequest({ email: 'a@b.com', password: '1' }));
    expect(res.status).toBe(400);
    expect(prismaMock.user.create).not.toHaveBeenCalled();
  });

  it('rejects a malformed email', async () => {
    const res = await POST(makeRequest({ email: 'not-an-email', password: 'longenough' }));
    expect(res.status).toBe(400);
    expect(prismaMock.user.create).not.toHaveBeenCalled();
  });

  it('accepts a valid email and an 8+ character password', async () => {
    const res = await POST(makeRequest({ email: 'a@b.com', password: 'longenough' }));
    expect(res.status).toBe(201);
    expect(prismaMock.user.create).toHaveBeenCalledTimes(1);
  });
});
