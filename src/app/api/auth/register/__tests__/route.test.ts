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
      findFirst: vi.fn(),
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
import { Prisma } from '@/generated/prisma/client';

function makeRequest(body: unknown): Request {
  return new Request('http://localhost/api/auth/register', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  prismaMock.user.findFirst.mockResolvedValue(null);
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

  it('normalizes email casing/whitespace before checking for an existing user', async () => {
    await POST(makeRequest({ email: '  Foo@Example.COM  ', password: 'longenough' }));
    expect(prismaMock.user.findFirst).toHaveBeenCalledWith({
      where: { email: { equals: 'foo@example.com', mode: 'insensitive' } },
    });
  });

  it('stores the normalized email, not the raw input casing', async () => {
    await POST(makeRequest({ email: 'Foo@Example.COM', password: 'longenough' }));
    const [args] = prismaMock.user.create.mock.calls[0] as [{ data: { email: string } }];
    expect(args.data.email).toBe('foo@example.com');
  });

  it('treats a case-variant of an existing email as a duplicate', async () => {
    prismaMock.user.findFirst.mockResolvedValueOnce({ id: 'existing-user' });
    const res = await POST(makeRequest({ email: 'FOO@example.com', password: 'longenough' }));
    expect(res.status).toBe(400);
    expect(prismaMock.user.create).not.toHaveBeenCalled();
  });

  it('treats a concurrent duplicate registration (unique constraint race) as "already exists", not a 500', async () => {
    // findFirst didn't see it yet, but create() hits the DB's unique
    // constraint because another request won the race in between.
    prismaMock.user.create.mockRejectedValueOnce(
      new Prisma.PrismaClientKnownRequestError('Unique constraint failed on the fields: (`email`)', {
        code: 'P2002',
        clientVersion: 'test',
      }),
    );
    const res = await POST(makeRequest({ email: 'a@b.com', password: 'longenough' }));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toMatch(/already exists/i);
  });

  it('still returns 500 for a create() failure that is not a unique constraint violation', async () => {
    prismaMock.user.create.mockRejectedValueOnce(new Error('connection reset'));
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const res = await POST(makeRequest({ email: 'a@b.com', password: 'longenough' }));
    expect(res.status).toBe(500);
    consoleSpy.mockRestore();
  });
});
