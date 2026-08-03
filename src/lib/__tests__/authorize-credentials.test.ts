/**
 * Tests for the extracted authorizeCredentials login logic.
 *
 * Covers: case-insensitive email matching (so accounts registered with
 * mixed-case emails before normalization can still log in), fail-closed
 * behavior on an ambiguous case-insensitive match, and runtime type
 * guards on the credentials NextAuth hands in (not compile-time enforced).
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

const { prismaMock, bcryptMock } = vi.hoisted(() => ({
  prismaMock: {
    user: {
      findMany: vi.fn(),
    },
  },
  bcryptMock: {
    compare: vi.fn(),
  },
}));

vi.mock('../prisma', () => ({
  prisma: prismaMock,
}));

vi.mock('bcryptjs', () => ({
  default: bcryptMock,
}));

import { authorizeCredentials } from '../authorize-credentials';

beforeEach(() => {
  vi.clearAllMocks();
  prismaMock.user.findMany.mockResolvedValue([]);
  bcryptMock.compare.mockResolvedValue(false);
});

describe('authorizeCredentials', () => {
  it('returns null when email or password is missing or not a string', async () => {
    expect(await authorizeCredentials(undefined)).toBeNull();
    expect(await authorizeCredentials({})).toBeNull();
    expect(await authorizeCredentials({ email: 'a@b.com' })).toBeNull();
    expect(await authorizeCredentials({ email: 12345 as unknown as string, password: 'x' })).toBeNull();
  });

  it('looks up the user case-insensitively with a normalized email', async () => {
    await authorizeCredentials({ email: '  Foo@Example.COM  ', password: 'x' });
    expect(prismaMock.user.findMany).toHaveBeenCalledWith({
      where: { email: { equals: 'foo@example.com', mode: 'insensitive' } },
    });
  });

  it('returns null when no user matches', async () => {
    prismaMock.user.findMany.mockResolvedValueOnce([]);
    expect(await authorizeCredentials({ email: 'a@b.com', password: 'x' })).toBeNull();
  });

  it('fails closed instead of picking one when multiple users match case-insensitively', async () => {
    prismaMock.user.findMany.mockResolvedValueOnce([
      { id: 'u1', email: 'Foo@example.com', passwordHash: 'h1' },
      { id: 'u2', email: 'foo@example.com', passwordHash: 'h2' },
    ]);
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const result = await authorizeCredentials({ email: 'foo@example.com', password: 'x' });
    expect(result).toBeNull();
    expect(bcryptMock.compare).not.toHaveBeenCalled();
    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });

  it('returns null when the password does not match', async () => {
    prismaMock.user.findMany.mockResolvedValueOnce([{ id: 'u1', email: 'a@b.com', passwordHash: 'hashed' }]);
    bcryptMock.compare.mockResolvedValueOnce(false);
    expect(await authorizeCredentials({ email: 'a@b.com', password: 'wrong' })).toBeNull();
  });

  it('returns the user on a successful match, matching a legacy mixed-case row', async () => {
    prismaMock.user.findMany.mockResolvedValueOnce([{ id: 'u1', email: 'Foo@Example.com', name: 'Foo', passwordHash: 'hashed' }]);
    bcryptMock.compare.mockResolvedValueOnce(true);
    const result = await authorizeCredentials({ email: 'foo@example.com', password: 'correct' });
    expect(result).toEqual({ id: 'u1', email: 'Foo@Example.com', name: 'Foo' });
  });
});
