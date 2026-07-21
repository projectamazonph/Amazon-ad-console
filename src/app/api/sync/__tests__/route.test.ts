/**
 * Tests for /api/sync POST atomicity (audit B-03).
 *
 * The original implementation did `deleteMany` then `createMany` outside a
 * transaction, so a single bad record or transient DB error left the user
 * with an empty cloud account while their previous snapshot was already
 * gone. The fix wraps both operations in `prisma.$transaction(async tx => …)`
 * and returns 500 with the previous data preserved on any failure.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

// ---- Mocks (must be hoisted before the route import) ----

const { prismaMock, txMock, authMock } = vi.hoisted(() => {
  // Prisma's interactive transaction callback receives a transaction client
  // shaped like the top-level client, so the route calls `tx.campaign.deleteMany`
  // and `tx.campaign.createMany` — NOT a flat `tx.deleteMany`.
  const txMock = {
    campaign: {
      deleteMany: vi.fn(),
      createMany: vi.fn(),
    },
  };
  const prismaMock = {
    $transaction: vi.fn(async (fn: (tx: typeof txMock) => Promise<unknown>) => fn(txMock)),
    campaign: {
      findMany: vi.fn(),
    },
  };
  const authMock = vi.fn();
  return { prismaMock, txMock, authMock };
});

vi.mock('@/lib/prisma', () => ({
  prisma: prismaMock,
}));

vi.mock('@/lib/auth', () => ({
  auth: authMock,
}));

// Import after mocks are in place.
import { POST, GET } from '../route';

const ORIGINAL_USER = { user: { id: 'user-1' } };

function makeRequest(body: unknown): Request {
  return new Request('http://localhost/api/sync', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: typeof body === 'string' ? body : JSON.stringify(body),
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  // clearAllMocks wipes mock implementations, so restore the transaction
  // shim and per-method defaults that the route relies on. Per-test
  // overrides via `mockResolvedValueOnce` / `mockRejectedValueOnce` come
  // AFTER this and take precedence for the first matching call.
  prismaMock.$transaction.mockImplementation(
    async (fn: (tx: typeof txMock) => Promise<unknown>) => fn(txMock),
  );
  authMock.mockResolvedValue(ORIGINAL_USER);
  txMock.campaign.deleteMany.mockResolvedValue({ count: 0 });
  txMock.campaign.createMany.mockResolvedValue({ count: 0 });
});

describe('POST /api/sync', () => {
  it('rejects unauthenticated requests with 401', async () => {
    authMock.mockResolvedValueOnce(null);
    const res = await POST(makeRequest({ campaigns: [] }));
    expect(res.status).toBe(401);
    expect(prismaMock.$transaction).not.toHaveBeenCalled();
  });

  it('rejects non-JSON bodies with 400', async () => {
    const res = await POST(makeRequest('not json'));
    expect(res.status).toBe(400);
    expect(prismaMock.$transaction).not.toHaveBeenCalled();
  });

  it('rejects payloads where `campaigns` is not an array', async () => {
    const res = await POST(makeRequest({ campaigns: { id: 'x' } }));
    expect(res.status).toBe(400);
    expect(prismaMock.$transaction).not.toHaveBeenCalled();
  });

  it('rejects rows missing a string id before entering the transaction', async () => {
    const res = await POST(makeRequest({ campaigns: [{ name: 'no id here' }] }));
    expect(res.status).toBe(400);
    expect(prismaMock.$transaction).not.toHaveBeenCalled();
  });

  it('rejects non-object rows before entering the transaction', async () => {
    const res = await POST(makeRequest({ campaigns: ['not-an-object', null] }));
    expect(res.status).toBe(400);
    expect(prismaMock.$transaction).not.toHaveBeenCalled();
  });

  it('writes all rows inside a single transaction (atomicity contract)', async () => {
    txMock.campaign.createMany.mockResolvedValueOnce({ count: 2 });
    const res = await POST(
      makeRequest({
        campaigns: [
          { id: 'c1', name: 'Alpha' },
          { id: 'c2', name: 'Bravo' },
        ],
      }),
    );

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ synced: 2 });

    // Both delete and createMany MUST be called through the interactive
    // transaction callback, not directly on the top-level client. This is
    // the audit's B-03 fix.
    expect(prismaMock.$transaction).toHaveBeenCalledTimes(1);
    expect(typeof prismaMock.$transaction.mock.calls[0][0]).toBe('function');
    expect(txMock.campaign.deleteMany).toHaveBeenCalledWith({ where: { userId: 'user-1' } });
    expect(txMock.campaign.createMany).toHaveBeenCalledTimes(1);
  });

  it('scopes the delete to the authenticated user (does not touch other users)', async () => {
    authMock.mockResolvedValueOnce({ user: { id: 'user-42' } });
    await POST(makeRequest({ campaigns: [] }));
    expect(txMock.campaign.deleteMany).toHaveBeenCalledWith({ where: { userId: 'user-42' } });
  });

  it('treats an empty payload as a valid clear-cloud action (still atomic)', async () => {
    const res = await POST(makeRequest({ campaigns: [] }));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ synced: 0 });
    expect(txMock.campaign.deleteMany).toHaveBeenCalled();
    expect(txMock.campaign.createMany).not.toHaveBeenCalled();
  });

  it('returns 500 and reports "previous cloud data preserved" on transaction failure', async () => {
    // Simulate the audit scenario: deleteMany succeeds, createMany blows up
    // mid-batch. With $transaction the DB should roll back, but the route
    // must still surface a 500 to the client and promise preservation.
    txMock.campaign.deleteMany.mockResolvedValueOnce({ count: 3 });
    txMock.campaign.createMany.mockRejectedValueOnce(new Error('connection reset'));
    prismaMock.$transaction.mockImplementationOnce(async (fn) => fn(txMock));

    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const res = await POST(
      makeRequest({ campaigns: [{ id: 'c1' }, { id: 'c2' }] }),
    );
    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body.error).toMatch(/preserved/i);
    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });

  it('serializes JSON-typed fields with JSON.stringify, not raw objects', async () => {
    txMock.campaign.createMany.mockResolvedValueOnce({ count: 1 });
    const placements = { top: 50, product: 25, rest: 25 };
    const metrics = { impressions: 100, clicks: 5, spend: 1.25, sales: 0, orders: 0 };
    await POST(
      makeRequest({
        campaigns: [
          {
            id: 'c1',
            name: 'Serialization Check',
            placements,
            metrics,
          },
        ],
      }),
    );

    const [args] = txMock.campaign.createMany.mock.calls[0] as [{ data: Array<Record<string, unknown>> }];
    expect(args.data[0].placements).toBe(JSON.stringify(placements));
    expect(args.data[0].metrics).toBe(JSON.stringify(metrics));
  });
});

describe('GET /api/sync', () => {
  it('returns parsed campaigns for the authenticated user', async () => {
    prismaMock.campaign.findMany.mockResolvedValueOnce([
      {
        campaignId: 'c1',
        type: 'SP',
        name: 'Alpha',
        portfolio: null,
        status: 'Enabled',
        dailyBudget: 25,
        defaultBid: 0.75,
        startDate: null,
        endDate: null,
        targetingMode: null,
        adFormat: null,
        campaignGoal: null,
        bidStrategy: null,
        placements: JSON.stringify({ top: 0, product: 0, rest: 0 }),
        products: null,
        creative: null,
        metrics: null,
        adGroups: null,
        targets: null,
        searchTerms: null,
        negatives: null,
        budgetRules: null,
        history: null,
      },
    ]);
    const res = await GET();
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toHaveLength(1);
    expect(body[0]).toMatchObject({ id: 'c1', name: 'Alpha' });
    expect(body[0].placements).toEqual({ top: 0, product: 0, rest: 0 });
  });

  it('rejects unauthenticated GET with 401', async () => {
    authMock.mockResolvedValueOnce(null);
    const res = await GET();
    expect(res.status).toBe(401);
  });
});
